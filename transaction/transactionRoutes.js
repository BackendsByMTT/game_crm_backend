const transactionRoutes = require("express").Router();
const { verifyToken } = require("../middleware/tokenAuth");
const {
  getRealTimeCredits,
  updateClientCredits,
  updatePlayerCredits,
  getTransanctionOnBasisOfDatePeriod,
  transactions,
} = require("./transactionController");
//ALL USERS POST REQUEST
transactionRoutes.post(
  "/getRealTimeCredits/:clientUserName",
  getRealTimeCredits
);
transactionRoutes.post(
  "/updateCredits/:clientUserName",
  verifyToken,
  updateClientCredits
);
transactionRoutes.post(
  "/updatePlayerCreditsInGame",
  verifyToken,
  updatePlayerCredits
);
transactionRoutes.post(
  "/getTransanctionOnBasisOfDatePeriod",
  getTransanctionOnBasisOfDatePeriod
);

//ALL GET REQ FOR USERS
transactionRoutes.get(
  "/transactions/:clientUserName",
  verifyToken,
  transactions
);
//ALL PUT REQ FOR USERS

module.exports = transactionRoutes;
