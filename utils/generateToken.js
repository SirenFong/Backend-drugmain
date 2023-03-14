import jwt from "jsonwebtoken";

/**Hàm tạo ra token cho id user khi đăng nhập
 * Refresh sau 30 ngày
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;
