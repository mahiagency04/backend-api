// import express from "express";
// import {
//   deliveryLogin,
//   getAssignedOrders,
//   updateOrderStatus,
// } from "../controllers/deliveryController.js";
// import { assignOrder, placeOrder } from "../controllers/orderController.js";
// import checkUserAuth from "../middlewares/authMiddleware.js";


// const router = express.Router();

// router.post("/login", deliveryLogin);
// router.post("/place-order", deliveryLogin);
// router.get("/orders/:deliveryBoyId", getAssignedOrders);
// router.put("/update-status/:orderId", updateOrderStatus);
// // router.put("/order/:orderId/status", deliveryAuth, updateOrderStatus);


// router.post("/assign", assignOrder);

// export default router;

import express from "express";
import {
  placeOrder,
  getMyOrders,
  cancelOrder,
  assignOrder
} from "../controllers/orderController.js";
import checkUserAuth from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ ORDER PLACE (LOGIN REQUIRED)
router.post("/place-order", checkUserAuth, placeOrder);

// ✅ MY ORDERS
router.get("/my-orders", checkUserAuth, getMyOrders);

// ✅ CANCEL
router.put("/cancel-order/:id", checkUserAuth, cancelOrder);

router.post(
  "/assign",
  checkUserAuth,   
  assignOrder
);




export default router;
