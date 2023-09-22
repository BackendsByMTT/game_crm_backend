var jwt = require('jsonwebtoken');

const verifyTokenPlayer = (req, res, next) => {
    
    console.log("playerTokenen",req.body)
    next()
    // if (cookie) {
    //     jwt.verify(cookie, process.env.JWT_SECRET, (err, decoded) => {
    //         if (err) {
    //             console.error('Token verification failed:', err.message);
    //             return res.status(201).json({ error: "You are not authenticated" })
    //         } else {
    //             console.log("ty",decoded.userName,req.body.userName)

    //             if(decoded.userName==req.body.userName){
    //                 req.body={...req.body,designation:decoded.designation}
    //                 console.log("pass")
    //                 next()
    //             }
    //             else{
    //                 console.log("fail")
    //                 return res.status(201).json({ error: "You are not authenticatedty" })
    //             }
    //         }
    //     });
      
    //   }else{
    //     return res.status(201).json({ error: "You are not authenticatedd" })
    //   }
}

module.exports = { verifyTokenPlayer }