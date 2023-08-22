const res = require("express/lib/response");
var jwt = require('jsonwebtoken');
const User = require("../models/userSchema");
const Transaction = require("../models/transaction");

const clientDesignation ={
    company:"master",
    master:"distributer",
    distributer:"subDistributer",
    subDistributer:"store",
    store:"user"
}

const companyCreation = async (req, res) => {
    try {
        if (await User.findOne({ userName: req.body.userName }))
            return res.status(201).json({ error: "This username not available" })
        if (await User.findOne({ email: req.body.email }))
            return res.status(201).json({ error: "This email already registered" })

        const company = await User.create({
            userName: req.body.userName,
            password: req.body.password,
            credits: Number.POSITIVE_INFINITY,
            designation:"company",
            activeStatus:true
        })
       return res.status(200).json(company)
    } catch (err) {
       return res.status(500).json({ error: err })
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const loginUser = async(req,res)=>{
    try {
        const user = await User.findOne({userName:req.body.userName},'userName password activeStatus designation credits');
        if(!user) 
           return res.status(201).json({ error: "Yor are not registered kindly contact your owner" });
        if(user.password != req.body.password)
          return res.status(201).json({error:"Wrong credentials"}) 

        if(!user.activeStatus)
          return res.status(204).json({}) 

         const token= jwt.sign({userName:req.body.userName,password:req.body.password,designation:user.designation},process.env.JWT_SECRET)       
        return res.status(200).json({userName:user.userName,nickName:user.nickName,designation:user.designation,token:token,credits:user.credits})        
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

const getRealTimeCredits = async(req, res)=>{
    try {
        const user = await User.findOne({userName:req.body.userName},'credits');
        return res.status(200).json({credits:user.credits})        
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

const getClientList = async (req,res)=>{
    try{
        const userClientList = await User.findOne({userName:req.body.userName}).populate({path:'clientList',select:'userName nickName activeStatus credits'});

        if(!userClientList)
          return res.status(201).json({error:"No Clients Found"})
        return res.status(200).json(userClientList)
        
    }catch(err){
       return res.status(500).json(err)
    }
}



const updateClientCredits = async (req,res)=>{
    console.log("update",req.body)
    try{
        const clientUser = await User.findOne({userName:req.body.clientUserName})
        var clientUserCredits = parseInt(clientUser.credits)+parseInt(req.body.credits)

        const user = await User.findOne({userName:req.body.userName})
        var userCredits = parseInt(user.credits)-parseInt(req.body.credits)        

        const transaction = await Transaction.create({            
            credit: req.body.credits,
        })
          
        const updateClientTransaction = await User.findOneAndUpdate(
                {userName:req.body.clientUserName},
                { $push: { transactions: transaction._id } },
                { new: true }
        );      

        
        const updatedClient = await User.findOneAndUpdate({userName:req.body.clientUserName},{
            credits:clientUserCredits
        },{new:true})

        const updatedUser = await User.findOneAndUpdate({userName:req.body.userName},{
            credits:userCredits
        },{new:true})
        

        if(updatedUser)
          return res.status(200).json({})
        return res.status(201).json({error:"unable to update client try again"})
    }catch(err){
       return res.status(500).json(err)
    }
}

const updateClientPassword = async (req,res)=>{
    console.log("updatePass",req.body)
    try{
        const updatedClient = await User.findOneAndUpdate({userName:req.body.clientUserName},{
            password:req.body.password
        },{new:true})       

        if(updatedClient)
          return res.status(200).json({})
        return res.status(201).json({error:"unable to update client try again"})
    }catch(err){
       return res.status(500).json(err)
    }
}

const updateClientActivity = async (req,res)=>{
    console.log("updatePass",req.body)
    try{
        const updatedClient = await User.findOneAndUpdate({userName:req.body.clientUserName},{
            activeStatus:!req.body.activeStatus
        },{new:true})       

        if(updatedClient)
          return res.status(200).json({})
        return res.status(201).json({error:"unable to update client activity try again"})
    }catch(err){
       return res.status(500).json(err)
    }
}

const deleteClient = async (req,res)=>{
    console.log("delete",req.body)
    try{
        const deletedClient = await User.findOneAndDelete({userName:req.body.clientUserName})
        if(deletedClient)
          return res.status(200).json({})
        return res.status(201).json({error:"Unable to delete client try again"})
    }catch(err){
       return res.status(500).json(err)
    }
}


////////////////////////////////////////////////////////////////////////////

async function addClientToUserList(userId, clientId) {
    console.log("add user client to list")
    try {       
        const updatedUserClients = await User.findOneAndUpdate(
            {userName:userId},
            { $push: { clientList: clientId } },
            { new: true }
        );
        if (!updatedUserClients) {
            res.status(201).json({ error: "failed to add" });
        }
        return updatedUserClients

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const addClient = async (req, res) => {
    console.log("addClient",req.body)
    try {
        if (await User.findOne({userName:req.body.clientUserName}))
            return res.status(201).json({ error: "This username already exist" })
      
        const newClient = await User.create({
            userName: req.body.clientUserName,
            password: req.body.password,
            nickName: req.body.clientNickName,
            designation:clientDesignation[req.body.designation]
        })

        if (newClient) {
            await addClientToUserList(req.body.userName, newClient._id)
            return res.status(200).json({})
        }
        else
            return res.status(201).json({})
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

const transactions = async (req, res) => {
    console.log("hisTrans",console.log(req.body))
    try {
        const user = await User.findOne({ userName: req.body.clientUserName });
        const transactions = await user.populate('transactions')
        console.log(transactions)
        return res.status(200).json(transactions.transactions)
    } catch (err) {
        res.status(500).json(err)
    }
}
 
module.exports = {companyCreation,loginUser,updateClientActivity,updateClientPassword, getClientList,getRealTimeCredits, addClient, updateClientCredits, deleteClient, transactions};