import mongoose from "mongoose";
import dotenv from "dotenv";
import { ProductModel } from "../model/product.model.js";
import { CartModel } from "../model/cart.model.js";

dotenv.config({ path: "./config/.env" });

async function check() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI not specified in environment");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    const products = await ProductModel.find({});
    console.log("=== DB PRODUCTS ===");
    console.log(JSON.stringify(products, null, 2));

    const carts = await CartModel.find({});
    console.log("=== DB CARTS ===");
    console.log(JSON.stringify(carts, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error inspecting database:", error);
    process.exit(1);
  }
}

check();
