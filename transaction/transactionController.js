const jwt = require("jsonwebtoken");
const User = require("../user/userModel");
const Transaction = require("../transaction/transactionModel");
const bcrypt = require("bcrypt");
const clientDesignation = {
  company: "master",
  master: "distributer",
  distributer: "subDistributer",
  subDistributer: "store",
  store: "player",
};
//{GET THE DETAILS OF USERS CREDITS}
const getRealTimeCredits = async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: "username is required." });
  }
  try {
    const user = await User.findOne({ username }, "credits");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.status(200).json({ credits: user.credits });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "An error occurred while retrieving user credits." });
  }
};
//{UPDATE THE USER CREDITS}
const updateClientCredits = async (req, res) => {
  try {
    const { clientusername, username } = req.params;
    const clientUser = await User.findOne({
      clientusername,
    });
    var clientUserCredits =
      parseInt(clientUser.credits) + parseInt(req.body.credits);

    const user = await User.findOne({ username });
    var userCredits = parseInt(user.credits) - parseInt(req.body.credits);

    if (user.designation !== "company") {
      if (req.body.credits >= 0) {
        if (userCredits < 0)
          return res.status(400).json({
            error: "Insufficient credits for this transaction.",
          });
      } else if (clientUserCredits < 0)
        return res.status(400).json({
          error:
            "Invalid credit update. Client's credits would become negative.",
        });
    } else if (clientUserCredits < 0)
      return res.status(400).json({
        error: "Invalid credit update. Client's credits would become negative.",
      });

    const transaction = await Transaction.create({
      credit: req.body.credits,
      creditorDesignation: req.body.designation,
      debitorDesignation: clientDesignation[req.body.designation],
      creditor: username,
      debitor: clientusername,
    });

    await User.findOneAndUpdate(
      { username: clientusername },
      {
        $push: { transactions: transaction._id },
        $inc: {
          credits: parseInt(req.body.credits),
          totalRecharged: req.body.credits > 0 ? req.body.credits : 0,
          totalRedeemed: req.body.credits < 0 ? req.body.credits : 0,
        },
      },
      { new: true }
    );

    await User.findOneAndUpdate(
      { username },
      {
        $inc: { credits: -parseInt(req.body.credits) },
      },
      { new: true }
    );

    return res.status(200).json({ message: "Credits updated successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

module.exports = {
  getRealTimeCredits,
};
