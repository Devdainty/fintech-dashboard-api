const multer = require("multer");

// Memory storage to stream directly to Cloudinary
const storage = multer.memoryStorage();

// Accepts MP4, WebM, and MOV MIME types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["video/mp4", "video/webm", "video/quicktime"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid video format! Only MP4, WebM, and MOV videos are allowed.",
      ),
      false,
    );
  }
};

const videoUpload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 1,
    fields: 0,
  },
  fileFilter,
});

module.exports = videoUpload;
