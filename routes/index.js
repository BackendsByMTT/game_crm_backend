const { sendOtp, otpVerification, resetPassword } = require("../controllers/company_reset_password");
const { loginPlayer, updatePlayerBet, updatePlayerWin, getRealTimePlayerCredits } = require("../controllers/players");
const { loginUser, getClientList, addClient, deleteClient, companyCreation, transactions, getRealTimeCredits,  updateClientCredits, updateClientPassword, updateClientActivity, updatePlayerCredits, getTransanctionOnBasisOfDatePeriod } = require("../controllers/user");
const { verifyTokenPlayer } = require("../middleware/palyerTokenAuth");
const { verifyToken } = require("../middleware/tokenAuth");
const { verifyTokenAuthLogin } = require("../middleware/tokenAuthLogin");
const User = require("../models/userSchema");
const router = require("express").Router();


// const updateMany = async()=>{
//   const result = await User.updateMany({}, { $set: { loginTimes: 0 } });
//     console.log("upateManty",result)
// }

// updateMany()

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

//Players
router.post('/playerLogin',loginPlayer)      //verifyTokenAuthLogin
router.post('/playerBet',verifyTokenPlayer,updatePlayerBet)
router.post('/playerWin',verifyTokenPlayer,updatePlayerWin)
router.post('/getPlayerCredit',verifyTokenPlayer,getRealTimePlayerCredits)

module.exports = router;
