import express from "express";
import "dotenv/config";
import dbConnect from "./dbConfig/db.js";

import ProductRoutes from "./routes/product.routes.js";
import OrderRoutes from "./routes/order.routes.js";
import CategoryRoutes from "./routes/category.routes.js";
import BusinessRoutes from "./routes/business.routes.js";

import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Routes

app.use("/api/v1/product", ProductRoutes);
app.use("/api/v1/order", OrderRoutes);
app.use("/api/v1/category", CategoryRoutes);
app.use("/api/v1/business", BusinessRoutes);

app.get("/", (req, res) => {
  return res.send("Hi! Welcome");
});

// Database connections and server start
dbConnect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error(`Server startup error: ${error}`);
    process.exit(1);
  });