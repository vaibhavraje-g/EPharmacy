const axios = require("axios");

// Dummy responses for now
const simulateCustomerResponse = (customerId) => {
  return {
    status: 200,
    data: {
      id: customerId,
      name: "John Doe",
    },
  };
};

const simulateMedicineResponse = (medicineId) => {
  return {
    status: 200,
    data: {
      id: medicineId,
      name: "Paracetamol",
      quantity: 100,
    },
  };
};

// Check if the customer exists
const checkCustomer = async (customerId) => {
  try {
    // Simulating response for now
    const response = simulateCustomerResponse(customerId);
    // const response = await axios.get(
    //   `http://${customerHost}:${customerPort}/customer-api/customer/${customerId}`
    // );
    return response.status === 200;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// Check if the medicine exists and validate its quantity
const checkMedicine = async (medicineId, quantity) => {
  try {
    // Simulating response for now
    const response = simulateMedicineResponse(medicineId);
    // const response = await axios.get(
    //   `http://${medicineHost}:${medicinePort}/medicine-api/medicines/${medicineId}`
    // );
    if (response.status === 200) {
      const medicine = response.data;
      if (medicine.quantity < quantity) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = { checkCustomer, checkMedicine };
