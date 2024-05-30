const res = require("express/lib/response");
var jwt = require('jsonwebtoken');
const User = require("../models/userSchema");
const Transaction = require("../models/transaction");


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const loginPlayer = async (req, res) => {
    try {
        const user = await User.findOne({ userName: req.body.userName }, 'userName password activeStatus designation credits');
        if (!user)
            return res.status(201).json({ error: "Yor are not registered kindly contact your owner" });
        if (user.designation != 'player')
            return res.status(201).json({ error: "Yor are not registered kindly contact your owner" });
        
        const password = jwt.verify(user.password, process.env.CLIENT_ADD_PASSWORD);

        if (password != req.body.password)
            return res.status(201).json({ error: "Wrong credentials" })

        if (!user.activeStatus)
            return res.status(204).json({})

        const istOffset = 5.5 * 60 * 60 * 1000; // Indian Standard Time offset in milliseconds (5 hours and 30 minutes)
        const istDate = new Date(Date.now() + istOffset);

        const updatedUserLoginTime = await User.findOneAndUpdate({ userName: req.body.userName }, { lastLogin: istDate.toISOString() });

        const token = jwt.sign({ userName: req.body.userName, password: req.body.password, designation: user.designation }, process.env.JWT_SECRET)
        return res.status(200).json({ userName: user.userName, nickName: user.nickName, designation: user.designation, token: token, credits: user.credits })
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

const getRealTimePlayerCredits = async (req, res) => {
    try {
        const user = await User.findOne({ userName: req.body.userName }, 'credits');
        console.log(req.body.userName, user.credits)
        return res.status(200).json({ credits: user.credits })
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}



const updatePlayerBet = async (req, res) => {
    try {
        if (req.body.credits >= 0)
            return res.status(201).json({ error: "Bet Cant be positive or 0" })

        const player = await User.findOne({ userName: req.body.userName })
        var playerCredits = parseInt(player.credits) + parseInt(req.body.credits)

        const transaction = await Transaction.create({
            credit: req.body.credits,
            creditorDesignation: "player",
            debitorDesignation: "player",
            creditor: req.body.userName,
            debitor: req.body.userName
        })

        const updatePlayerTransaction = await User.findOneAndUpdate(
            { userName: req.body.userName },
            { $push: { transactions: transaction._id } },
            { new: true }
        );

        const updatedPlayer = await User.findOneAndUpdate({ userName: req.body.userName }, {
            credits: playerCredits
        }, { new: true })


        if (updatedPlayer)
            return res.status(200).json({})
        return res.status(201).json({ error: "unable to update client try again" })
    } catch (err) {
        return res.status(500).json(err)
    }
}

const updatePlayerWin = async (req, res) => {
    try {
        if (req.body.credits <= 0)
            return res.status(201).json({ error: "Win Cant be Negative or 0" })

        const player = await User.findOne({ userName: req.body.userName })
        var playerCredits = parseInt(player.credits) + parseInt(req.body.credits)

        const transaction = await Transaction.create({
            credit: req.body.credits,
            creditorDesignation: "player",
            debitorDesignation: "player",
            creditor: req.body.userName,
            debitor: req.body.userName
        })

        const updatePlayerTransaction = await User.findOneAndUpdate(
            { userName: req.body.userName },
            { $push: { transactions: transaction._id } },
            { new: true }
        );

        const updatedPlayer = await User.findOneAndUpdate({ userName: req.body.userName }, {
            credits: playerCredits
        }, { new: true })


        if (updatedPlayer)
            return res.status(200).json({})
        return res.status(201).json({ error: "unable to update client try again" })
    } catch (err) {
        return res.status(500).json(err)
    }
}


const getTransanctionOnBasisOfDatePeriod = async (req, res) => {
    try {
        const transactions = await Transaction.find({ $and: [{ $or: [{ creditorDesignation: req.body.designation }, { debitorDesignation: req.body.designation }] }, { createdAtDate: { $gte: req.body.startDate, $lte: req.body.endDate } }] })
        const transactionsFiltered = transactions.map((items) => {
            if (items.creditor == req.body.userName)
                return { ...items.toObject(), creditor: "Me" }
            if (items.debitor == req.body.userName)
                return { ...items.toObject(), creditor: "YourOwner", debitor: "Me" }
            return items.toObject()
        })

        if (transactionsFiltered)
            return res.status(200).json({ transactionsFiltered })
        return res.status(201).json({ error: "unable to find transactions try again" })
    } catch (err) {
        return res.status(500).json(err)
    }
}

module.exports = { loginPlayer, getRealTimePlayerCredits, updatePlayerBet, updatePlayerWin,getTransanctionOnBasisOfDatePeriod };