const mongoose = require("mongoose");
const connectDB = require("../config/db.config");
const fs = require("fs");
const path = require("path");

// Schema
const medicineSchema = new mongoose.Schema(
  {
    medicineId: { type: Number, required: true, unique: true },
    medicineName: { type: String, required: true },
    manufacturer: { type: String, required: true },
    category: { type: String, required: true },
    manufacturingDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

// Models
const dbModels = {};
dbModels.Medicines = mongoose.model("Medicines", medicineSchema);

// Function to populate medicines data
async function populateMedicines() {
  try {
    await connectDB();

    // Load initial data from the default.json file
    const defaultDataPath = path.join(__dirname, "./default.json");
    const rawData = fs.readFileSync(defaultDataPath, "utf-8");
    const { medicines } = JSON.parse(rawData);

    await dbModels.Medicines.deleteMany(); // Clear existing data
    await dbModels.Medicines.create(medicines); // Populate the database with initial data

    console.log("Medicines created successfully");
  } catch (err) {
    console.error("Error populating medicines:", err.message);
  }
}

populateMedicines();

module.exports = dbModels;
