require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtKey = process.env.JWT_KEY;
const jwtExpSec = 300;
const jwtRefreshExpSec = 8600;
const jwtRefreshKey = process.env.JWT_REFRESH_KEY;

const createUserToken = (userId, email, status) => {
  return jwt.sign(
    {
      userId,
      email,
      status,
    },
    jwtKey,
    { expiresIn: jwtExpSec }
  );
};

module.exports = createUserToken;
