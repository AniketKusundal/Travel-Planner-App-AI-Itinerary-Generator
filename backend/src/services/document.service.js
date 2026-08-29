const fs = require("fs");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const User = require("../models/user.model");
const Document = require("../models/Document.model");
const { uploadStreamToCloudinary } = require("../config/cloudinary");

const createDocument = async (userId, file) => {
  console.log("File received in memory:", file?.originalname);

  if (!file || (!file.buffer && !file.path)) {
    throw new Error("No File Uploaded");
  }

  let extractedText = "";
  const fileBuffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);

  if (!fileBuffer) {
    throw new Error("Invalid file content");
  }

  // OCR for Image files directly from memory buffer
  if (file.mimetype === "image/jpg" || file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
    console.log("Starting OCR with Tesseract from buffer...");
    const result = await Tesseract.recognize(fileBuffer, "eng");
    extractedText = result.data.text;
    console.log("OCR Extracted Length:", extractedText.length);
  }

  // Text extraction for PDF files directly from memory buffer
  if (file.mimetype === "application/pdf") {
    console.log("Parsing PDF from buffer...");
    const pdfData = await pdfParse(fileBuffer);
    extractedText = pdfData.text;
    console.log("PDF Extracted Length:", extractedText.length);
  }

  // Stream Upload directly to Cloudinary from memory (0 disk storage!)
  let finalFileUrl = "";
  const cloudinaryResult = await uploadStreamToCloudinary(fileBuffer, "travel_planner_docs");

  if (cloudinaryResult && cloudinaryResult.secure_url) {
    finalFileUrl = cloudinaryResult.secure_url;
    console.log("Streamed to Cloudinary successfully:", finalFileUrl);
  } else {
    throw new Error("Cloudinary upload failed. Please verify your Cloudinary API credentials in .env");
  }

  const document = await Document.create({
    userId,
    fileName: file.originalname,
    fileType: file.mimetype,
    fileUrl: finalFileUrl,
    extractedText: extractedText,
    status: "uploaded",
  });

  return document;
};

// Get All Documents
const getUserDocuments = async (userId) => {
  const documents = await Document.find({
    userId,
  }).sort({
    createdAt: -1,
  });

  return documents;
};

// Get Document By ID
const getDocumentById = async (documentId) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw new Error("Document Not Found");
  }

  return document;
};

// Delete Document
const deleteDocument = async (documentId) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw new Error("Document Not Found");
  }

  await Document.findByIdAndDelete(documentId);

  return {
    message: "Document Deleted Successfully",
  };
};

module.exports = {
  createDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
};