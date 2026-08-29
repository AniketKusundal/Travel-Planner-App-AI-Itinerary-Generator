const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isCloudinaryConfigured = () => {
  return (
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET)
  );
};

const uploadToCloudinary = async (filePath, folder = "travel_documents") => {
  if (!isCloudinaryConfigured()) {
    console.log("Cloudinary keys not set");
    return null;
  }
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: "auto",
    });
    return result;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);
    return null;
  }
};

// Stream buffer directly to Cloudinary without writing to disk
const uploadStreamToCloudinary = (fileBuffer, folder = "travel_documents") => {
  return new Promise((resolve) => {
    if (!isCloudinaryConfigured()) {
      console.log("Cloudinary keys not set for memory upload");
      return resolve(null);
    }
    const stream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: "auto" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary stream error:", error.message);
          return resolve(null);
        }
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
  uploadStreamToCloudinary,
};
