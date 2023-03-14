import express from "express";
import asyncHandler from "express-async-handler";
// import { admin, protect } from "../Middleware/AuthMiddleware.js";
import { protect, admin } from "../Middleware/AuthMiddleware.js";
import generateToken from "../utils/generateToken.js";
import User from "./../Models/UserModel.js";

const userRoute = express.Router();

/**Sau khi tạo tài khoản sẽ lưu tài khoản vào Database
 * Dùng email và mật khẩu đã tạo để đăng nhập
 * Server sẽ dùng email đã đăng ký để tìm kiếm trên Database
 * nếu có sẽ tiến hành đăng nhập
 */
// API ĐĂNG NHẬP MONGO
userRoute.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
        createdAt: user.createdAt,
      });
    } else {
      res.status(401);
      throw new Error("Sai email hoặc mật khẩu");
    }
  })
);

//API ĐĂNG KÝ VÀ IMPORT VÀO MONGO
userRoute.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("Email đã tồn tại");
    }

    const user = await User.create({
      name,
      email,
      password,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Thông tin không hợp lệ");
    }
  })
);

/**API Lấy thông tin của một user
 * Mỗi người dùng sẽ có một id riêng biệt
 */
userRoute.get(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404);
      throw new Error("Không tìm thấy user");
    }
  })
);

// API CẬP NHẬT USER
userRoute.put(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error("Không tìm thấy user");
    }
  })
);

//API LẤY DANH SÁCH USER TRÊN MONGO
/**protect, admin dùng để xác thực người dùng
 * Hàm asyncHandler được sử dụng để bắt lỗi
 * Khi được gọi,gọi tới mongodb để lấy danh sách tất cả người dùng,
 * sau đó trả về dữ liệu về JSON
 */
userRoute.get(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
  })
);

export default userRoute;
