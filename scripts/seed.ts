import mongoose from "mongoose";
import dotenv from "dotenv";
import { ProductModel } from "../model/product.model.js";

dotenv.config({ path: "./config/.env" });

const seedProducts = [
  {
    name: "Session 1 Pass",
    slug: "session-1-pass",
    description: "Access to the morning expedition talks and main archive hall.",
    price: 150,
    type: "TICKET" as const,
    currency: "INR",
    stock: 100,
    isUnlimitedStock: true,
    images: ["/images/session1.jpg"],
    sizes: [],
    isActive: true,
  },
  {
    name: "Complete Manifest Pass",
    slug: "complete-manifest-pass",
    description: "Full access to all sessions, workshops, and the evening symposium.",
    price: 350,
    type: "TICKET" as const,
    currency: "INR",
    stock: 100,
    isUnlimitedStock: true,
    images: ["/images/manifest.jpg"],
    sizes: [],
    isActive: true,
  },
  {
    name: "Terra Incognita T-Shirt",
    slug: "ti-tshirt",
    description: "Heavyweight cotton standard issue apparel with minimal coordinate prints.",
    price: 450,
    type: "MERCH" as const,
    currency: "INR",
    stock: 100,
    isUnlimitedStock: true,
    images: ["/images/tshirt.jpg"],
    sizes: ["S", "M", "L", "XL"],
    isActive: true,
  },
  {
    name: "Expedition Tote",
    slug: "expedition-tote",
    description: "Durable canvas carry-all for field notes and collected artifacts.",
    price: 250,
    type: "MERCH" as const,
    currency: "INR",
    stock: 100,
    isUnlimitedStock: true,
    images: ["/images/tote.jpg"],
    sizes: [],
    isActive: true,
  },
  {
    name: "Coordinate Pin Set",
    slug: "coordinate-pin-set",
    description: "Three enamel pins detailing the event's geographical markers.",
    price: 75,
    type: "MERCH" as const,
    currency: "INR",
    stock: 3,
    isUnlimitedStock: false,
    images: ["/images/pins.jpg"],
    sizes: [],
    isActive: true,
  },
];

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI not specified in environment");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully.");

    console.log("Clearing existing products...");
    await ProductModel.deleteMany({});

    console.log("Inserting seed products...");
    const result = await ProductModel.insertMany(seedProducts);
    console.log(`Successfully seeded ${result.length} products!`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
