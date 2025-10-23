const express = require("express");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const viewRoutes = require("./routes/reviewsRoutes");
const cartRoutes = require("./routes/cartRoutes");
const profileRoutes = require("./routes/pofileRoutes");

const logger = require('./middlewares/logger');
const errorHandler = require("./middlewares/errorHandler");
const auth = require("./middlewares/auth");

const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(logger);



// swagger
const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "E-Marker API Documentation",
      version: "1.0",
      description:
        "This is a full documentation for our E-Market api",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js"],
};

app.use("/users", auth, userRoutes);
app.use("/products", auth, productRoutes);
app.use("/categories", auth, categoryRoutes);
app.use("/auth", authRoutes);
app.use("/product", auth, viewRoutes);
app.use("/carts", auth, cartRoutes);
app.use("/profiles", auth, profileRoutes);

const specs = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true})
);


app.use(require('./middlewares/notFound'));

async function run() {
  try {
   
    await connectDB();
    console.log("✅running goes well");
  } catch (error) {
    console.log(error);
  }
}
app.use(errorHandler);

app.listen(process.env.PORT, run());