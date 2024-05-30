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
  const { clientUserName } = req.params;
  if (!clientUserName) {
    return res.status(400).json({ error: "username is required." });
  }
  try {
    const user = await User.findOne({ username: clientUserName }, "credits");
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
  const { clientUserName } = req.params;
  const { credits, username, creatorDesignation } = req.body;

  try {
    const user = await User.findOne({ username: username });
    const clientUser = await User.findOne({ username: clientUserName });

    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }
    if (!clientUser) {
      return res.status(400).json({ error: "Client user not found." });
    }
    if (
      typeof credits !== "string" ||
      isNaN(parseFloat(credits)) ||
      !isFinite(credits)
    ) {
      return res.status(400).json({ error: "Invalid credits value." });
    }
    const creditValue = parseInt(credits);
    const userCredits = user.credits + creditValue;
    const clientUserCredits = clientUser.credits + creditValue;

    if (user.designation !== "company" && userCredits < 0) {
      return res
        .status(400)
        .json({ error: "Insufficient credits for this transaction." });
    }
    if (clientUserCredits < 0) {
      return res.status(400).json({
        error: "Invalid credit update. Client's credits would become negative.",
      });
    }

    const transaction = await Transaction.create({
      credit: credits,
      creditorDesignation: creatorDesignation,
      debitorDesignation: clientDesignation[creatorDesignation],
      creditor: username,
      debitor: clientUserName,
    });

    // Update client user
    await User.findOneAndUpdate(
      { username: clientUserName },
      {
        $push: { transactions: transaction._id },
        credits: clientUserCredits,
        ...(creditValue > 0 && {
          totalRecharged: clientUser.totalRecharged + creditValue,
        }),
        ...(creditValue < 0 && {
          totalRedeemed: clientUser.totalRedeemed + Math.abs(creditValue),
        }),
      },
      { new: true }
    );

    // Update user (creditor)
    await User.findOneAndUpdate(
      { username: username },
      {
        $push: { transactions: transaction._id },
        credits: userCredits,
      },
      { new: true }
    );

    return res.status(200).json({ message: "Credits updated successfully." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
};

//{getTransanctionOnBasisOfDatePeriod OF USER}
const getTransanctionOnBasisOfDatePeriod = async (req, res) => {
  const {
    pageNumber = 1,
    limit = 20,
    designation,
    hierarchyName,
    startDate,
    endDate,
  } = req.body;

  const page = parseInt(pageNumber);
  const limitValue = parseInt(limit);

  const startIndex = (page - 1) * limitValue;
  const endIndex = page * limitValue;

  const results = {};

  var totalPageCount = await Transaction.countDocuments().exec();

  if (endIndex < totalPageCount) {
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

  try {
    if (designation === "company") {
      if (hierarchyName !== "all") {
        const transactions = await Transaction.find({
          $and: [
            {
              $or: [
                { creditorDesignation: hierarchyName },
                { debitorDesignation: hierarchyName },
              ],
            },
            {
              createdAtDate: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          ],
        })
          .limit(limitValue)
          .skip(startIndex)
          .exec();
        totalPageCount = await Transaction.find({
          $and: [
            {
              $or: [
                { creditorDesignation: hierarchyName },
                { debitorDesignation: hierarchyName },
              ],
            },
            {
              createdAtDate: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          ],
        })
          .countDocuments()
          .exec();

        const transactionsFiltered = transactions.map((items) => {
          if (items.creditor === clientUserName)
            return { ...items.toObject(), creditor: "COMPANY" };
          return items.toObject();
        });

        if (transactionsFiltered)
          return res.status(200).json({ transactionsFiltered, totalPageCount });
        return res
          .status(201)
          .json({ error: "unable to find transactions try again" });
      } else {
        const transactions = await Transaction.find({
          createdAtDate: { $gte: startDate, $lte: endDate },
        })
          .limit(limitValue)
          .skip(startIndex)
          .exec();
        totalPageCount = await Transaction.find({
          createdAtDate: { $gte: startDate, $lte: endDate },
        })
          .countDocuments()
          .exec();

        const transactionsFiltered = transactions.map((items) => {
          if (items.creditor === clientUserName)
            return { ...items.toObject(), creditor: "COMPANY" };
          return items.toObject();
        });

        if (transactionsFiltered)
          return res.status(200).json({ transactionsFiltered, totalPageCount });
        return res
          .status(201)
          .json({ error: "unable to find transactions try again" });
      }
    } else {
      const transactions = await Transaction.find({
        $and: [
          {
            $or: [{ creditor: clientUserName }, { debitor: clientUserName }],
          },
          {
            createdAtDate: { $gte: startDate, $lte: endDate },
          },
        ],
      })
        .limit(limitValue)
        .skip(startIndex)
        .exec();
      const transactionsFiltered = transactions.map((items) => {
        if (items.creditor === clientUserName)
          return { ...items.toObject(), creditor: "Me" };
        if (items.debitor === clientUserName)
          return { ...items.toObject(), creditor: "YourOwner", debitor: "Me" };
        return items.toObject();
      });

      if (transactionsFiltered)
        return res.status(200).json({ transactionsFiltered });
      return res
        .status(201)
        .json({ error: "unable to find transactions try again" });
    }
  } catch (err) {
    return res.status(500).json(err);
  }
};
//{UPDATE PLAYER CREDITS}
const updatePlayerCredits = async (req, res) => {
  try {
    const { playerUserName, newCredits } = req.body;
    const player = await User.findOne({ username: playerUserName });

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }
    const playerUserCredits = parseInt(player.credits) + parseInt(newCredits);
    const transaction = await Transaction.create({
      credit: newCredits,
      creditor: "game",
      creditorDesignation: "game",
      debitor: "game",
    });
    await User.findOneAndUpdate(
      { username: playerUserName },
      { $push: { transactions: transaction._id } }
    );
    const updatedPlayer = await User.findOneAndUpdate(
      { username: playerUserName },
      { credits: playerUserCredits },
      { new: true }
    );

    if (updatedPlayer) {
      return res
        .status(200)
        .json({ message: "Player credits updated successfully" });
    } else {
      return res
        .status(500)
        .json({ error: "Unable to update player credits, please try again" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
//{GET TRANSACTIONS OF USERS}
const transactions = async (req, res) => {
  const { clientUserName } = req.params;
  try {
    const user = await User.findOne({ username: clientUserName });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.populate("transactions");
    console.log(user.transactions);
    return res.status(200).json(user.transactions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getRealTimeCredits,
  updateClientCredits,
  getTransanctionOnBasisOfDatePeriod,
  updatePlayerCredits,
  transactions,
};
