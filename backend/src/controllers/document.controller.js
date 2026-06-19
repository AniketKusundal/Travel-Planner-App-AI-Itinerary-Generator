const documentServices = require("../services/document.service")


const createDocument =  async (req , res) => {
     console.log("REQ FILE:", req.file);

    try 
    {
        const userId = req.user.id
        const file = req.file


        const document = await documentServices.createDocument (
            userId ,
            file
        )

        return res.status(201).json({
            success : true ,
            Message : "File Uploaded Successfully",
            data : document ,
        })

        
    } 
    catch (error) {
        
        return res.status(400).json({
            success : false ,
            Message : "Error While Uploading Document " + error.message
        })
    }
}


const getUserDocuments = async(req , res) => {

    try {

        const user = req.user.id
        const documents = await documentServices.getUserDocuments(user)

        return res.status(200).json({
            Message :  "User Document Fetched Successfully",
            data : documents
        })
    } 
    catch (error) 
    {
        return res.status(400).json({
            Message : error.message
        })
    }
}



const getDocumentById = async (req , res) => {

    try 
    {
        const { documentId } = req.params

        const documents = await documentServices.getDocumentById(documentId)


        return res.status(200).json({
            Message : "Document Data Fetched Successfully" ,
            data : documents ,
        })
    } 
    catch (error) 
    {
        return res.status(400).json({
            Message : error.message 
        })
    }
}


const deleteDocument = async (req, res) => {

    try {

        const { documentId } = req.params;

        const result =
            await documentServices.deleteDocument(
                documentId
            );

        return res.status(200).json({
            success: true,
            message: result.message,
        });

    }
    catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message,
        });

    }
};


module.exports = {
    createDocument ,
    getUserDocuments ,
    getDocumentById ,
    deleteDocument
}