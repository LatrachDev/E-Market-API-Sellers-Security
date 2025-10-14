const express = require("express");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const logger = require('./middlewares/logger');
const errorHandler = require("./middlewares/errorHandler");
const ViewsRoutes=require('./routes/viewsRoutes');
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(logger);
 app.get('/',(req,res)=>{
  res.send("hello meriem el mecaniqui ");
 })
mongoose.connect(process.env.MONGO_URI);

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
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/product",ViewsRoutes); 

const specs = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true})
);

// 




async function run() {
  try {
    console.log(" running goes well");
  } catch (error) {
    console.log(error);
  }
}
app.use(errorHandler);

app.listen(process.env.PORT, run());
