const Product = require("../models/ProductsModels");
const cloudinary = require("cloudinary").v2;
const Category = require("../../category-service/models/CategoryModel");
const User = require("../../user-service/models/UserModel");
const Seller = require("../../seller-service/models/SellerModels");

// Tạo mới một sản phẩm
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      describe,
      status,
      categoryId,
      quantity,
      views,
      userId,
      sellerId,
    } = req.body;
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        imageUrls.push(result.secure_url);
      }
    }
    const newProduct = new Product({
      name,
      price,
      describe,
      image: imageUrls,
      status,
      categoryId,
      quantity,
      views,
      userId,
      sellerId,
    });

    await newProduct.save();
    res.status(201).json({
      message: "Tạo sản phẩm thành công",
      product: newProduct,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả sản phẩm - không tăng view vì đây là danh sách
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("categoryId", "name")
      .populate("sellerId", "storeName")
      .populate("userId");
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm theo ID và tăng view
exports.getProductById = async (req, res) => {
  try {
    console.log("Getting product with ID:", req.params.id);

    // Kiểm tra ID hợp lệ
    if (!require("mongoose").Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    // Tách biệt việc cập nhật views và lấy dữ liệu
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Sau khi cập nhật, lấy dữ liệu mới nhất
    const product = await Product.findById(req.params.id)
      .populate("categoryId")
      .populate("sellerId")
      .populate("userId");

    if (!product) {
      console.log("Product not found with ID:", req.params.id);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Product views after update:", product.views);
    res.status(200).json(product);
  } catch (err) {
    console.error("Error in getProductById:", err);
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      describe,
      status,
      categoryId,
      quantity,
      views,
      userId,
      sellerId,
    } = req.body;
    let updatedFields = {
      name,
      price,
      describe,
      status,
      categoryId,
      quantity,
      views,
      userId,
      sellerId,
    };
    if (req.files && req.files.length > 0) {
      let imageUrls = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        imageUrls.push(result.secure_url);
      }
      updatedFields.image = imageUrls;
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tìm kiếm sản phẩm theo tên - không tăng view vì đây là danh sách
exports.searchProductName = async (req, res) => {
  try {
    const { name } = req.query;
    const nameCode = name ? name.toLowerCase() : "";
    const product = await Product.find({
      name: { $regex: nameCode, $options: "i" },
    });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sắp xếp sản phẩm theo tên - không tăng view vì đây là danh sách
exports.sortProduct = async (req, res) => {
  try {
    const product = await Product.find()
      .collation({ locale: "vi", strength: 1 })
      .sort({ name: 1 });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy các sản phẩm phổ biến - không tăng view vì đây là danh sách
exports.getPopularProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.find()
      .sort({ views: -1 })
      .limit(limit)
      .populate("categoryId");
    if (products.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm nào" });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm theo category - không tăng view vì đây là danh sách
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ categoryId: req.params.categoryId })
      .populate("categoryId")
      .populate("sellerId")
      .populate("userId");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy chi tiết sản phẩm (theo productId) và tăng views
exports.getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("categoryId", "name")
      .populate("sellerId", "storeName storeAddress phone image");
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi server" });
  }
};

// Lấy sản phẩm theo seller - không tăng view vì đây là danh sách
exports.getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await Product.find({ sellerId })
      .populate("categoryId", "name")
      .populate("sellerId", "storeName storeAddress phone image")
      .select("name price image categoryId");
    res.status(200).json(products);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo seller:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi server" });
  }
};
