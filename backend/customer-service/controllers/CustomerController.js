const Customer = require("../models/CustomerModel.js");
// Tạo customer mới
exports.createCustomer = async (req, res) => {
  try {
    const { fullName, email, phone, address, birthday, gender, userId } =
      req.body;

    // Validate bắt buộc
    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !birthday ||
      !gender ||
      !userId
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Kiểm tra trùng email hoặc userId
    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { userId }],
    });
    if (existingCustomer) {
      return res
        .status(400)
        .json({ message: "Customer with this email or userId already exists" });
    }

    const newCustomer = new Customer({
      fullName,
      email,
      phone,
      address,
      birthday,
      gender,
      userId,
    });

    await newCustomer.save();
    res.status(201).json({
      message: "Customer created successfully",
      customer: newCustomer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả customer
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy customer theo id
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy customer theo userId
exports.getCustomerByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const customer = await Customer.findOne({ userId });

    if (!customer) {
      return res
        .status(404)
        .json({ message: "Customer not found for this user" });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật customer theo id
exports.updateCustomer = async (req, res) => {
  try {
    const { fullName, phone, address, birthday, gender } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { fullName, phone, address, birthday, gender },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật customer theo userId
exports.updateCustomerByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updateData = req.body;
    const customer = await Customer.findOne({ userId });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    Object.assign(customer, updateData);
    await customer.save();
    res.status(200).json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tìm kiếm customer
exports.searchCustomer = async (req, res) => {
  try {
    const { fullName, phone } = req.query;
    let query = {};
    if (fullName && typeof fullName === "string") {
      query.fullName = { $regex: fullName, $options: "i" };
    }
    if (phone && typeof phone === "string") {
      query.phone = { $regex: phone, $options: "i" };
    }
    const customers = await Customer.find(query);
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sắp xếp customer
exports.sortCustomer = async (req, res) => {
  try {
    const { sortBy, sortOrder } = req.query;
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sort["createdAt"] = -1;
    }
    const customers = await Customer.find().sort(sort);
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCustomerAndUserByUserId = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.params.userId });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Gọi REST API sang user-service
    const userServiceUrl =
      process.env.USER_SERVICE_URL || "http://localhost:4005";
    const userRes = await axios.get(
      `${userServiceUrl}/api/user/${customer.userId}`
    );
    const user = userRes.data.user || userRes.data;

    res.status(200).json({
      customer,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
