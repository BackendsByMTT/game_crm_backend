const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    creditor: {
        type: String
    },
    creditorDesignation:{
        type: String
    },
    debitor: {
        type: String
    },
    credit: {
        type: String
    },
    debitorDesignation:{
        type: String
    },
    createdAtDate: {
        type: String,
        default: () => {
            const istOffset = 5.5 * 60 * 60 * 1000; // Indian Standard Time offset in milliseconds (5 hours and 30 minutes)
            const istDate = new Date(Date.now() + istOffset);
            return istDate.toISOString().split('T')[0];
        },
    },
    createdAtTime: {
        type: String,
        default: () => {
            const istOffset = 5.5 * 60 * 60 * 1000; // Indian Standard Time offset in milliseconds (5 hours and 30 minutes)
            const istDate = new Date(Date.now() + istOffset);
            return istDate.toISOString().split('T')[1];
        },
    }

}, {
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
