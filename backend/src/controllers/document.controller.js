const documentServices = require("../services/document.service");

const createDocument = async (req, res) => {
  console.log("REQ FILE:", req.file);

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file was uploaded or invalid file format",
      });
    }

    const userId = req.user.id;
    const file = req.file;

    const document = await documentServices.createDocument(userId, file);

    return res.status(201).json({
      success: true,
      message: "File Uploaded Successfully",
      data: document,
    });
  } catch (error) {
    console.error("Upload controller error:", error);
    return res.status(400).json({
      success: false,
      message: "Error uploading document: " + error.message,
    });
  }
};

const getUserDocuments = async (req, res) => {
  try {
    const user = req.user.id;
    const documents = await documentServices.getUserDocuments(user);

    return res.status(200).json({
      success: true,
      message: "User Documents Fetched Successfully",
      data: documents,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await documentServices.getDocumentById(documentId);

    return res.status(200).json({
      success: true,
      message: "Document Data Fetched Successfully",
      data: document,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const result = await documentServices.deleteDocument(documentId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
};