const cardModel = require("../models/card.model");
const paymentModel = require("../models/payment.model");
const apiHelper = require("../utilities/api.helper");
const Opossum = require("opossum");
const logger = require("../utilities/logger");

// Circuit breaker options
const circuitBreakerOptions = {
  timeout: 30000, // Timeout of 30 seconds for each request
  errorThresholdPercentage: 50, // Threshold for failures to trigger the circuit
  resetTimeout: 60000, // Reset the circuit breaker after 1 minute
  rollingCountTimeout: 30000, // Rolling window for counting errors (30 seconds)
  rollingCountBuckets: 1, // Bucket size for tracking error count
};

let cvvFailureCount = 0; // Track CVV failure count

// Circuit breaker definition
const circuit = new Opossum(async (req, res) => {
  const { cardId, nameOnCard, cardType, cvv, expiryDate, customerId } =
    req.body;
  const { amountToPay } = req.params;

  try {
    // Check if amount to pay is provided
    if (!amountToPay || isNaN(amountToPay) || amountToPay <= 0) {
      logger.error("Invalid or missing amountToPay", { requestData: req.body });
      return res
        .status(400)
        .json({ message: "Invalid or missing amountToPay" });
    }

    // Verify customer
    const customerExists = await apiHelper.checkCustomer(customerId);
    if (!customerExists) {
      logger.error("Invalid customerId", { customerId });
      return res.status(400).json({ message: "Invalid customerId" });
    }

    // Verify card details
    const cardDetails = await cardModel.Card.findOne({ cardId });
    if (!cardDetails) {
      logger.error("Card not found", { cardId, customerId });
      return res.status(400).json({ message: "Card not found" });
    } else if (cardDetails.cvv !== String(cvv)) {
      // Increment CVV failure count
      cvvFailureCount++;
      if (cvvFailureCount >= 3) {
        // If CVV fails 3 times in 30 seconds, open the circuit breaker
        logger.error(
          "CVV failure threshold reached, circuit breaker triggered",
          { cvvFailureCount, cardId, customerId }
        );
        circuit.open(); // Open the circuit breaker
      }
      return res.status(400).json({ message: "Incorrect CVV" });
    }

    // Reset CVV failure count if payment is successful
    cvvFailureCount = 0;

    // Create a new payment document
    const newOrder = await paymentModel.Payment.create({
      orderValueAfterDiscount: parseFloat(amountToPay),
      customer: { customerId },
      card: { cardId, nameOnCard, cardType, cvv, expiryDate, customerId },
      paymentStatus: "Completed",
    });

    res
      .status(201)
      .json({ message: "Order placed successfully", data: newOrder });
  } catch (error) {
    // Log the error and provide a generic response
    logger.error("Payment processing failed", {
      error: error.message,
      requestData: req.body,
    });
    res
      .status(500)
      .json({
        message: "Internal Server Error",
        errorId: generateErrorId(),
        error: error.message,
      });
  }
}, circuitBreakerOptions);

// Payment endpoint handler
exports.payAmount = (req, res) => {
  circuit.fire(req, res).catch((error) => {
    // Log the service unavailability error
    logger.error("Payment service is unavailable", { error: error.message });
    res.status(500).json({
      message: "Payment service is currently unavailable",
      errorId: generateErrorId(),
      error: error.message,
    });
  });
};

// Event listeners for the circuit breaker
circuit.on("open", () => {
  logger.warn("Circuit is open. Payment attempts are blocked for 1 minute.");
});

circuit.on("halfOpen", () => {
  logger.info("Circuit is half-open. Next request will test the service.");
});

circuit.on("close", () => {
  logger.info("Circuit is closed. Service is back to normal.");
});

// Utility function to generate a unique errorId for easier debugging
function generateErrorId() {
  return `ERR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// View Cards - Fetch all cards for a customer
exports.viewCard = async (req, res) => {
  const { customerId } = req.params;

  try {
    // Validate if customer exists
    const customerExists = await apiHelper.checkCustomer(customerId);
    if (!customerExists) {
      logger.error("Invalid customerId", { customerId });
      return res.status(400).json({ message: "Invalid customerId" });
    }

    // Fetch cards associated with the customer
    const cards = await cardModel.Card.find({ customerId });
    if (cards.length === 0) {
      logger.warn("No cards found for this customer", { customerId });
      return res
        .status(400)
        .json({ message: "No cards found for this customer." });
    }

    res
      .status(200)
      .json({ message: "Cards retrieved successfully", data: cards });
  } catch (error) {
    logger.error("Failed to retrieve cards", {
      error: error.message,
      customerId,
    });
    res
      .status(500)
      .json({
        message: "Internal Server Error",
        errorId: generateErrorId(),
        error: error.message,
      });
  }
};

// Add Card - Add a new card for a customer
exports.addCard = async (req, res) => {
  const { cardId, nameOnCard, cardType, cvv, expiryDate, customerId } =
    req.body;

  try {
    // Validate if customer exists
    const customerExists = await apiHelper.checkCustomer(customerId);
    if (!customerExists) {
      logger.error("Invalid customerId", { customerId });
      return res.status(400).json({ message: "Invalid customerId" });
    }

    // Create a new card entry in the database
    const newCard = await cardModel.Card.create({
      cardId,
      nameOnCard,
      cardType,
      cvv,
      expiryDate,
      customerId,
    });

    logger.info("Card added successfully", { cardId, customerId });
    res.status(201).json({ message: "Card added successfully", card: newCard });
  } catch (error) {
    logger.error("Failed to add card", { error: error.message, customerId });
    res
      .status(500)
      .json({
        message: "Internal Server Error",
        errorId: generateErrorId(),
        error: error.message,
      });
  }
};
