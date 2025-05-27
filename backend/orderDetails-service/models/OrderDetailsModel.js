const mongoose = require("mongoose");

// Bỏ việc import các model khác để tránh lỗi
// Chỉ định nghĩa schema cho OrderDetails

const orderDetailsSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "shipping",
        "delivered",
        "completed", // Trạng thái cuối cùng sau khi customer xác nhận
        "cancelled",
      ],
      default: "pending",
    },
    canCancelByCustomer: {
      type: Boolean,
      default: true,
    },
    cancelReason: {
      type: String,
      required: false,
    },
    cancelledBy: {
      type: String,
      enum: ["customer", "seller", "admin"],
      required: false,
    },
    // Thêm các trường mới
    customerConfirmedAt: {
      type: Date,
      required: false,
    },
    customerFeedback: {
      type: String,
      required: false,
    },
    customerRating: {
      type: Number,
      min: 1,
      max: 5,
      required: false,
    },
  },
  { timestamps: true }
);

// Middleware để tự động cập nhật canCancelByCustomer
orderDetailsSchema.pre("save", function (next) {
  if (
    this.status === "shipping" ||
    this.status === "delivered" ||
    this.status === "completed"
  ) {
    this.canCancelByCustomer = false;
  }
  next();
});

module.exports = mongoose.model("OrderDetails", orderDetailsSchema);
