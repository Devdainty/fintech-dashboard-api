const cloudinary = require("../config/cloudinary");

const deleteCloudinaryAsset = async (
  publicId,
  resourceType = "image",
  deliveryType = "upload",
) => {
  if (!publicId) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      type: deliveryType,
    });
    console.log(`Cloudinary asset deleted [${publicId}]:`, result);
    return result;
  } catch (error) {
    console.error(
      `Failed to clean up Cloudinary asset [${publicId}]:`,
      error.message,
    );
  }
};

module.exports = { deleteCloudinaryAsset };
