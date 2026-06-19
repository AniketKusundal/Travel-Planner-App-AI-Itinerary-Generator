const express = require("express")
const { createDocument , getDocumentById , getUserDocuments , deleteDocument } = require("../controllers/document.controller")


const authMiddleware = require("../middleware/auth.middleware")
const upload = require("../middleware/upload.middleware")

const router = express.Router()


router.post("/upload/document" , authMiddleware , upload.single("document") , createDocument)



router.get("/" , authMiddleware , getUserDocuments)


router.get("/:documentId" , authMiddleware , getDocumentById)


router.delete("/:documentId", authMiddleware , deleteDocument);


module.exports = router