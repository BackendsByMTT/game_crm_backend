const jwt = require("jsonwebtoken");
const User = require("./userModel");
const Transaction = require("../transaction/transactionModel");
const bcrypt = require("bcrypt");
const clientDesignation = {
  company: "master",
  master: "distributer",
  distributer: "subDistributer",
  subDistributer: "store",
  store: "player",
};
//{create company controller}
const companyCreation = async (req, res) => {
  const { username, password } = req.body;

  // Check for required fields
  if (!username || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Check password length
  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password should be at least 6 characters" });
  }

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "This username is already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new company user
    const company = await User.create({
      username,
      password: hashedPassword,
      credits: 1000000,
      designation: "Company",
      activeStatus: true,
    });

    // Respond with success message and company data
    return res
      .status(201)
      .json({ message: "Company created successfully", company });
  } catch (err) {
    // Respond with server error
    return res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};
//{Login user controller}
const loginUser = async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  try {
    const user = await User.findOne(
      { username },
      "username password activeStatus designation credits"
    );
    const designation = user.designation;
    if (!user)
      return res.status(404).json({ error: "User not found. Please register" });

    const hashedPassword = user.password;
    const passwordIsValid = await bcrypt.compare(password, hashedPassword);

    if (!passwordIsValid)
      return res.status(401).json({ error: "Invalid credentials" });

    if (user.activeStatus !== true)
      return res.status(403).json({ error: "Account is inactive" });

    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(Date.now() + istOffset);

    const updatedUserLoginTime = await User.findOneAndUpdate(
      { username },
      { lastLogin: istDate.toISOString() }
    );
    const updatedUserLoginTimes = await User.findOneAndUpdate(
      { username },
      { loginTimes: updatedUserLoginTime.loginTimes + 1 }
    );

    const token = jwt.sign(
      {
        username,
        designation,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("userToken", token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });
    // res.redirect("/dashboard");
    return res.status(200).json({
      username,
      nickname: username,
      designation: user.designation,
      credits: user.credits,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};
//{Add sub users to company}
const addClient = async (req, res) => {
  const {
    clientUserName,
    password,
    clientNickName,
    isPlayer,
    creatorDesignation,
  } = req.body;

  try {
    if (await User.findOne({ username: clientUserName })) {
      return res.status(409).json({ error: "Username already exists" });
    }
    let finalDesignation;

    if (creatorDesignation === "subDistributor" && !isPlayer) {
      finalDesignation =
        clientDesignation[req.body.designation] || "subDistributor";
    } else if (isPlayer) {
      finalDesignation = "player"; 
    } else {
      finalDesignation = clientDesignation[req.body.designation];
    }

    // console.log("Received designation:", req.body.designation);
    // console.log("Final designation:", finalDesignation);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username: clientUserName,
      password: hashedPassword,
      nickName: clientNickName,
      designation: finalDesignation,
    });

    if (newUser) {
      await addClientToUserList(clientUserName, newUser._id);
      return res.status(201).json({ message: "Client added successfully" });
    } else {
      return res.status(500).json({ error: "Failed to create client" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
//{addClientToUserList from addClient}
async function addClientToUserList(userId, clientId) {
  try {
    const updatedUserClients = await User.findOneAndUpdate(
      { username: userId },
      { $push: { clientList: clientId } },
      { new: true }
    );
    if (!updatedUserClients) {
      res.status(201).json({ error: "failed to add" });
    }
    return updatedUserClients;
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
//{getRealTimeCredits of users}
const getClientList = async (req, res) => {
  const {
    pageNumber,
    limit,
    username,
    isAll,
    isActive,
    isAllClients,
    isStorePlayers,
  } = req.body;

  const page = parseInt(pageNumber) || 1;
  const limitValue = parseInt(limit) || 10;

  const startIndex = (page - 1) * limitValue;

  const results = {};

  try {
    const user = await User.aggregate([
      { $match: { username: username } },
      {
        $project: {
          clientCount: { $size: "$clientList" },
          designation: 1,
        },
      },
    ]);
  
    const totalClientCount = user[0].clientCount;

    if (!totalClientCount) {
      return res.status(404).json({ error: "No User Found for this client" });
    }

    if (startIndex + limitValue < totalClientCount) {
      results.next = {
        page: page + 1,
        limit: limitValue,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limitValue,
      };
    }

    var userList = {};
    if (user[0].designation == "subDistributer") {
      userList = await User.find({ username: username })
        .populate({
          path: "clientList",
          match: {
            activeStatus: isAll ? { $in: [true, false] } : isActive,
            designation: isAllClients
              ? { $in: ["store", "player"] }
              : isStorePlayers
              ? "store"
              : "player",
          },
          select:
            "username nickName activeStatus designation credits totalRedeemed totalRecharged lastLogin loginTimes",
          options: {
            limit: limitValue,
            skip: startIndex,
          },
        })
        .exec();
    } else {
      userList = await User.find({ username: username })
        .populate({
          path: "clientList",
          match: {
            activeStatus: isAll ? { $in: [true, false] } : isActive,
          },
          select:
            "username nickName activeStatus designation credits totalRedeemed totalRecharged lastLogin loginTimes",
          options: {
            limit: limitValue,
            skip: startIndex,
          },
        })
        .exec();
    }
    const userClientList = userList[0].clientList;
    if (!userClientList) {
      return res.status(201).json({ error: "No Clients Found" });
    }
    return res
      .status(200)
      .json({ userClientList, totalPageCount: totalClientCount });
  } catch (err) {
    return res.status(500).json(err);
  }
};
//{DELETE CLIENT}
const deleteClient = async (req, res) => {
  const { username } = req.params;
  try {
    const deletedClient = await User.findOneAndDelete({
      clientUserName: username,
    });
    if (!deletedClient) {
      return res.status(404).json({ error: "Client not found" });
    }
    return res
      .status(204)
      .json({ message: `Successfully deleted client ${username}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
//{change user password}
const updateClientPassword = async (req, res) => {
  const { changedPassword } = req.body;
  const { clientUserName } = req.params;
  // console.log(username);
  try {
    if (!clientUserName) {
      return res.status(400).json({ error: "Username is required." });
    }
    const newPassword = changedPassword;
    if (!newPassword) {
      return res.status(400).json({ error: "New password is required." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedClient = await User.findOneAndUpdate(
      { username: clientUserName },
      { password: hashedPassword },
      { new: true }
    );

    if (updatedClient) {
      return res
        .status(200)
        .json({ message: "Client password updated successfully." });
    } else {
      return res.status(404).json({ error: "Client not found." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error:
        "Internal server error occurred while updating the client password.",
    });
  }
};
const updateClientStatus = async (req, res) => {
  try {
    const { clientUserName } = req.params;
    const { activeStatus } = req.body;

    const updatedClient = await User.findOneAndUpdate(
      { username: clientUserName },
      {
        activeStatus: activeStatus,
      },
      { new: true }
    );

    if (updatedClient) {
      return res
        .status(200)
        .json({ message: "Client status updated successfully" });
    } else {
      return res.status(404).json({ error: "Client not found" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error", details: err });
  }
};
module.exports = {
  companyCreation,
  loginUser,
  addClient,
  getClientList,
  deleteClient,
  updateClientPassword,
  updateClientStatus,
};
