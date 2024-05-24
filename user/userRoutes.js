const userRoutes = require("express").Router();
const { verifyToken } = require("../middleware/tokenAuth");
const {
  companyCreation,
  loginUser,
  addClient,
  getClientList,
  deleteClient,
  updateClientPassword,
} = require("./userController");
//ALL USERS POST REQUEST
userRoutes.post("/createCompany", companyCreation);
userRoutes.post("/login", loginUser);
userRoutes.post("/addClient", verifyToken, addClient);
userRoutes.post("/getClientList", getClientList);
//ALL DELETE REQ FOR USERS
userRoutes.delete("/clients/:clientUserName", verifyToken, deleteClient);
//ALL PUT REQ FOR USERS
userRoutes.put(
  "/updateClientPassword/:username",
  verifyToken,
  updateClientPassword
);
module.exports = userRoutes;
