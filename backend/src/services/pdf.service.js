const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const Itinerary = require("../models/Itinerary.model");




const exportItineraryPdf = async (itineraryId) => {
  // Find itinerary
  const itinerary = await Itinerary.findById(itineraryId);

  // Check itinerary exists
  if (!itinerary) {
    throw new Error("Itinerary Not Found");
  }

  const doc = new PDFDocument();

  const fileName = `itinerary-${itinerary._id}.pdf`;

  const filePath = path.join(__dirname, "../uploads", fileName);

  const writeStream = fs.createWriteStream(filePath);

  doc.pipe(writeStream);

  doc.fontSize(20).text(itinerary.title);

doc.moveDown();

doc.fontSize(14).text("Passenger Details");

doc.fontSize(12).text(
  `Passenger: ${itinerary.extractedData.passengerName}`
);

doc.text(
  `Flight: ${itinerary.extractedData.flightNumber}`
);

doc.text(
  `Origin: ${itinerary.extractedData.origin}`
);

doc.text(
  `Destination: ${itinerary.extractedData.destination}`
);

doc.text(
  `Travel Date: ${itinerary.extractedData.travelDate}`
);

  doc.text(`Generated At: ${new Date().toLocaleString()}`);

  doc.end();

await new Promise((resolve, reject) => {

    writeStream.on("finish", resolve);

    writeStream.on("error", reject);

});

return {
  fileName,
  filePath,
};

};


module.exports = {
    exportItineraryPdf , 
};

