const res = require("express/lib/response");
var jwt = require('jsonwebtoken');
const User = require("../models/userSchema");
const Transaction = require("../models/transaction");



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const loginPlayer = async (req, res) => {
    console.log("req",req.body)
    try {
        const user = await User.findOne({ userName: req.body.userName }, 'userName password activeStatus designation credits');
        console.log("user",user)
        if (!user)
            return res.status(201).json({ error: "Yor are not registered kindly contact your owner" });
        if(user.designation!='player')
             return res.status(201).json({ error: "Yor are not registered kindly contact your owner" });
        if (user.password != req.body.password)
            return res.status(201).json({ error: "Wrong credentials" })

        if (!user.activeStatus)
            return res.status(204).json({})

        const istOffset = 5.5 * 60 * 60 * 1000; // Indian Standard Time offset in milliseconds (5 hours and 30 minutes)
        const istDate = new Date(Date.now() + istOffset);
             
        const updatedUserLoginTime = await User.findOneAndUpdate({ userName: req.body.userName }, {lastLogin:istDate.toISOString()});

        const token = jwt.sign({ userName: req.body.userName, password: req.body.password, designation: user.designation }, process.env.JWT_SECRET)
        return res.status(200).json({ userName: user.userName, nickName: user.nickName, designation: user.designation, token: token, credits: user.credits })
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

const getRealTimeCredits = async (req, res) => {
    try {
        const user = await User.findOne({ userName: req.body.userName }, 'credits');
        console.log(req.body.userName, user.credits)
        return res.status(200).json({ credits: user.credits })
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}



const updateClientCredits = async (req, res) => {
    console.log("update", req.body)
    try {
        const clientUser = await User.findOne({ userName: req.body.clientUserName })
        var clientUserCredits = parseInt(clientUser.credits) + parseInt(req.body.credits)

        const user = await User.findOne({ userName: req.body.userName })
        var userCredits = parseInt(user.credits) - parseInt(req.body.credits)

        const transaction = await Transaction.create({
            credit: req.body.credits,
            creditorDesignation: req.body.designation,
            debitorDesignation: clientDesignation[req.body.designation],
            creditor: req.body.userName,
            debitor: req.body.clientUserName
        })

        const updateClientTransaction = await User.findOneAndUpdate(
            { userName: req.body.clientUserName },
            { $push: { transactions: transaction._id } },
            { new: true }
        );


        const updatedClient = await User.findOneAndUpdate({ userName: req.body.clientUserName }, {
            credits: clientUserCredits
        }, { new: true })

        if (req.body.credits > 0) {
            const updatedClientRecharge = await User.findOneAndUpdate({ userName: req.body.clientUserName }, {
                totalRecharged: clientUser.totalRecharged + req.body.credits
            }, { new: true })
        }

        if (req.body.credits < 0) {
            const updatedClientReedem = await User.findOneAndUpdate({ userName: req.body.clientUserName }, {
                totalRedeemed: clientUser.totalRedeemed + req.body.credits        
            }, { new: true })
        }

        const updatedUser = await User.findOneAndUpdate({ userName: req.body.userName }, {
            credits: userCredits
        }, { new: true })


        if (updatedUser)
            return res.status(200).json({})
        return res.status(201).json({ error: "unable to update client try again" })
    } catch (err) {
        return res.status(500).json(err)
    }
}

const getTransanctionOnBasisOfDatePeriod = async (req, res) => {
    console.log("getBasisOfDate", req.body)
    try {
        if (req.body.designation == "company") {
            if (req.body.hirarchyName != "all") {
                const transactions = await Transaction.find({ $and: [{ $or: [{ creditorDesignation: req.body.hirarchyName }, { debitorDesignation: req.body.hirarchyName }] }, { createdAtDate: { $gte: req.body.startDate, $lte: req.body.endDate } }] })

                const transactionsFiltered = transactions.map((items) => {
                    if (items.creditor == req.body.userName)
                        return { ...items.toObject(), creditor: "COMPANY" }
                    return items.toObject()
                })

                if (transactionsFiltered)
                    return res.status(200).json({ transactionsFiltered })
                return res.status(201).json({ error: "unable to find transactions try again" })
            } else {
                const transactions = await Transaction.find({ createdAtDate: { $gte: req.body.startDate, $lte: req.body.endDate } })

                const transactionsFiltered = transactions.map((items) => {
                    if (items.creditor == req.body.userName)
                        return { ...items.toObject(), creditor: "COMPANY" }

                    return items.toObject()
                })

                if (transactionsFiltered)
                    return res.status(200).json({ transactionsFiltered })
                return res.status(201).json({ error: "unable to find transactions try again" })
            }
        }
        else {
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
        }

    } catch (err) {
        return res.status(500).json(err)
    }


}

const updatePlayerCredits = async (req, res) => {

    try {
        const player = await User.findOne({ userName: req.body.playerUserName })
        var playerUserCredits = parseInt(player.credits) + parseInt(req.body.credits)

        const transaction = await Transaction.create({
            credit: req.body.credits,
            creditor: "game",
            creditorDesignation: "game",

            debitor: "game",
        })

        const updateClientTransaction = await User.findOneAndUpdate(
            { userName: req.body.playerUserName },
            { $push: { transactions: transaction._id } },
            { new: true }
        );

        const updatedPalyerUserCredits = await User.findOneAndUpdate({ userName: req.body.playerUserName }, {
            credits: playerUserCredits
        }, { new: true })


        if (updatedPalyerUserCredits)
            return res.status(200).json({})
        return res.status(201).json({ error: "unable to update Player credits try again" })
    } catch (err) {
        return res.status(500).json(err)
    }
}







const transactions = async (req, res) => {
    console.log("hisTrans", console.log(req.body))
    try {
        const user = await User.findOne({ userName: req.body.clientUserName });
        const transactions = await user.populate('transactions')
        console.log(transactions)
        return res.status(200).json(transactions.transactions)
    } catch (err) {
        res.status(500).json(err)
    }
}

module.exports = { loginPlayer, updatePlayerCredits,   getTransanctionOnBasisOfDatePeriod,getRealTimeCredits, updateClientCredits, transactions };