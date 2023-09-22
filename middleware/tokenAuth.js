var jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    
    const cookie = req.body.cookie

    if (cookie) {
        jwt.verify(cookie, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('Token verification failed:', err.message);
                return res.status(201).json({ error: "You are not authenticated" })
            } else {

                if(decoded.userName==req.body.userName){
                    req.body={...req.body,designation:decoded.designation,password:decoded.password}
                    console.log("pass")
                    next()
                }
                else{
                    console.log("fail")
                    return res.status(201).json({ error: "You are not authenticated" })
                }
            }
        });
      
      }else{
        return res.status(201).json({ error: "You are not authenticatedd" })
      }
}

module.exports = { verifyToken }