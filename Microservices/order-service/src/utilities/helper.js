const dbModels = require('../models/order.model')

exports.getOrderId = async () => {
    try {
        // Find the customer with the highest customerId
        const lastOrder = await dbModels.Order.findOne().sort({ orderId: -1 });
        console.log(lastOrder)
        
        let orderId = lastOrder ? lastOrder.orderId + 1 : 20;

        return orderId;
    } catch (err) {
        throw new Error(err.message);
    }
};
