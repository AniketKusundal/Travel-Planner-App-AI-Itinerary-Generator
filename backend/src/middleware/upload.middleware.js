const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("src", "uploads"));
  },

  filename: (req, file, cb) => {

    const uniqueFileName = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

    cb(null, uniqueFileName);
  },
});

//  Allow File Names

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, JPEG and PNG files are allowed"), false);
  }
};

// Multer Instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

module.exports = upload;