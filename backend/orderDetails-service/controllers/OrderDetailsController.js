const mongoose = require("mongoose");
const OrderDetails = require("../models/OrderDetailsModel");

// Tạo order details
exports.createOrderDetails = async (req, res) => {
  try {
    const {
      orderId,
      productId,
      sellerId,
      quantity,
      totalPrice,
      status = "pending",
    } = req.body;

    const newOrderDetails = new OrderDetails({
      orderId,
      productId,
      sellerId,
      quantity,
      totalPrice,
      status,
    });

    await newOrderDetails.save();

    res.status(201).json({
      message: "Order Details created successfully",
      orderDetails: newOrderDetails,
    });
  } catch (error) {
    console.error("Error creating OrderDetails:", error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả order details (không populate)
exports.getAllOrderDetails = async (req, res) => {
  try {
    const orderDetails = await OrderDetails.find();
    res.status(200).json(orderDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy order details theo ID (không populate)
exports.getOrderDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const orderDetail = await OrderDetails.findById(id);

    if (!orderDetail) {
      return res.status(404).json({ message: "Order detail not found" });
    }

    res.status(200).json(orderDetail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy order details theo seller ID (không populate)
exports.getOrderDetailsBySellerId = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { status } = req.query;

    let query = { sellerId };
    if (status) {
      query.status = status;
    }

    const orderDetails = await OrderDetails.find(query);
    res.status(200).json(orderDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seller cập nhật trạng thái order details
exports.updateOrderDetailStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, sellerId } = req.body;

    console.log(
      `Updating order detail ${id} status to: ${status} by seller: ${sellerId}`
    );

    const orderDetail = await OrderDetails.findById(id);

    if (!orderDetail) {
      return res.status(404).json({ message: "Order detail not found" });
    }

    // Kiểm tra quyền seller
    if (orderDetail.sellerId.toString() !== sellerId) {
      return res
        .status(403)
        .json({ message: "Seller không có quyền cập nhật order detail này" });
    }

    // Cập nhật trạng thái orderDetail
    orderDetail.status = status;
    await orderDetail.save();
    console.log(`Order detail status updated to: ${status}`);

    // Kiểm tra và cập nhật trạng thái đơn hàng chính
    const axios = require("axios");
    try {
      // Lấy tất cả orderDetails của đơn hàng này
      const allOrderDetails = await OrderDetails.find({
        orderId: orderDetail.orderId,
      });

      console.log(
        `Found ${allOrderDetails.length} order details for order ${orderDetail.orderId}`
      );

      // Nếu đơn hàng chỉ có 1 chi tiết đơn hàng
      if (allOrderDetails.length === 1) {
        console.log("Single order detail found, updating main order status...");

        // Cập nhật trạng thái đơn hàng chính
        const updateResponse = await axios.put(
          `http://localhost:4000/api/order/${orderDetail.orderId}`,
          { status: status }
        );

        console.log(
          "Main order status updated successfully:",
          updateResponse.data
        );

        return res.status(200).json({
          message:
            "Order detail và main order status đã được cập nhật thành công",
          orderDetail: orderDetail,
          mainOrderUpdated: true,
          newStatus: status,
          mainOrderResponse: updateResponse.data,
        });
      } else {
        console.log(
          `Multiple order details (${allOrderDetails.length}) found, only updating order detail`
        );

        return res.status(200).json({
          message: "Order detail status đã được cập nhật thành công",
          orderDetail: orderDetail,
          mainOrderUpdated: false,
          note: `Đơn hàng có ${allOrderDetails.length} sản phẩm, chỉ cập nhật chi tiết đơn hàng`,
        });
      }
    } catch (orderUpdateError) {
      console.error("Error updating main order:", orderUpdateError);

      return res.status(200).json({
        message: "Order detail đã cập nhật (lỗi khi cập nhật main order)",
        orderDetail: orderDetail,
        mainOrderUpdated: false,
        mainOrderUpdateError: orderUpdateError.message,
      });
    }
  } catch (error) {
    console.error("Error updating order detail status:", error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy order details theo customer ID (không populate)
exports.getOrderDetailsByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status } = req.query;

    // Cần gọi API để lấy orders của customer
    const axios = require("axios");
    try {
      const ordersResponse = await axios.get(
        `http://localhost:4000/api/order/user/${customerId}`
      );
      const orderIds = ordersResponse.data.map((order) => order._id);

      let query = { orderId: { $in: orderIds } };
      if (status) {
        query.status = status;
      }

      const orderDetails = await OrderDetails.find(query);
      res.status(200).json(orderDetails);
    } catch (apiError) {
      console.error("Error calling order service:", apiError.message);
      res.status(500).json({ message: "Error fetching customer orders" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Khách hàng hủy order detail
exports.cancelOrderDetailByCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, cancelReason } = req.body;

    const orderDetail = await OrderDetails.findById(id);

    if (!orderDetail) {
      return res.status(404).json({ message: "Order detail not found" });
    }

    // Cần gọi API để kiểm tra customerId từ order
    const axios = require("axios");
    try {
      const orderResponse = await axios.get(
        `http://localhost:4000/api/order/${orderDetail.orderId}`
      );

      if (orderResponse.data.customerId !== customerId) {
        return res
          .status(403)
          .json({ message: "Không có quyền hủy order detail này" });
      }
    } catch (apiError) {
      return res
        .status(500)
        .json({ message: "Error verifying customer permission" });
    }

    // Kiểm tra có thể hủy không
    if (
      orderDetail.status === "shipping" ||
      orderDetail.status === "delivered"
    ) {
      return res.status(400).json({
        message:
          "Không thể hủy order detail này. Sản phẩm đang được giao hoặc đã giao.",
      });
    }

    orderDetail.status = "cancelled";
    orderDetail.cancelReason = cancelReason;
    orderDetail.cancelledBy = "customer";

    await orderDetail.save();

    res.status(200).json({
      message: "Order detail cancelled successfully",
      orderDetail,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy order details theo order ID (không populate)
exports.getOrderDetailsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderDetails = await OrderDetails.find({ orderId });

    if (!orderDetails || orderDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "No order details found for this order" });
    }

    res.status(200).json(orderDetails);
  } catch (error) {
    console.error("Error fetching order details by orderId:", error);
    res.status(500).json({ message: error.message });
  }
};

// Xóa order detail và cập nhật lại đơn hàng
exports.deleteOrderDetailAndUpdateOrder = async (req, res) => {
  try {
    const { id } = req.params; // orderDetail ID
    const { userId } = req.body; // Để kiểm tra quyền

    // Lấy thông tin order detail cần xóa
    const orderDetail = await OrderDetails.findById(id);
    if (!orderDetail) {
      return res.status(404).json({ message: "Order detail not found" });
    }

    // Kiểm tra quyền (có thể xóa nếu status là pending hoặc confirmed)
    if (
      orderDetail.status === "shipping" ||
      orderDetail.status === "delivered"
    ) {
      return res.status(400).json({
        message: "Không thể xóa sản phẩm đã được giao hoặc đang giao",
      });
    }

    const orderId = orderDetail.orderId;
    const deletedPrice = orderDetail.totalPrice;

    // Xóa order detail
    await OrderDetails.findByIdAndDelete(id);

    // Gọi API internal để cập nhật lại tổng tiền đơn hàng
    const axios = require("axios");
    try {
      // Lấy thông tin đơn hàng hiện tại - sử dụng route internal
      const orderResponse = await axios.get(
        `http://localhost:4000/api/order/internal/${orderId}`
      );
      const currentOrder = orderResponse.data;

      // Kiểm tra quyền user
      if (
        currentOrder.userId !== userId &&
        currentOrder.customerId !== userId
      ) {
        return res
          .status(403)
          .json({ message: "Không có quyền xóa sản phẩm này" });
      }

      // Tính tổng tiền mới
      const newTotalOrder = Math.max(0, currentOrder.totalOrder - deletedPrice);

      // Kiểm tra xem còn order details nào không
      const remainingOrderDetails = await OrderDetails.find({ orderId });

      if (remainingOrderDetails.length === 0) {
        // Nếu không còn sản phẩm nào thì xóa luôn đơn hàng
        await axios.delete(`http://localhost:4000/api/order/delete/${orderId}`);

        return res.status(200).json({
          message: "Đã xóa sản phẩm cuối cùng và hủy đơn hàng",
          deletedOrderDetail: orderDetail,
          orderDeleted: true,
        });
      } else {
        // Cập nhật lại tổng tiền đơn hàng - sử dụng route internal
        const updateData = {
          totalOrder: newTotalOrder,
          discountId: currentOrder.discountId,
          customerId: currentOrder.customerId,
          paymentId: currentOrder.paymentId,
          shippingInfo: currentOrder.shippingInfo,
          transportId: currentOrder.transportId,
          userId: currentOrder.userId,
        };

        await axios.put(
          `http://localhost:4000/api/order/internal/${orderId}`,
          updateData
        );

        return res.status(200).json({
          message: "Đã xóa sản phẩm và cập nhật đơn hàng",
          deletedOrderDetail: orderDetail,
          oldTotalOrder: currentOrder.totalOrder,
          newTotalOrder: newTotalOrder,
          deletedPrice: deletedPrice,
          remainingItems: remainingOrderDetails.length,
        });
      }
    } catch (orderError) {
      console.error("Error updating order:", orderError.message);
      console.error("Error details:", orderError.response?.data);
      return res.status(500).json({
        message: "Error updating order after deletion",
        error: orderError.response?.data || orderError.message,
      });
    }
  } catch (error) {
    console.error("Error deleting order detail:", error);
    res.status(500).json({ message: error.message });
  }
};

// Hủy order detail (khác với xóa - chỉ đổi status) - SỬA LẠI
exports.cancelOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, cancelReason } = req.body;

    console.log("Cancelling order detail:", id);
    console.log("User ID:", userId);

    const orderDetail = await OrderDetails.findById(id);
    if (!orderDetail) {
      return res.status(404).json({ message: "Order detail not found" });
    }

    console.log("Found order detail:", orderDetail);

    // Kiểm tra có thể hủy không
    if (
      orderDetail.status === "shipping" ||
      orderDetail.status === "delivered"
    ) {
      return res.status(400).json({
        message: "Không thể hủy sản phẩm đã được giao hoặc đang giao",
      });
    }

    // Kiểm tra nếu đã bị hủy rồi thì không cần hủy nữa
    if (orderDetail.status === "cancelled") {
      return res.status(400).json({
        message: "Sản phẩm này đã được hủy trước đó",
      });
    }

    // Lưu giá trị trước khi cập nhật
    const originalPrice = orderDetail.totalPrice;

    // Cập nhật status thành cancelled
    orderDetail.status = "cancelled";
    orderDetail.cancelReason = cancelReason || "Khách hàng hủy";
    orderDetail.cancelledBy = "customer";
    orderDetail.canCancelByCustomer = false;

    await orderDetail.save();
    console.log("Order detail cancelled successfully");

    // Cập nhật lại tổng tiền đơn hàng (trừ đi giá trị bị hủy)
    const axios = require("axios");
    try {
      console.log("Fetching order info for ID:", orderDetail.orderId);

      const orderResponse = await axios.get(
        `http://localhost:4000/api/order/internal/${orderDetail.orderId}`
      );
      const currentOrder = orderResponse.data;

      console.log("Current order total:", currentOrder.totalOrder);
      console.log("Order detail price to subtract:", originalPrice);

      const newTotalOrder = Math.max(
        0,
        currentOrder.totalOrder - originalPrice
      );

      console.log("New total order:", newTotalOrder);

      // Sửa updateData để handle null customerId
      const updateData = {
        totalOrder: newTotalOrder,
        discountId: currentOrder.discountId || [],
        customerId: currentOrder.customerId || userId, // Sử dụng userId nếu customerId null
        paymentId: currentOrder.paymentId,
        shippingInfo: currentOrder.shippingInfo,
        transportId: currentOrder.transportId,
        userId: currentOrder.userId,
      };

      console.log("Updating order with data:", updateData);

      const updateResponse = await axios.put(
        `http://localhost:4000/api/order/internal/${orderDetail.orderId}`,
        updateData
      );

      console.log("Order update response:", updateResponse.data);

      return res.status(200).json({
        message: "Order detail cancelled and order total updated successfully",
        orderDetail,
        oldTotalOrder: currentOrder.totalOrder,
        newTotalOrder: newTotalOrder,
        subtractedAmount: originalPrice,
        orderUpdateResponse: updateResponse.data,
      });
    } catch (orderError) {
      console.error("Error updating order after cancellation:");
      console.error("Error message:", orderError.message);
      console.error("Error response:", orderError.response?.data);
      console.error("Error status:", orderError.response?.status);

      return res.status(200).json({
        message:
          "Order detail cancelled successfully (order total update failed)",
        orderDetail,
        error: {
          message: orderError.message,
          response: orderError.response?.data,
          status: orderError.response?.status,
        },
      });
    }
  } catch (error) {
    console.error("Error in cancelOrderDetail:", error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy order details theo user ID - CẢI THIỆN ERROR HANDLING
exports.getOrderDetailsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    console.log("Getting order details for user:", userId);

    const axios = require("axios");
    try {
      console.log(
        "Calling order service at: http://localhost:4000/api/order/user/" +
          userId
      );

      // Lấy tất cả orders của user
      const ordersResponse = await axios.get(
        `http://localhost:4000/api/order/user/${userId}`,
        {
          timeout: 5000, // 5 second timeout
        }
      );

      console.log("Order service response status:", ordersResponse.status);
      console.log("Found orders:", ordersResponse.data?.length || 0);

      if (!ordersResponse.data || ordersResponse.data.length === 0) {
        return res.status(200).json({
          message: "No orders found for this user",
          orderDetails: [],
        });
      }

      const orderIds = ordersResponse.data.map((order) => order._id);
      console.log("Order IDs:", orderIds);

      let query = { orderId: { $in: orderIds } };
      if (status) {
        query.status = status;
      }

      console.log("Searching order details with query:", query);

      const orderDetails = await OrderDetails.find(query);
      console.log("Found order details:", orderDetails.length);

      res.status(200).json({
        message: "Order details retrieved successfully",
        totalOrders: ordersResponse.data.length,
        totalOrderDetails: orderDetails.length,
        orderDetails: orderDetails,
      });
    } catch (apiError) {
      console.error("=== ERROR CALLING ORDER SERVICE ===");
      console.error("Error message:", apiError.message);
      console.error("Error code:", apiError.code);
      console.error("Response status:", apiError.response?.status);
      console.error("Response data:", apiError.response?.data);

      // Kiểm tra loại lỗi
      if (apiError.code === "ECONNREFUSED") {
        return res.status(503).json({
          message:
            "Order service is not available. Please check if order service is running on port 4000.",
          error: "Connection refused",
        });
      }

      if (apiError.response?.status === 404) {
        return res.status(200).json({
          message: "No orders found for this user",
          orderDetails: [],
        });
      }

      res.status(500).json({
        message: "Error fetching user orders",
        error: apiError.message,
        details: {
          status: apiError.response?.status,
          data: apiError.response?.data,
        },
      });
    }
  } catch (error) {
    console.error("Error in getOrderDetailsByUserId:", error);
    res.status(500).json({ message: error.message });
  }
};

// Customer xác nhận đã nhận hàng và kết thúc đơn hàng
exports.confirmDeliveryByCustomer = async (req, res) => {
  try {
    const { id } = req.params; // orderDetail ID
    const { userId, customerId, feedback, rating } = req.body;

    const orderDetail = await OrderDetails.findById(id);
    if (!orderDetail) {
      return res.status(404).json({ message: "Order detail not found" });
    }

    // Kiểm tra trạng thái phải là delivered
    if (orderDetail.status !== "delivered") {
      return res.status(400).json({
        message:
          "Chỉ có thể xác nhận những đơn hàng đã được giao (status: delivered)",
      });
    }

    // Kiểm tra quyền customer
    const axios = require("axios");
    try {
      const orderResponse = await axios.get(
        `http://localhost:4000/api/order/internal/${orderDetail.orderId}`
      );

      if (orderResponse.data.userId !== userId) {
        return res.status(403).json({
          message: "Không có quyền xác nhận đơn hàng này",
        });
      }
    } catch (apiError) {
      return res.status(500).json({
        message: "Error verifying customer permission",
      });
    }

    // Cập nhật trạng thái thành completed và kết thúc đơn hàng
    orderDetail.status = "completed"; // Trạng thái cuối cùng
    orderDetail.canCancelByCustomer = false;
    orderDetail.customerConfirmedAt = new Date();

    // Thêm feedback nếu có
    if (feedback) orderDetail.customerFeedback = feedback;
    if (rating) orderDetail.customerRating = rating;

    await orderDetail.save();

    // Cập nhật main order nếu chỉ có 1 orderDetail
    try {
      const allOrderDetails = await OrderDetails.find({
        orderId: orderDetail.orderId,
      });

      if (allOrderDetails.length === 1) {
        await axios.put(
          `http://localhost:4000/api/order/${orderDetail.orderId}`,
          { status: "completed" }
        );
      }
    } catch (orderUpdateError) {
      console.error("Error updating main order:", orderUpdateError);
    }

    res.status(200).json({
      message: "Đã xác nhận nhận hàng thành công. Đơn hàng đã hoàn tất.",
      orderDetail: orderDetail,
      isCompleted: true,
    });
  } catch (error) {
    console.error("Error confirming delivery:", error);
    res.status(500).json({ message: error.message });
  }
};
