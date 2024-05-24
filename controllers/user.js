const res = require("express/lib/response");
var jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const Transaction = require("../models/transaction");

const clientDesignation = {
  company: "master",
  master: "distributer",
  distributer: "subDistributer",
  subDistributer: "store",
  store: "player",
};

const getRealTimeCredits = async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.body.userName }, "credits");
    return res.status(200).json({ credits: user.credits });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateClientCredits = async (req, res) => {
  console.log("upda", req.bo);
  try {
    const clientUser = await User.findOne({
      userName: req.body.clientUserName,
    });
    var clientUserCredits =
      parseInt(clientUser.credits) + parseInt(req.body.credits);

    const user = await User.findOne({ userName: req.body.userName });
    var userCredits = parseInt(user.credits) - parseInt(req.body.credits);

    if (user.designation != "company") {
      if (req.body.credits >= 0) {
        if (userCredits <= 0)
          return res.status(201).json({
            error:
              "Transcation dropped due to unexpedcted transcation update,Please try again",
          });
      } else if (clientUserCredits <= 0)
        return res.status(201).json({
          error:
            "Transcation dropped due to unexpedcted credit update,Please try again",
        });
    } else if (clientUserCredits <= 0)
      return res.status(201).json({
        error:
          "Transcation dropped due to unexpedcted credit update,Please try again",
      });

    const transaction = await Transaction.create({
      credit: req.body.credits,
      creditorDesignation: req.body.designation,
      debitorDesignation: clientDesignation[req.body.designation],
      creditor: req.body.userName,
      debitor: req.body.clientUserName,
    });

    const updateClientTransaction = await User.findOneAndUpdate(
      { userName: req.body.clientUserName },
      { $push: { transactions: transaction._id } },
      { new: true }
    );

    const updatedClient = await User.findOneAndUpdate(
      { userName: req.body.clientUserName },
      {
        credits: clientUserCredits,
      },
      { new: true }
    );

    if (req.body.credits > 0) {
      const updatedClientRecharge = await User.findOneAndUpdate(
        { userName: req.body.clientUserName },
        {
          totalRecharged: clientUser.totalRecharged + req.body.credits,
        },
        { new: true }
      );
    }

    if (req.body.credits < 0) {
      const updatedClientReedem = await User.findOneAndUpdate(
        { userName: req.body.clientUserName },
        {
          totalRedeemed: clientUser.totalRedeemed + req.body.credits,
        },
        { new: true }
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { userName: req.body.userName },
      {
        credits: userCredits,
      },
      { new: true }
    );

    if (updatedUser) return res.status(200).json({});
    return res.status(201).json({ error: "unable to update client try again" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const getTransanctionOnBasisOfDatePeriod = async (req, res) => {
  const page = parseInt(req.body.pageNumber) || 1;
  const limit = parseInt(req.body.limit) || 20;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};

  var totalPageCount = await Transaction.countDocuments().exec();

  if (endIndex < totalPageCount) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }

  try {
    if (req.body.designation == "company") {
      if (req.body.hirarchyName != "all") {
        const transactions = await Transaction.find({
          $and: [
            {
              $or: [
                { creditorDesignation: req.body.hirarchyName },
                { debitorDesignation: req.body.hirarchyName },
              ],
            },
            {
              createdAtDate: {
                $gte: req.body.startDate,
                $lte: req.body.endDate,
              },
            },
          ],
        })
          .limit(limit)
          .skip(startIndex)
          .exec();
        totalPageCount = await Transaction.find({
          $and: [
            {
              $or: [
                { creditorDesignation: req.body.hirarchyName },
                { debitorDesignation: req.body.hirarchyName },
              ],
            },
            {
              createdAtDate: {
                $gte: req.body.startDate,
                $lte: req.body.endDate,
              },
            },
          ],
        })
          .countDocuments()
          .exec();

        const transactionsFiltered = transactions.map((items) => {
          if (items.creditor == req.body.userName)
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
          createdAtDate: { $gte: req.body.startDate, $lte: req.body.endDate },
        })
          .limit(limit)
          .skip(startIndex)
          .exec();
        totalPageCount = await Transaction.find({
          createdAtDate: { $gte: req.body.startDate, $lte: req.body.endDate },
        })
          .countDocuments()
          .exec();

        const transactionsFiltered = transactions.map((items) => {
          if (items.creditor == req.body.userName)
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
            $or: [
              { creditor: req.body.userName },
              { debitor: req.body.userName },
            ],
          },
          {
            createdAtDate: { $gte: req.body.startDate, $lte: req.body.endDate },
          },
        ],
      })
        .limit(limit)
        .skip(startIndex)
        .exec();
      const transactionsFiltered = transactions.map((items) => {
        if (items.creditor == req.body.userName)
          return { ...items.toObject(), creditor: "Me" };
        if (items.debitor == req.body.userName)
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

const updatePlayerCredits = async (req, res) => {
  try {
    const player = await User.findOne({ userName: req.body.playerUserName });
    var playerUserCredits =
      parseInt(player.credits) + parseInt(req.body.credits);

    const transaction = await Transaction.create({
      credit: req.body.credits,
      creditor: "game",
      creditorDesignation: "game",

      debitor: "game",
    });

    const updateClientTransaction = await User.findOneAndUpdate(
      { userName: req.body.playerUserName },
      { $push: { transactions: transaction._id } },
      { new: true }
    );

    const updatedPalyerUserCredits = await User.findOneAndUpdate(
      { userName: req.body.playerUserName },
      {
        credits: playerUserCredits,
      },
      { new: true }
    );

    if (updatedPalyerUserCredits) return res.status(200).json({});
    return res
      .status(201)
      .json({ error: "unable to update Player credits try again" });
  } catch (err) {
    return res.status(500).json(err);
  }
};



const updateClientActivity = async (req, res) => {
  try {
    const updatedClient = await User.findOneAndUpdate(
      { userName: req.body.clientUserName },
      {
        activeStatus: !req.body.activeStatus,
      },
      { new: true }
    );

    if (updatedClient) return res.status(200).json({});
    return res
      .status(201)
      .json({ error: "unable to update client activity try again" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const deleteClient = async (req, res) => {
  try {
    const deletedClient = await User.findOneAndDelete({
      userName: req.body.clientUserName,
    });
    if (deletedClient) return res.status(200).json({});
    return res.status(201).json({ error: "Unable to delete client try again" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const addClient = async (req, res) => {
  try {
    if (await User.findOne({ userName: req.body.clientUserName }))
      return res.status(201).json({ error: "This username already exist" });

    var designation = "";

    if (req.body.designation == "subDistributer") {
      if (!req.body.isPlayer)
        designation = clientDesignation[req.body.designation];
      else designation = "player";
    } else designation = clientDesignation[req.body.designation];

    const password = jwt.sign(req.body.password, process.env.JWT_SECRET);

    const newClient = await User.create({
      userName: req.body.clientUserName,
      password,
      nickName: req.body.clientNickName,
      designation,
    });

    if (newClient) {
      await addClientToUserList(req.body.userName, newClient._id);
      return res.status(200).json({});
    } else return res.status(201).json({});
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const transactions = async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.body.clientUserName });
    const transactions = await user.populate("transactions");
    console.log(transactions);
    return res.status(200).json(transactions.transactions);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  updatePlayerCredits,
  updateClientActivity,
  updateClientPassword,
  getTransanctionOnBasisOfDatePeriod,
  getClientList,
  getRealTimeCredits,
  addClient,
  updateClientCredits,
  deleteClient,
  transactions,
};
