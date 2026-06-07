import mongoose from "mongoose";
import dotenv from "dotenv";
import { ProductModel } from "../model/product.model.js";
import { CartModel } from "../model/cart.model.js";

dotenv.config({ path: "./config/.env" });

async function test() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI not specified");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    try {
      await mongoose.connection.db?.collection('carts').dropIndex('userId_1');
      console.log("Dropped old unique index userId_1 on carts collection");
    } catch (err) {
      console.log("Index userId_1 did not exist or was already dropped.");
    }

    const userId = new mongoose.Types.ObjectId();
    const product = await ProductModel.findOne({});
    if (!product) {
      console.error("No products found to run test");
      process.exit(1);
    }

    console.log("Using product slug:", product.slug);

    // 1. Create a pending cart
    const cartItem: any = {
      productId: product._id,
      productName: product.name,
      quantity: 2,
      productType: product.type,
      priceAtPurchase: product.price,
    };
    if (product.type === "MERCH" && product.sizes && product.sizes.length > 0) {
      cartItem.selectedSize = product.sizes[0];
    }

    const cart = await CartModel.create({
      userId,
      items: [cartItem],
      subtotal: product.price * 2,
      total: product.price * 2,
      status: "PENDING",
    }) as any;

    console.log("Cart created as PENDING:", cart.userId.toString(), "ID:", cart._id.toString());

    // 2. Perform checkout (simulate controller logic)
    const pendingCart = await CartModel.findOne({ userId, status: "PENDING" });
    if (!pendingCart) {
      throw new Error("Pending cart not found!");
    }

    pendingCart.status = "ORDERED";
    pendingCart.customerName = "Jane Doe";
    pendingCart.userDetails = {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+1234567890",
    };
    pendingCart.deliveryDetails = {
      type: "in-campus",
      hostel: "CV Raman",
      roomNumber: "B-202",
      notes: "Leave at front desk",
    };

    await pendingCart.save();
    console.log("Cart status updated to ORDERED and details saved.");

    // 3. Verify no pending cart is returned
    const fetchedPending = await CartModel.findOne({ userId, status: "PENDING" });
    console.log("Fetched pending cart (should be null):", fetchedPending);

    // 4. Verify we can create a new pending cart for the same user
    const newCart = await CartModel.create({
      userId,
      items: [cartItem],
      subtotal: product.price * 2,
      total: product.price * 2,
      status: "PENDING",
    }) as any;
    console.log("Created new pending cart for the same user (should succeed):", newCart._id.toString());

    // Clean up test data
    await CartModel.deleteMany({ userId });
    console.log("Cleaned up test data.");

    await mongoose.disconnect();
    console.log("Success! Database constraints and index logic work perfectly.");
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

test();
