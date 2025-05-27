const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios"); // Import axios để gọi API

// Đăng ký tài khoản
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "customer", // Mặc định là customer nếu không truyền role
    });
    await newUser.save();

    // Nếu là customer thì tự động tạo customer profile
    if (newUser.role === "customer") {
      try {
        const customerResponse = await axios.post(
          `${process.env.CUSTOMER_SERVICE_URL}/api/customer/create`,
          {
            fullName: newUser.name,
            email: newUser.email,
            userId: newUser._id,
            phone: "Chưa cập nhật", // Thay vì ""
            address: "Chưa cập nhật", // Thay vì ""
            birthday: new Date(),
            gender: "Khác",
          }
        );

        if (customerResponse.data) {
          return res.status(201).json({
            message: "User and customer profile created successfully",
            user: {
              id: newUser._id,
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
            },
            customer: customerResponse.data.customer,
          });
        }
      } catch (error) {
        console.error("Error creating customer:", error.message);
        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);
        }

        // Nếu tạo customer thất bại vẫn trả về user đã tạo
        return res.status(201).json({
          message:
            "User created successfully but customer profile creation failed. Please try updating your profile later.",
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          },
        });
      }
    }

    // Nếu là seller thì tự động tạo seller profile
    if (newUser.role === "seller") {
      try {
        const token = jwt.sign(
          { id: newUser._id, role: newUser.role },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        const sellerResponse = await axios.post(
          "http://localhost:3006/api/seller/create",
          {
            storeName: "Chưa cập nhật",
            storeAddress: "Chưa cập nhật",
            phone: "Chưa cập nhật",
            image: [],
            userId: newUser._id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (sellerResponse.data) {
          return res.status(201).json({
            message: "User and seller profile created successfully",
            user: {
              id: newUser._id,
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
            },
            seller: sellerResponse.data.seller,
          });
        }
      } catch (error) {
        console.error("Error creating seller:", error.message);
        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);
        }
        // Nếu tạo seller thất bại vẫn trả về user đã tạo
        return res.status(201).json({
          message:
            "User created successfully but seller profile creation failed. Please try updating your seller profile later.",
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          },
        });
      }
    }

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Nếu không phải customer chỉ trả về user
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token, // Trả về token cho client
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy thông tin user đang đăng nhập
exports.getLoggedInUser = async (req, res) => {
  try {
    // req.user được gán từ middleware authenticate
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.searchUsersByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name)
      return res.status(400).json({ message: "Missing name parameter" });

    const users = await User.find({
      name: { $regex: name, $options: "i" }, // tìm gần đúng, không phân biệt hoa thường
    }).select("-password");

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.sortUsersByName = async (req, res) => {
  try {
    const order = req.query.order === "desc" ? -1 : 1; // mặc định asc
    const users = await User.find()
      .collation({ locale: "vi", strength: 1 }) // để sắp xếp theo chuẩn tiếng Việt
      .sort({ name: order })
      .select("-password"); // không trả về password

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
