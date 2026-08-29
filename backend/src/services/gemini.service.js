const { GoogleGenerativeAI } = require("@google/generative-ai");

// List of fallback models in priority order
const MODEL_CANDIDATES = [
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash-8b"
];

// Helper to execute prompt with model fallback
const generateWithModelFallback = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in backend/.env. Please add a valid API key from https://aistudio.google.com/app/apikey");
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());
  let lastError = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      console.log(`[Gemini AI] Calling model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) {
        console.log(`[Gemini AI] Success with model: ${modelName}`);
        return text;
      }
    } catch (err) {
      console.warn(`[Gemini AI] Model ${modelName} failed: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(`Google Gemini API call failed. Error details: ${lastError?.message || "Unknown error"}`);
};

// Helper regex parser for tickets when AI OCR extraction fails
const parseTicketWithRegex = (text = "") => {
  const flightMatch = text.match(/(?:flight|train|bus|no|#)?\s*([A-Z0-9]{2,4}\s*\d{3,4})/i);
  const nameMatch = text.match(/(?:passenger|name|mr|ms|mrs)\s*:?\s*([A-Z\s]{4,25})/i) || text.match(/([A-Z]{3,}\s+[A-Z]{3,})/);
  const dateMatch = text.match(/(\d{1,2}[\/\-\s](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{1,2})[\/\-\s]\d{2,4})/i);

  return {
    passengerName: nameMatch ? nameMatch[1].trim() : "Traveler",
    flightNumber: flightMatch ? flightMatch[1].trim() : "N/A",
    origin: "Origin Station/City",
    destination: "Destination City",
    travelDate: dateMatch ? dateMatch[1] : "Upcoming",
    departureTime: "N/A",
    arrivalTime: "N/A",
    numberOfTravelers: 1,
    budget: "Moderate",
    preferences: text.substring(0, 120).replace(/\s+/g, " ")
  };
};

// Extract Travel Details From OCR / PDF Text
const extracteTravelData = async (text) => {
  try {
    const prompt = `You are an expert travel booking parser.
Extract key travel details from the raw document text below.
Return ONLY valid JSON without markdown formatting.

Text:
${text}

JSON Schema:
{
  "passengerName": "Name or Unknown",
  "flightNumber": "Flight/Train/Bus number or N/A",
  "origin": "Origin city/location",
  "destination": "Destination city/location",
  "travelDate": "YYYY-MM-DD or readable date",
  "departureTime": "Departure time or N/A",
  "arrivalTime": "Arrival time or N/A",
  "numberOfTravelers": 1,
  "budget": "Estimated budget level if mentioned, else Moderate",
  "preferences": "Any special notes or preferences found"
}`;

    const responseText = (await generateWithModelFallback(prompt)).trim();
    const cleanedJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Error extracting travel data with AI, using regex parser:", error.message);
    return parseTicketWithRegex(text);
  }
};

// Generate Itinerary from parsed document data
const generateItinerary = async (travelData) => {
  const prompt = `You are a world-class luxury AI Travel Concierge.
Create a highly detailed, professional multi-day travel itinerary based on this travel data:

${JSON.stringify(travelData, null, 2)}

Formatting Instructions:
- Format Day-by-Day schedules and budget breakdowns as clean Markdown Tables (| Time / Period | Activity & Highlights | Location & Tips |).
- Do NOT use raw asterisks (*) for list bullets or bold formatting. Use clean text without asterisks.
- Return structured markdown with emoji headers.

Sections to include:
1. Executive Summary & Destination Overview
2. Flight & Arrival Logistics (in a Markdown Table)
3. Detailed Day-by-Day Itinerary (in Markdown Tables for each day)
4. Local Culinary & Dining Highlights (in a Markdown Table)
5. Budget Breakdown & Emergency Contacts (in Markdown Tables)`;

  return await generateWithModelFallback(prompt);
};

// Direct AI Custom Itinerary Generator (from prompt parameters)
const generateCustomItinerary = async ({ destination, duration, budget, vibe, interests }) => {
  const prompt = `You are an elite travel designer.
Generate a tailored ${duration}-day trip itinerary for ${destination}.

Trip Vibe: ${vibe || 'Balanced'}
Budget Level: ${budget || 'Moderate'}
Interests: ${interests || 'Culture, Food, Sights'}

Formatting Instructions:
- Format Day-by-Day schedules and budget breakdowns as clean Markdown Tables (| Time / Period | Activity & Highlights | Location & Tips |).
- Do NOT use raw asterisks (*) for text formatting or lists. Keep text clean and readable.

Sections to include:
1. Executive Summary & Destination Overview
2. Day 1 to Day ${duration} Detailed Schedules (using Markdown Tables for each day)
3. Culinary Highlights & Must-Try Dishes (in a Markdown Table)
4. Budget Breakdown & Insider Tips (in Markdown Tables)`;

  return await generateWithModelFallback(prompt);
};

// Smart AI Packing List Generator
const generatePackingList = async ({ destination, duration, climate, activities }) => {
  try {
    const prompt = `You are a smart travel packing assistant.
Generate a comprehensive, categorized packing list for a ${duration}-day trip to ${destination}.
Climate/Weather: ${climate || 'Typical seasonal'}
Planned Activities: ${activities || 'General sightseeing'}

Return ONLY a valid JSON object matching this schema:
{
  "destination": "${destination}",
  "climateSummary": "Short weather summary",
  "categories": [
    {
      "name": "Clothing & Footwear",
      "items": ["Item 1", "Item 2"]
    },
    {
      "name": "Electronics & Tech",
      "items": ["Item 1", "Item 2"]
    },
    {
      "name": "Documents & Money",
      "items": ["Item 1", "Item 2"]
    },
    {
      "name": "Toiletries & Health",
      "items": ["Item 1", "Item 2"]
    },
    {
      "name": "Weather & Activity Gear",
      "items": ["Item 1", "Item 2"]
    }
  ]
}`;

    const responseText = (await generateWithModelFallback(prompt)).trim();
    const cleanedJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Error generating packing list:", error.message);
    return {
      destination,
      climateSummary: climate || "Seasonal weather",
      categories: [
        { name: "Essentials", items: ["Passport / ID", "Boarding Passes / Tickets", "Phone & Charger", "Credit Cards & Local Cash"] },
        { name: "Clothing", items: ["Daily outfits", "Comfortable walking shoes", "Weather jacket", "Sleepwear"] },
        { name: "Toiletries", items: ["Toothbrush & toothpaste", "Sunscreen", "Personal medication", "Travel pouch"] }
      ]
    };
  }
};

module.exports = {
  extracteTravelData,
  generateItinerary,
  generateCustomItinerary,
  generatePackingList,
};