const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
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
