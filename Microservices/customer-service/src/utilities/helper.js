const dbModels = require("../models/customer.model");

exports.generateCustomerId = async () => {
    try {
        // Find the customer with the highest customerId
        const lastCustomer = await dbModels.customers.findOne().sort({ customerId: -1 });
        
        let customerId = lastCustomer ? lastCustomer.customerId + 10 : 200;

        return customerId;
    } catch (err) {
        throw new Error(err.message);
    }
};
