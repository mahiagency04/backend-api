import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";

const app = express();
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true
// }));

// app.use(cors({
//   origin: true,
//   credentials: true
// }));
 
app.use(cors({
  origin: [
    "https://www.mahiagency.in",
    "https://mahiagency.in"
  ],
  credentials: true
}));


// console.log("JWT_SECRET_KEY =", process.env.JWT_SECRET_KEY);

mongoose.connect("mongodb+srv://mahiagency04_db_user:ciRWzrad3jILoJmj@mahiagency.w4xesys.mongodb.net/", {
    dbName: "Mahi_Agency"
}).then(()=>console.log("MongoDB is Connected!"))

// app.use(cors())

app.use(express.json())

app.use("/api/user", userRoutes)

app.use("/api/order", orderRoutes);

app.use("/api/delivery", deliveryRoutes);

// app.use("/uploads", express.static("uploads"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use(
//   "/uploads",
//   express.static(path.join(process.cwd(), "uploads"))
// );

const port = 4000;

// app.listen(port,()=>console.log(`Server is running on port ${port}`))

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on all devices at port ${port}`);
});