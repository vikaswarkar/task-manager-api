const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async function(request, response, next){
    try {
        const token = request.header('Authorization').replace('Bearer ','')
        const decoded = jwt.decode(token, process.env.JWT_SECRET_KEY)
        const user = await User.findOne({_id: decoded._id, 'tokens.token' : token})        
        // console.log('User from Auth ' + user)
        if (!user){
            throw new Error()
        }
         request.token = token
        request.user = user
        next()
    } catch (error) {
        response.status(401).send('Not Authenticated.')    
    }    
}

module.exports = auth