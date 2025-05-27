// const express = require('express');
// const router = express.Router();
// const Seller = require('../controllers/SellerControllers');
// const { authenticate, authorizeRoles } = require('../../user-service/middlewares/AuthUser');
// const { upload } = require('../config/multer');

// // Seller routes
// router.get('/all', Seller.getAllSellers);
// router.get('/by-user/:userId', Seller.getSellerByUserId);
// router.get('/:id', Seller.getSellerById);
// router.post('/create', authenticate,authorizeRoles('admin', 'seller'), upload.array('image', 6), Seller.createSeller);
// router.put('/update/:id', authenticate,authorizeRoles('admin', 'seller'), upload.array('image', 6), Seller.updateSeller);
// router.delete('/delete/:id', authenticate,authorizeRoles('admin', 'seller'), Seller.deleteSeller);
// router.get('/:id/orders', Seller.getOrdersBySeller);
// module.exports = router;
const express = require("express");
const router = express.Router();
const Seller = require("../controllers/SellerControllers");
const {
  authenticate,
  authorizeRoles,
} = require("../../user-service/middlewares/AuthUser");
const { upload } = require("../config/multer");

// Seller routes
router.get("/all", Seller.getAllSellers);
router.get("/by-user/:userId", Seller.getSellerByUserId);
router.get("/:id/orders", Seller.getOrdersBySeller); // ĐẶT TRƯỚC /:id
router.get("/:id", Seller.getSellerById);
router.post(
  "/create",
  authenticate,
  authorizeRoles("admin", "seller"),
  upload.array("image", 6),
  Seller.createSeller
);
router.put(
  "/update/:id",
  authenticate,
  authorizeRoles("admin", "seller"),
  upload.array("image", 6),
  Seller.updateSeller
);
router.delete(
  "/delete/:id",
  authenticate,
  authorizeRoles("admin", "seller"),
  Seller.deleteSeller
);

module.exports = router;
