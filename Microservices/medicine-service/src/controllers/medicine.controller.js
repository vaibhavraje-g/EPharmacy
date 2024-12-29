const dbModels = require("../models/medicine.model");
const helper = require("../utilities/helper");

const addDiscountPercent = (medicines) => {
  return medicines.map((medicine) => {
    const discountPercent = helper.calculateDiscount(medicine.expiryDate);
    return { ...medicine.toObject(), discountPercent };
  });
};

exports.getMedicinesByPage = async (req, res, next) => {
  try {
    const { pageNumber, pageSize } = req.params;
    const page = parseInt(pageNumber, 10);
    const size = parseInt(pageSize, 10);

    const medicines = await dbModels.Medicines
      .find()
      .skip(page * size)
      .limit(size);

    if (!medicines.length) {
      return res.status(400).json({
        status: "fail",
        message: "No medicine found",
      });
    }

    const medicinesWithDiscount = addDiscountPercent(medicines);

    res.status(200).json({
      status: "success",
      medicine: medicinesWithDiscount,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMedicineById = async (req, res, next) => {
  try {
    const { medicineId } = req.params;

    const medicine = await dbModels.Medicines.findOne({ medicineId });

    if (!medicine) {
      return res.status(400).json({
        status: "fail",
        message: "Medicine with given id is not found",
      });
    }
    const medicineWithDiscount = {
      ...medicine.toObject(),
      discountPercent: helper.calculateDiscount(medicine.expiryDate),
    };

    res.status(200).json({
      status: "success",
      data: medicineWithDiscount,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMedicinesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const medicines = await dbModels.Medicines.find({ category });

    if (!medicines.length) {
      return res.status(400).json({
        status: "fail",
        message: "No medicine found with given category",
      });
    }

    const medicinesWithDiscount = addDiscountPercent(medicines);

    res.status(200).json({
      status: "success",
      data: medicinesWithDiscount,
    });
  } catch (error) {
    next(error);
  }
};

// Update medicine stock after order
exports.updateStock = async (req, res, next) => {
  try {
    const { medicineId } = req.params;
    const { orderedQuantity } = req.body;

    const medicine = await dbModels.Medicines.findOne({ medicineId });

    if (!medicine) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid medicineId",
      });
    }

    if (medicine.stock < orderedQuantity) {
      return res.status(400).json({
        status: "fail",
        message: "Stock not available",
      });
    }

    medicine.stock -= orderedQuantity;
    await medicine.save();

    res.status(200).json({
      status: "success",
      message: "Stock updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
