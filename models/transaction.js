const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    credit: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},    {
        timestamps: true 
    });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
