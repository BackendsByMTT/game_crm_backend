const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    nickName: {
        type: String,
    },
    activeStatus: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true,
    },
    designation: {
        type: String,
        required: true,
    },
    clientList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
    ],
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
    }
    ],
    lastLogin: {
        type: String,
    },
    totalRecharged: {
        type: Number,
        default: 0
    },
    totalRedeemed: {
        type: Number,
        default: 0
    },
    credits: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true
    });

const User = mongoose.model('User', userSchema);

module.exports = User;
