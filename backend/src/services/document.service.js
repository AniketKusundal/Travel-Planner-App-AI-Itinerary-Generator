const fs = require("fs")
const pdfParse = require("pdf-parse")
const Tesseract = require("tesseract.js") 
const User = require("../models/User.model")
const Document = require("../models/Document.model")


const createDocument = async (userId , file) => {

    console.log(" file recived " ,  file);
    
    if (!file) 
    {
        throw new Error("No File Uploaded")
    }

    let extractedText = ""

    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') 
    {
        console.log("Starting OCR");

        const result = await Tesseract.recognize(
            file.path ,
            "eng"
        )

        extractedText = result.data.text

        console.log("OCR RESULT");
        console.log(extractedText);    
    }

    //  Now for the PDF

    if(file.mimetype === 'application/pdf')
    {
         const pdfBuffer = fs.readFileSync(file.path);

         const pdfData = await pdfParse(pdfBuffer);

         extractedText = pdfData.text;

         console.log("PDF TEXT:");
         console.log(extractedText);
    }


    const document = await Document.create({
      userId,

      fileName: file.originalname,

      fileType: file.mimetype,

      fileUrl: file.path,

      extractedText: extractedText,

      status: "uploaded",
    });

    return document
}

// Get All Document
const getUserDocuments  = async (userId) => {

    const documents = await Document.find({
        userId ,
    }).sort({
        createdAt : -1 
    });

    return documents;
}

// Get Docment By ID
const getDocumentById  = async (documentId) => {
    
    const document = await Document.findById(
        documentId
    )

    if(!document)
    {
        throw new Error("Document Not Found")
    }


    return document;
}


//  Delete Document
const deleteDocument = async (documentId) => {

    const document = await Document.findById(
        documentId
    );

    if (!document) {
        throw new Error(
            "Document Not Found"
        );
    }

    // Delete File
    if (
        document.fileUrl &&
        fs.existsSync(document.fileUrl)
    ) {
        fs.unlinkSync(
            document.fileUrl
        );
    }

    // Delete Mongo Record
    await Document.findByIdAndDelete(
        documentId
    );

    return {
        message:
            "Document Deleted Successfully",
    };
};


module.exports = {
    createDocument ,
    getUserDocuments  ,
    getDocumentById  ,
    deleteDocument ,
}