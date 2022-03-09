//import modules
const express = require("express"),
  path = require("path"),
  mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

//import routes
const router = require("./routes/routes");

//Database connection
mongoose.connect(process.env.DB_URI).then(data => console.log("connect")).catch(err => console.log(err));

//initialize server
const app = express();

//initialize body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//setting routes
app.use("/auth/api", router);

//listen PORT
const PORT = process.env.PORT;
app
  .listen(PORT || 3000);
