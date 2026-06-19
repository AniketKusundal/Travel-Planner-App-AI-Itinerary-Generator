const itineraryServices = require("../services/itinerary.service")
const pdfServices = require("../services/pdf.service")

const createItinerary = async(req , res) => {

    try 
    {
        const userId = req.user.id    

        const {documentId} = req.params

        const itinerary = await itineraryServices.createItinerary(
            userId ,
            documentId ,
        )

        return res.status(201).json({
            
            success : true ,
            message: "Itinerary Generated Successfully",
            data : itinerary 
        })
    } 
    catch (error) 
    {
        return res.status(400).json({
            success : false ,
            message: error.message,
        })
    }
}



const getUserItineraries = async (req, res) => {

    try {

        const userId = req.user.id;

        const itineraries =
            await itineraryServices.getUserItineraries(
                userId
            );

        return res.status(200).json({
            success: true,
            count: itineraries.length,
            data: itineraries,
        });

    }
    catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message,
        });

    }
};

const getItineraryById = async (req, res) => {
  try {

    const { id } = req.params;

    const itinerary = await itineraryServices.getItineraryById(
      id
    );

    return res.status(200).json({
      success: true,
      data: itinerary,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};


const shareItinerary = async (req, res) => {

    try {

        const { itineraryId } = req.params;

        const result = await itineraryServices.shareItinerary(
            itineraryId
        );

        return res.status(200).json({
            success: true,
            message: "Itinerary Shared Successfully",
            data: result,
        });

    }
    catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message,
        });

    }
};


const getPublicItinerary = async (req, res) => {

    try {

        const { shareId } = req.params;

        const itinerary =
            await itineraryServices.getPublicItinerary(
                shareId
            );

        return res.status(200).json({
            success: true,
            data: itinerary,
        });

    }
    catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message,
        });

    }
};

const exportItineraryPdf = async (req, res) => {

    try {

        const { id } = req.params;

        const pdf =
            await pdfServices.exportItineraryPdf(
                id
            );

        return res.download(
            pdf.filePath,
            pdf.fileName
        );

    }
    catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message,
        });

    }
};


const deleteItinerary = async (req, res) => {
    try {

        const { id } = req.params;

        await itineraryServices.deleteItinerary(id);

        return res.status(200).json({
            success: true,
            message: "Itinerary Deleted Successfully",
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message,
        });

    }
};



module.exports = { 
    createItinerary ,
    getUserItineraries ,
    getItineraryById ,
    shareItinerary ,
    getPublicItinerary ,
    exportItineraryPdf ,
    deleteItinerary
}