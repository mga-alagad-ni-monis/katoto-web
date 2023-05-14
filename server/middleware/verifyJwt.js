const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).send("Error 401 Unauthorized");
  }

  jwt.verify(
    authHeader.split(" ")[1],
    process.env.ACCESS_TOKEN,
    (err, decoded) => {
      if (err) {
        return res.status(403).send("Error 403 Forbidden");
      }
      req.email = decoded.email;
      req.role = decoded.role;
      next();
    }
  );
};

module.exports = { verifyJwt };
