import express from 'express';
import dotenv from "dotenv";
import connextDB from "./database/connect.js";
import adminRouter from "./routes/admin.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
dotenv.config({ path: "./config/.env" });
const app = express();
const PORT = process.env.PORT || 3000;

//Connect to MongoDB
connextDB();

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Routes
app.use("/admin/products", adminRouter);
app.use("/products", productRouter);
app.use("/cart", cartRouter);

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});