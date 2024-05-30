const userRoutes = require("express").Router();
const { verifyAuth } = require("../middleware/auth");
const { verifyToken } = require("../middleware/tokenAuth");
const {
  companyCreation,
  loginUser,
  addClient,
  getClientList,
  deleteClient,
  updateClientPassword,
  updateClientStatus,
  clientData,
} = require("./userController");
//ALL USERS POST REQUEST
userRoutes.post("/createCompany", companyCreation);
userRoutes.post("/login", loginUser);
userRoutes.post("/addClient", verifyToken, addClient);
userRoutes.post("/getClientList", getClientList);
//ALL DELETE REQ FOR USERS
userRoutes.delete("/clients/:username", verifyAuth, deleteClient);
//ALL PUT REQ FOR USERS
userRoutes.put(
  "/updateClientPassword/:clientUserName",
  verifyToken,
  updateClientPassword
);
userRoutes.put(
  "/clientsStatus/:clientUserName",
  verifyToken,
  updateClientStatus
);
//ALL GET REQ FOR USERS
userRoutes.get("/userData", verifyToken, clientData);
module.exports = userRoutes;
