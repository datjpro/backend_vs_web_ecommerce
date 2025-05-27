const express = require("express");
const router = express.Router();
const CustomerController = require("../controllers/CustomerController");

// Route lấy customer theo userId và cập nhật theo userId
// GET /api/customer/by-user/:userId
router.get("/by-user/:userId", CustomerController.getCustomerByUserId);
router.put(
  "/update-by-user/:userId",
  CustomerController.updateCustomerByUserId
);
router.get("/with-user/:userId", CustomerController.getCustomerAndUserByUserId);

// Các route chung
router.post("/create", CustomerController.createCustomer);
router.get("/all", CustomerController.getAllCustomers);
router.get("/search", CustomerController.searchCustomer);
router.get("/sort", CustomerController.sortCustomer);
router.get("/:id", CustomerController.getCustomerById);
router.put("/update/:id", CustomerController.updateCustomer);
router.delete("/delete/:id", CustomerController.deleteCustomer);

module.exports = router;
