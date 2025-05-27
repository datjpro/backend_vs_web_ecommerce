const express = require("express");
const router = express.Router();
const OrderDetailsController = require("../controllers/OrderDetailsController");

// Routes cơ bản
router.post("/create", OrderDetailsController.createOrderDetails);
router.get("/all", OrderDetailsController.getAllOrderDetails);
router.get("/:id", OrderDetailsController.getOrderDetailsById);

// Routes cho seller
router.get(
  "/seller/:sellerId",
  OrderDetailsController.getOrderDetailsBySellerId
);
router.put(
  "/seller/update-status/:id",
  OrderDetailsController.updateOrderDetailStatus
);

// Routes cho customer/user
router.get(
  "/customer/:customerId",
  OrderDetailsController.getOrderDetailsByCustomerId
);
router.get("/user/:userId", OrderDetailsController.getOrderDetailsByUserId); // Route mới
router.put(
  "/customer/cancel/:id",
  OrderDetailsController.cancelOrderDetailByCustomer
);
router.put(
  "/customer/confirm-delivery/:id",
  OrderDetailsController.confirmDeliveryByCustomer
);

// Routes xóa và hủy
router.delete(
  "/delete/:id",
  OrderDetailsController.deleteOrderDetailAndUpdateOrder
);
router.put("/cancel/:id", OrderDetailsController.cancelOrderDetail);

// Routes theo order
router.get("/order/:orderId", OrderDetailsController.getOrderDetailsByOrderId);

module.exports = router;
