const express = require("express");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const viewRoutes = require("./routes/reviewsRoutes");
const orderRoutes = require("./routes/orderRoutes");
const couponRoutes = require("./routes/couponRoutes");
// const cartRoutes = require("./routes/cartRoutes");
const notificationRoutes = require('./routes/notificationRoutes');


require('./events/orderListeners');
require('./events/productListeners'); 
const requestLogger=require('./middlewares/requestLogger');

const logger = require('./middlewares/logger');
const errorHandler = require("./middlewares/errorHandler");
const cartRoutes = require("./routes/cartRoutes");
const { connect } = require("mongoose");
// const connectDB = require("./config/db");
// const {corsOptions}=require('./middlewares/security');


helmet=require('helmet');

const connectDB = require("./config/db");
const { corsOptions } = require('./middlewares/security');
const cors = require('cors');
require("dotenv").config();
const helmet = require('helmet');


const app = express();
app.use(requestLogger);

app.use(express.json());
app.use(logger);
app.use(helmet());
app.use(cors(corsOptions));

connectDB();

// swagger
const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "E-Market API Documentation",
      version: "1.0",
      description: "This is a full documentation for our E-Market api",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: [
    "./routes/*.js",
    "./controllers/*.js",
    "./models/*.js" ]
};

app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/auth", authRoutes);
app.use("/product", viewRoutes);
app.use("/carts", cartRoutes);
app.use("/orders", orderRoutes);
app.use('/notifications', notificationRoutes);

app.use("/coupons", couponRoutes);

app.use("/uploads", express.static("uploads"));

const specs = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

app.use(require('./middlewares/notFound'));

async function run() {
  try {
    await connectDB();
    console.log(" Running goes well");
  } catch (error) {
    console.log(error);
  }
}

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  run();
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;