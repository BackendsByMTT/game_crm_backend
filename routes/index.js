const { sendOtp, otpVerification, resetPassword } = require("../controllers/company_reset_password");
const { loginUser, getClientList, addClient, deleteClient, companyCreation, transactions, getRealTimeCredits,  updateClientCredits, updateClientPassword, updateClientActivity, updatePlayerCredits, getTransanctionOnBasisOfDatePeriod } = require("../controllers/user");
const { verifyToken } = require("../middleware/tokenAuth");
const { verifyTokenAuthLogin } = require("../middleware/tokenAuthLogin");
const router = require("express").Router();

//Company Routes
router.post('/company',companyCreation)

router.post('/sendOtp',sendOtp)
router.post('/veryfyOtp',otpVerification)
router.post('/resetPassword',resetPassword)

router.post('/login', verifyTokenAuthLogin,loginUser)
router.post('/getClientList',getClientList)
router.post('/addClient',verifyToken,addClient)
router.post('/updateClientCredits',verifyToken,updateClientCredits)
router.post('/updateClientPassword',verifyToken,updateClientPassword)
router.post('/updateClientActivity',verifyToken,updateClientActivity)
router.post('/deleteClient',verifyToken,deleteClient)
router.post('/transactions',verifyToken,transactions)
router.post('/getRealTimeCredits',getRealTimeCredits)
router.post('/updatePlayerCreditsInGame',updatePlayerCredits)
router.post('/getTransanctionOnBasisOfDatePeriod',getTransanctionOnBasisOfDatePeriod)

module.exports = router;
