var jwt = require('jsonwebtoken');

const verifyTokenAuthLogin = (req, res, next) => {
    
    const cookie = req.body.cookie
    console.log("reaut",cookie)

    if (cookie) {        
        jwt.verify(cookie, process.env.JWT_SECRET, (err, decoded) => {
           req.body.userName = decoded.userName
            if (err) {
                console.error('Token verification failed:', err.message);
                return res.status(201).json({})
            } else {
                console.log(decoded.userName,req.body)
                if(decoded.userName==req.body.userName){
                    req.body={...req.body,designation:decoded.designation,password:decoded.password,userName:decoded.userName}
                    console.log("logined")
                    next()
                }
                else{
                    console.log("logout")
                    return res.status(201).json({})
                }
            }
        });
      
      }else{
        return next()
      }
}

module.exports = { verifyTokenAuthLogin }