import express from "express";
const router = express.Router();
import UserController from "../controllers/userController.js";
import checkUserAuth from "../middlewares/authMiddleware.js";



// Route Level Middleware - To Protect Route
router.use("/changepassword", checkUserAuth)
router.use("/loggeduser", checkUserAuth)
router.use("/userLogout", checkUserAuth)

// Public Routes
router.post("/register", UserController.userRegistration)
router.post("/login", UserController.userLogin)
router.post("/send-reset-password-email", UserController.sendUserPasswordResetEmail)
router.post("/reset-password/:id/:token", UserController.userPasswordReset)

// Protected Routes
router.post("/changepassword", UserController.changeUserPassword)
router.get("/loggeduser", UserController.loggedUser)
router.get("/userLogout", UserController.userLogout)
router.put("/edit-details", checkUserAuth, UserController.editDetails);

// SINGLE ADDRESS ROUTES
// router.post("/address", checkUserAuth, UserController.saveAddress)
// router.get("/address", checkUserAuth, UserController.getAddress)
// router.delete("/address", checkUserAuth, UserController.deleteAddress)

// MULTIPLE ADDRESSES ROUTES
router.post("/addresses", checkUserAuth, UserController.addAddress)
router.get("/addresses", checkUserAuth, UserController.getAddresses)
router.delete("/addresses/:addressId", checkUserAuth, UserController.deleteAddress)
router.put("/addresses/:addressId", checkUserAuth, UserController.updateAddress);




export default router