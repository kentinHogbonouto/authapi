//import modules
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJsDocs = YAML.load("./api.yaml");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

//import routes
const router = require("./routes/routes");

//Database connection
mongoose
  .connect(process.env.DB_URI)
  .then((data) => console.log("connect"))
  .catch((err) => console.log(err));

//initialize server
const app = express();

//use modules
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/auth/api", router);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJsDocs));

//listen PORT
const PORT = process.env.PORT;
app.listen(PORT || 3000);
