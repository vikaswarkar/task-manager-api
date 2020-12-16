const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    age : {
        type : Number,
        default : 0,
        validate(value){
            if (value < 0){
                throw new Error('Age can not be negative.')
            }
        }
    },
    email : {
        type : String,
        required : true,
        trim:true,
        unique : true,
        lowercase:true,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minlength : 8, 
        // lowercase : true,
        validate (value){
            if (value === 'password'){
                throw new Error ('Password can not be password!!')
            }
        }
    },
    tokens :[{
        token :{
            type : String
        }
    }],
    avatar:{
        type: Buffer
    }
}, {
    timestamps:true
})

userSchema.virtual('tasks', {
    ref:'Task',
    localField : '_id',
    foreignField : 'owner'
})

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()}, process.env.JWT_SECRET_KEY)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.methods.toJSON = function() {
    const user = this;
    const userPublicProfile = user.toObject();
    delete userPublicProfile.password
    delete userPublicProfile.tokens
    delete userPublicProfile.avatar
    return userPublicProfile;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email : email})
    if (!user){
        console.log('USER BOT FOUND')
        throw new Error('Unable to login!!')
    }
    console.log('Password is ' + password + ' and hash is ' + user.password)
    
    const isMatch = await bcrypt.compare(password, user.password)
    
    console.log('Password is ' + isMatch)
    
    if (!isMatch){
        throw new Error('Unable to login!!')
    }

    return user
}

userSchema.pre('save', async function(next){
    const user = this
    console.log(user.password)
    
    if (user.isModified('password')){
        console.log('Saving the passssword!!!')
        user.password = await bcrypt.hash(user.password, 8)
        console.log('Saving the passssword!!!' + user.password)
    }
    
    console.log('Just before saving!!')
    
    next()
})

// Delete User Task when User is removed.
// Video 116.
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User