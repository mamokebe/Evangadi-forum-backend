import express from "express";
import {
  checkUser,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  sendResetOtp,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

//(use route name as name convection  like /api/..)
// register user route post method(user must send data)
userRouter.post("/register", registerUser);
//login user route (get method)
userRouter.post("/login", loginUser);
//check user route (get method)
userRouter.get("/check", authMiddleware, checkUser);
// userRouter.get("/checkUser", authMiddleware, checkUser);

//logout user route (delete method)
userRouter.delete("/logout", logoutUser);

userRouter.post("/send-reset-otp", sendResetOtp);
userRouter.post("/reset-password", resetPassword);

export default userRouter;
