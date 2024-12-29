const validator = require("../utilities/validator");
const dbModels = require("../models/customer.model");
const helper = require("../utilities/helper");
const Opossum = require("opossum");
const bcrypt = require("bcryptjs");
const logger = require("../utilities/logger");  // Assuming you have a logger utility for logging errors

const saltRounds = 10;

const circuitBreakerOptions = {
  errorThresholdPercentage: 50,
  resetTimeout: 60000,
  timeout: 30000,
  rollingCountBuckets: 10,
  rollingCountTimeout: 10000,
  volumeThreshold: 5,
};

const circuit = new Opossum(async (customerEmailId, password) => {
  const user = await dbModels.Customers.findOne({ customerEmailId });
  if (!user) {
    throw new Error("The email address or password is incorrect");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("The email address or password is incorrect");
  }

  return user;
}, circuitBreakerOptions);

circuit.on("open", () => {
  console.log("Circuit is open. Login attempts are blocked for 1 minute.");
});

circuit.on("halfOpen", () => {
  console.log("Circuit is half-open. Next request will test the service.");
});

circuit.on("close", () => {
  console.log("Circuit is closed. Service is back to normal.");
});

// Login controller
exports.login = async (req, res) => {
  try {
    const { customerEmailId, password } = req.body;

    if (!customerEmailId?.trim() || !password?.trim()) {
      return res.status(400).json({
        status: "fail",
        message: "Email and password are required",
      });
    }

    const user = await circuit.fire(customerEmailId, password);

    res.status(200).json({
      status: "success",
      message: "Customer authentication successful",
      data: {
        customerId: user.customerId,
        customerName: user.customerName,
        customerEmailId: user.customerEmailId,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);  // Log error for debugging

    if (circuit.opened) {
      res.status(503).json({
        status: "fail",
        message: "Service temporarily unavailable. Please try again later.",
      });
    } else {
      res.status(400).json({
        status: "fail",
        message: error.message,
      });
    }
  }
};

// Register controller
exports.register = async (req, res) => {
  try {
    const {
      customerName,
      customerEmailId,
      contactNumber,
      password,
      gender,
      dateOfBirth,
      addressList,
    } = req.body;

    const requiredFields = [
      customerName,
      customerEmailId,
      contactNumber,
      password,
      gender,
      dateOfBirth,
    ];

    if (requiredFields.some((field) => !field?.trim())) {
      return res.status(400).json({
        status: "fail",
        message: "All customer details are required",
      });
    }

    if (!Array.isArray(addressList) || addressList.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "At least one address is required",
      });
    }

    const addressValidations = addressList.map((address, index) => {
      const requiredAddressFields = [
        address?.addressName,
        address?.area,
        address?.city,
        address?.state,
        address?.pincode,
      ];

      if (requiredAddressFields.some((field) => !field?.trim())) {
        return {
          index,
          message: `Address ${index + 1} is missing required fields`,
        };
      }

      const validations = [
        {
          valid: validator.validatePincode(address.pincode),
          message: `Address ${index + 1} has an invalid pincode`,
        },
      ];

      const invalidAddressField = validations.find((v) => !v.valid);
      if (invalidAddressField) {
        return {
          index,
          message: invalidAddressField.message,
        };
      }

      return null;
    });

    const invalidAddress = addressValidations.find(
      (validation) => validation !== null
    );
    if (invalidAddress) {
      return res.status(400).json({
        status: "fail",
        message: invalidAddress.message,
      });
    }

    const existedUser = await dbModels.Customers.findOne({
      customerEmailId: customerEmailId,
    });

    if (existedUser) {
      return res.status(400).json({
        status: "fail",
        message: "A customer with the given email address already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const customerId = await helper.generateCustomerId(customerName);

    const newUser = new dbModels.Customers({
      customerId,
      customerName,
      customerEmailId,
      contactNumber,
      password: hashedPassword,
      gender,
      dateOfBirth,
      addressList,
      healthCoins: 0,
    });

    await newUser.save();

    res.status(201).json({
      status: "success",
      message: "Customer account successfully created",
    });
  } catch (error) {
    logger.error("Registration error:", error);  // Log error for debugging

    res.status(500).json({
      status: "fail",
      message: "An error occurred during registration",
    });
  }
};

// Get customer details controller
exports.getCustomerDetails = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await dbModels.Customers.findOne({ customerId }).select('-password');

    if (!customer) {
      return res.status(400).json({
        status: "fail",
        message: "The customer with the given ID is not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: customer,
    });
  } catch (err) {
    logger.error("Get customer details error:", err);  // Log error for debugging

    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};
