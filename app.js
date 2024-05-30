const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./user/userRoutes.js");
const transactionRoutes = require("./transaction/transactionRoutes.js");
const companyController = require("./controllers/index.js");
require("dotenv").config();

const corsOptions = {
  origin: [
    "*",
    
    "http://192.168.1.26:5173",
    "http://localhost:3000",
    "https://game-crm-backend-r32s.onrender.com",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
const mongoDBUrl = process.env.MONGOURL;
main().then(() => console.log("database connected"));
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDBUrl);
}
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// TEST ROUTES
app.get("/", (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: new Date().toLocaleDateString(),
  };
  res.status(200).json(health);
});
//OTHER ROUTES
app.use("/api/users", userRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/company", companyController);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("server started at ", PORT));
