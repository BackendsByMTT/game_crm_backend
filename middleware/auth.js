const jwt = require("jsonwebtoken");

const verifyAuth = (req, res, next) => {
  const cookie =
    req.cookies.userToken ||
    req.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("userToken="))
      ?.split("=")[1];

  if (cookie) {
    jwt.verify(cookie, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          console.error("Token verification failed: Token expired");
          return res
            .status(401)
            .json({ error: "Token expired, please log in again" });
        } else {
          console.error("Token verification failed:", err.message);
          return res.status(401).json({ error: "You are not authenticated" });
        }
      } else {
        next();
      }
    });
  } else {
    return res.status(401).json({ error: "You are not authenticated" });
  }
};

module.exports = { verifyAuth };
