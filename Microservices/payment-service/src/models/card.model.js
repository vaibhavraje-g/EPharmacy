const mongoose = require("mongoose");
const connectDB = require("../config/db.config");
const fs = require("fs");
const path = require("path");

// Card Schema
const CardSchema = new mongoose.Schema(
    {
      cardId: { type: String, required: true, unique: true },
      nameOnCard: { type: String, required: false },
      cardType: {
        type: String,
        enum: ["DEBIT", "CREDIT"],
        required: true,
      },
      cvv: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 4,
      },
      expiryDate: {
        type: Date,
        required: true,
      },
      customerId: {
        type: Number,
        required: true,
      },
    },
    { timestamps: true }
  );
  
  // Models
  const dbModels = {};
  dbModels.Card = mongoose.model("Card", CardSchema);

// Function to populate cards data
async function populateCards() {
  try {
    await connectDB();

    // Load initial data from the default.json file
    const defaultDataPath = path.join(__dirname, "./default.json");
    const rawData = fs.readFileSync(defaultDataPath, "utf-8");
    const { cards } = JSON.parse(rawData);

    await dbModels.Card.deleteMany(); // Clear existing data
    await dbModels.Card.create(cards); // Populate the database with initial data

    console.log("Card created successfully");
  } catch (err) {
    console.error("Error populating cards:", err.message);
  }
}

populateCards();

module.exports = dbModels;
