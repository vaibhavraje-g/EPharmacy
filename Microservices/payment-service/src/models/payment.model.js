const mongoose = require("mongoose");
const connectDB = require("../config/db.config");
const fs = require("fs");
const path = require("path");

// Schema
const PaymentSchema = new mongoose.Schema(
  {
    orderValueAfterDiscount: { type: Number, required: true },

    customer: {
      customerId: { type: Number, required: true },
    },

    card: {
      cardId: { type: String, required: true },
      nameOnCard: { type: String, required: true },
      cardType: { type: String, enum: ["DEBIT", "CREDIT"], required: true },
      cvv: { type: String, required: true, minlength: 3, maxlength: 4 },
      expiryDate: { type: Date, required: true },
    },

    paymentStatus: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Completed", "Failed"],
    },
  },
  { timestamps: true }
);

// Models
const dbModels = {};
dbModels.Payment = mongoose.model("Payment", PaymentSchema);

// Function to populate payments data
async function populatePayments() {
  try {
    await connectDB();

    // Load initial data from the default.json file
    const defaultDataPath = path.join(__dirname, "./default.json");
    const rawData = fs.readFileSync(defaultDataPath, "utf-8");
    const { payments } = JSON.parse(rawData);

    await dbModels.Payment.deleteMany(); // Clear existing data
    await dbModels.Payment.create(payments); // Populate the database with initial data

    console.log("Payment created successfully");
  } catch (err) {
    console.error("Error populating payments:", err.message);
  }
}

populatePayments();

module.exports = dbModels;
