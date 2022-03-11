//import modules
const jwt = require("jsonwebtoken");

//token checker middleware
module.exports = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers.token["x-accsess-token"];
  if (token) {
    jwt.verify(token, jwtKey, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ error: true, message: "unauthorize access" });
      }
      req.decoded = decoded;
      next();
    });
  }
  return res.status(403).send({
    error: true,
    message: "nNo token provided",
  });
};
