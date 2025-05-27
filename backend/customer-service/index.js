require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const customerRoutes = require("./routes/CustomerRoutes");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

// Debug middleware (có thể bỏ nếu không cần log request)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

// Đăng ký route cho customer service
app.use("/api/customer", customerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("DB Connected");
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
