require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const sellerRoutes = require('./routes/SellerRoutes');
const cors = require('cors');
const { ConnectCloudinary } = require('./config/cloudinary');
const app = express();


app.use(express.json());
app.use(cors());
app.use('/api/seller', sellerRoutes);
ConnectCloudinary()


const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 20000,})
  .then(() => {
    console.log("DB Connected");
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
