// import express from "express";
// import {
//   deliveryLogin,
//   getAssignedOrders,
//   updateOrderStatus
// } from "../controllers/deliveryController.js";

// const router = express.Router();

// router.post("/login", deliveryLogin);
// router.get("/orders/:deliveryBoyId", getAssignedOrders);
// router.put("/update-status/:orderId", updateOrderStatus);

// export default router;


import express from "express";
import {
   createDeliveryBoy,
  deliveryLogin,
  deliveryLogout,
  getAssignedOrders,
  updateOrderStatus,
  forgotPassword,
  resetPassword
} from "../controllers/deliveryController.js";

import { deliveryAuth } from "../middlewares/deliveryAuth.js";

const router = express.Router();

router.post("/create", createDeliveryBoy);
router.post("/login", deliveryLogin);
router.post("/logout", deliveryLogout);
router.get("/orders", deliveryAuth, getAssignedOrders);
router.put("/order/:orderId/status", deliveryAuth, updateOrderStatus);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
