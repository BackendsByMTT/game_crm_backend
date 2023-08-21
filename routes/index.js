const { sendOtp, otpVerification, resetPassword } = require("../controllers/company_reset_password");
const { loginUser, getClientList, addClient, updateClientDetails, deleteClient, companyCreation, transactions, getRealTimeCredits } = require("../controllers/user");
const { verifyToken } = require("../middleware/tokenAuth");
const router = require("express").Router();

//Company Routes
router.post('/company',companyCreation)

router.post('/sendOtp',sendOtp)
router.post('/veryfyOtp',otpVerification)
router.post('/resetPassword',resetPassword)

router.post('/login', loginUser)
router.post('/getClientList',getClientList)
router.post('/addClient',verifyToken,addClient)
router.post('/updateClientDetails',verifyToken,updateClientDetails)
router.post('/deleteClient',verifyToken,deleteClient)
router.post('/transactions',verifyToken,transactions)
router.post('/getRealTimeCredits',getRealTimeCredits)
module.exports = router;
