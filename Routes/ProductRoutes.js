import express from "express";
import asyncHandler from "express-async-handler";
import Product from "./../Models/ProductModel.js";
import { protect } from "../Middleware/AuthMiddleware.js";

/**Sau khi import data từ folder data vào Database
 *Dùng cấu trúc Router để lấy dữ liệu từ Mongo
 */
const productRoute = express.Router();

//API LẤY TẤT CẢ SẢN PHẨM
productRoute.get(
  "/",
  asyncHandler(async (req, res) => {
    {
      /**API TÌM KIẾM */
    }
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};
    const products = await Product.find({ ...keyword });
    res.json(products);
  })
);

//API LẤY SẢN PHẨM THEO ID
productRoute.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error("Không tìm thấy sản phẩm");
    }
  })
);

//API ĐÁNH GIÁ
productRoute.post(
  "/:id/review",
  protect,
  asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    /**Kiểm tra đánh giá */
    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Sản phẩm đã được đánh giá");
      }
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user.id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Cảm ơn bạn đã đánh giá sản phẩm" });
    } else {
      res.status(404);
      throw new Error("Không tìm thấy sản phẩm");
    }
  })
);

export default productRoute;
