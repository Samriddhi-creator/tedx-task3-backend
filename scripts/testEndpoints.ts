import mongoose from "mongoose";
import dotenv from "dotenv";
import { CartModel } from "../model/cart.model.js";

dotenv.config({ path: "./config/.env" });

async function runIntegrationTest() {
  const userId = new mongoose.Types.ObjectId().toString();
  const baseUrl = "http://localhost:5005";

  console.log("Starting network integration test against:", baseUrl);
  console.log("Using generated Test User ID:", userId);

  try {
    // 1. Add item to cart
    console.log("\n1. Sending POST /cart/add...");
    const addRes = await fetch(`${baseUrl}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        productId: "session-1-pass",
        quantity: 2,
        productType: "TICKET",
      }),
    });
    const addJson = await addRes.json() as any;
    console.log("Response:", JSON.stringify(addJson, null, 2));
    if (!addJson.success) throw new Error("Failed to add item to cart");

    // 2. Fetch cart
    console.log("\n2. Sending GET /cart/:userId...");
    const fetchRes = await fetch(`${baseUrl}/cart/${userId}`);
    const fetchJson = await fetchRes.json() as any;
    console.log("Response:", JSON.stringify(fetchJson, null, 2));
    if (!fetchJson.success) throw new Error("Failed to fetch cart");

    // 3. Checkout
    console.log("\n3. Sending POST /cart/checkout...");
    const checkoutRes = await fetch(`${baseUrl}/cart/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        userDetails: {
          fullName: "Test User",
          email: "test@example.com",
          phone: "1234567890",
        },
        deliveryDetails: {
          type: "in-campus",
          hostel: "CV Raman",
          roomNumber: "A-101",
          notes: "Fragile cargo",
        },
      }),
    });
    const checkoutJson = await checkoutRes.json() as any;
    console.log("Response:", JSON.stringify(checkoutJson, null, 2));
    if (!checkoutJson.success) throw new Error("Checkout request failed");

    // 4. Fetch cart again (should fail/return 404 since no PENDING cart exists)
    console.log("\n4. Fetching cart again (should return 404 since ordered cart is not active)...");
    const fetchAgainRes = await fetch(`${baseUrl}/cart/${userId}`);
    const fetchAgainJson = await fetchAgainRes.json() as any;
    console.log("Response (expected failure):", JSON.stringify(fetchAgainJson, null, 2));
    if (fetchAgainJson.success) {
      throw new Error("Success returned when fetching checked-out cart, expected 404 error!");
    }

    // 5. Connect to DB to verify the saved order document exists and is correct
    console.log("\n5. Connecting to MongoDB to verify saved document...");
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI not defined");
    await mongoose.connect(mongoUri);

    const savedOrder = await CartModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!savedOrder) throw new Error("Order document not found in database!");

    console.log("Successfully found saved order in database:");
    console.log("Status:", savedOrder.status);
    console.log("Customer:", savedOrder.customerName);
    console.log("User Details:", JSON.stringify(savedOrder.userDetails, null, 2));
    console.log("Delivery Details:", JSON.stringify(savedOrder.deliveryDetails, null, 2));

    if (savedOrder.status !== "ORDERED") {
      throw new Error(`Expected status ORDERED but got ${savedOrder.status}`);
    }
    if (savedOrder.userDetails?.email !== "test@example.com") {
      throw new Error("User details mismatch!");
    }

    // Clean up
    await CartModel.deleteOne({ userId: new mongoose.Types.ObjectId(userId) });
    console.log("\nCleaned up integration test cart from database.");

    await mongoose.disconnect();
    console.log("\nALL API INTEGRATION TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } catch (err: any) {
    console.error("\nIntegration test failed:", err.message || err);
    process.exit(1);
  }
}

runIntegrationTest();
