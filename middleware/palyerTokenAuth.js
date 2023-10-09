const { cookie } = require('express/lib/response');
var jwt = require('jsonwebtoken');

const verifyTokenPlayer = (req, res, next) => {
    
    const cookie = req.body.userToken;
    if (cookie) {
        jwt.verify(cookie, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('Token verification failed:', err.message);
                return res.status(201).json({ error: "You are not authenticated" })
            } else {
                if(decoded.userName==req.body.userName){
                    req.body={...req.body,designation:decoded.designation}
                    next()
                }
                else{
                    return res.status(201).json({ error: "You are not authenticatedty" })
                }
            }
        });
      
      }else{
        return res.status(201).json({ error: "You are not authenticatedd" })
      }
}

module.exports = { verifyTokenPlayer }