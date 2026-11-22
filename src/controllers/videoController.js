const FileType = require("file-type");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const { deleteCloudinaryAsset } = require("../utils/cloudinaryCleanup");

// Helper to stream upload video buffer as an authenticated asset
const uploadVideoToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "fintech-dashboard/verification-videos",
        resource_type: "video",
        type: "authenticated", // PRIVATELY STORED!
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
};

exports.uploadVerificationVideo = async (req, res) => {
  let newlyUploadedPublicId = null;

  try {
    if (!req.file) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please select a verification video.",
        });
    }

    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const currentStatus = user.verificationVideo?.status || "not_submitted";
    if (currentStatus === "pending_review") {
      return res.status(400).json({
        success: false,
        message:
          "Your verification video is currently pending review. You cannot upload a new one.",
      });
    }
    if (currentStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Your identity is already approved and verified.",
      });
    }

    const detectedType = await FileType.fromBuffer(req.file.buffer);
    const validSignatures = ["video/mp4", "video/webm", "video/quicktime"];

    if (!detectedType || !validSignatures.includes(detectedType.mime)) {
      return res.status(400).json({
        success: false,
        message:
          "Security validation failed: File content does not match a valid MP4, WebM, or MOV video.",
      });
    }

    const uploadResult = await uploadVideoToCloudinary(req.file.buffer);
    newlyUploadedPublicId = uploadResult.public_id;

    if (uploadResult.duration && uploadResult.duration > 60) {
      await deleteCloudinaryAsset(
        newlyUploadedPublicId,
        "video",
        "authenticated",
      );
      return res.status(400).json({
        success: false,
        message: `Video is too long (${Math.round(uploadResult.duration)}s). Maximum allowed length is 60 seconds.`,
      });
    }

    const oldVideoPublicId = user.verificationVideo?.publicId;

    user.verificationVideo = {
      publicId: uploadResult.public_id,
      resourceType: "video",
      deliveryType: "authenticated",
      format: uploadResult.format,
      fileSize: uploadResult.bytes,
      duration: Math.round(uploadResult.duration || 0),
      status: "pending_review",
      uploadedAt: new Date(),
    };

    await user.save();

    if (oldVideoPublicId) {
      deleteCloudinaryAsset(oldVideoPublicId, "video", "authenticated");
    }

    return res.status(200).json({
      success: true,
      message:
        "Verification video submitted successfully and is now pending review!",
      verification: {
        status: user.verificationVideo.status,
        duration: user.verificationVideo.duration,
        format: user.verificationVideo.format,
        uploadedAt: user.verificationVideo.uploadedAt,
      },
    });
  } catch (err) {
    if (newlyUploadedPublicId) {
      console.log("Error occurred. Cleaning up newly uploaded video...");
      await deleteCloudinaryAsset(
        newlyUploadedPublicId,
        "video",
        "authenticated",
      );
    }

    return res.status(500).json({
      success: false,
      message: "Video upload failed: " + err.message,
    });
  }
};
