import mongoose from "mongoose";

/**Hàm kết nối với MongoDB
 * MONGO_URL là địa chỉ mongodb để kết nối trong file env
 */
const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("Đã kết nối với mongo");
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDatabase;
