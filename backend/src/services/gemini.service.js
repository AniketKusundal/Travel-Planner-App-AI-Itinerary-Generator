const { GoogleGenerativeAI } = require("@google/generative-ai")


const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
)

const model = genAI.getGenerativeModel({
  model: 'gemini-3.5-flash'
})


// Extract Travel Deatils Form OCR Text

const extracteTravelData = async (text) => {

  try {
    const prompt = ` You are a travel booking parser.

    Extract travel information from the text below.

    Return ONLY valid JSON.

    Text:
    ${text}

    JSON Format:

    {
      "passengerName": "",
      "flightNumber": "",
      "origin": "",
      "destination": "",
      "travelDate": "",
      "departureTime": "",
      "arrivalTime": ""
    }`;

    const result = await model.generateContent(prompt)

    const response = result.response.text(prompt)

    return response;


  }
  catch (error) {
    throw new Error("Error Extracting Travel Data " + error.message)
  }
}



// Generate Itinerary
const generateItinerary = async (travelData) => {
  try {

    const prompt = `
        Create a professional travel itinerary.

        Travel Data:

        ${JSON.stringify(travelData)}

        Include:

        - Travel Summary
        - Arrival Information
        - Suggested Activities
        - Important Notes

        Format it properly.
    `;

    const result = await model.generateContent(prompt);

    const itinerary = result.response.text();

    return itinerary;

  }
  catch (error) {
    throw new Error("Error generating itinerary: " + error.message);
  }
};

module.exports = {
  extracteTravelData,
  generateItinerary,
};