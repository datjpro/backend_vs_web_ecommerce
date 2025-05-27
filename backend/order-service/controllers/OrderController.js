const Order = require("../models/OrderModel");
const axios = require("axios");

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const {
      totalOrder,
      discountId,
      customerId,
      shippingInfo,
      userId,
      orderDetailsItems,
    } = req.body;

    if (totalOrder == null || !shippingInfo || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newOrder = new Order({
      totalOrder,
      discountId,
      customerId,
      shippingInfo,
      userId,
    });

    await newOrder.save();

    // Tạo chi tiết đơn hàng
    if (orderDetailsItems && Array.isArray(orderDetailsItems)) {
      for (const item of orderDetailsItems) {
        try {
          const response = await axios.post(
            "http://localhost:4001/api/orderDetails/create",
            {
              orderId: newOrder._id,
              productId: item.productId,
              sellerId: item.sellerId,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
              status: "pending",
            }
          );
          console.log("Order detail created:", response.data);
        } catch (orderDetailError) {
          console.error(
            "Error creating order detail:",
            orderDetailError.message
          );
        }
      }
    }

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả đơn hàng
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy orders theo user ID
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy order theo ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật order
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Updating order ${id} status to: ${status}`);

    const order = await Order.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log(`Order status updated successfully: ${order.status}`);

    res.status(200).json({
      message: "Order status updated successfully",
      order: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: error.message });
  }
};

// Xóa đơn hàng
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
