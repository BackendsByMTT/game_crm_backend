const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const cookie =
    req.cookies.userToken ||
    req.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("userToken="))
      ?.split("=")[1];

  if (cookie) {
    jwt.verify(cookie, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("Token verification failed:", err.message);
        return res.status(401).json({ error: "You are not authenticated" });
      } else {
        req.body = { ...req.body, creatorDesignation: decoded.designation };
        console.log({ ...req.body });
        next();
      }
    });
  } else {
    return res.status(401).json({ error: "You are not authenticated" });
  }
};

module.exports = { verifyToken };
