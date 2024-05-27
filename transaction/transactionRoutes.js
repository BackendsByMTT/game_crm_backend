const transactionRoutes = require("express").Router();
const { verifyToken } = require("../middleware/tokenAuth");
const { getRealTimeCredits } = require("./transactionController");
//ALL USERS POST REQUEST
transactionRoutes.post("/getRealTimeCredits", getRealTimeCredits);

//ALL DELETE REQ FOR USERS

//ALL PUT REQ FOR USERS

module.exports = transactionRoutes;
