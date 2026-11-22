const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const { deleteCloudinaryAsset } = require("../utils/cloudinaryCleanup");

// Helper function to upload the file buffer to Cloudinary using a Promise
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "fintech-dashboard/profile-images",
        transformation: [
          { width: 300, height: 300, crop: "fill", gravity: "face" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
};

exports.uploadProfileImage = async (req, res) => {
  let newlyUploadedPublicId = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image file to upload.",
      });
    }

    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const uploadResult = await streamUpload(req.file.buffer);

    newlyUploadedPublicId = uploadResult.public_id;

    const oldPublicId = user.profileImagePublicId;

    user.profileImage = uploadResult.secure_url;
    user.profileImagePublicId = uploadResult.public_id;
    await user.save();

    if (oldPublicId) {
      await deleteCloudinaryAsset(oldPublicId, "image", "upload");
    }

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully!",
      profileImage: user.profileImage,
    });
  } catch (err) {
    if (newlyUploadedPublicId) {
      console.log(
        "Database update failed. Cleaning up newly uploaded image...",
      );
      await deleteCloudinaryAsset(newlyUploadedPublicId, "image", "upload");
    }

    return res.status(500).json({
      success: false,
      message: "Profile replacement failed: " + err.message,
    });
  }
};
