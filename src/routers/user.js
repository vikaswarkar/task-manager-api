const User = require('../models/user')
const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/account')

// Sign Up - Create a user
router.post('/users', async (req, resp) => {
    const user = new User(req.body);
    try {
        await user.save()
        console.log('Sending email!!!')
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        resp.status(201).send({user, token})
    } catch (error) {
        console.log(error);
        resp.status(400).send(error);
    }
})

// Login a User
router.post('/users/login', async (request, response) => {
    try {
        const user = await User.findByCredentials(request.body.email, request.body.password)
        const token = await user.generateAuthToken()
        response.send({user, token})
    } catch (e) {
        return response.status(400).send(e)
    }
})

// Log out
router.post('/users/logout', auth, async (request, response)=>{
    try {
        request.user.tokens = request.user.tokens.filter(token => {
            return request.user.tokens !== token.token
        })
        await request.user.save()
        response.send('Successfully logged out.')
    } catch (error) {
        response.status(500).send('There was error logging you out!!')
    }
})

// Logout All
router.post('/users/logoutAll', auth, async (request, response) =>{
    try {
        request.user.tokens = [];
        await request.user.save();
        response.status(200).send('Successfully logged you out of all the sessions!!')
    } catch (error) {
        response.status(500).send('There was an error logging you out.')
    }
})

// Get user Profile
router.get('/users/me', auth, async (req, resp)=>{
    try {
        resp.send(req.user.getPublicProfile())
    } catch (error) {
        resp.status(500).send()
    }    
})

// Get user by Id -- Dont really need it.
router.get('/users/:id', (req, resp)=>{
    User.findById(req.params.id).then(result=>{
        console.log('Result ' + result)
        if (!result)
            return resp.status(404).send('User not found!!')

        resp.send(result)
    }).catch(error => {
        console.log('Error ' + error)
        resp.status(500).send()
    })
})

// Update user by Id.
router.patch('/users/me', auth, async (req, resp)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'password','email']
    const isValidOperation = updates.every(update=>allowedUpdates.includes(update))
    if (!isValidOperation){
        return resp.status(400).send({error : 'Invalid Updates'})
    }
    try {
        // const user = await User.findByIdAndUpdate(req.params.id, req.body,{ new:true,runValidators:true })
        // const user  = await User.findById(req.user._id)
        updates.forEach(update=>{
            req.user[update] = req.body[update]
        })

        await req.user.save()

        
        return resp.status(404).send(req.user)
            
        resp.send(req.user)

    } catch (error) {
        resp.status(501).send(error)
    }
})
 
// Delete user Profile.
router.delete('/users/me', auth, async (request, response)=>{
    try {
        // console.log('from Delete ' + request.user._id)
        // const user = await User.findByIdAndDelete(request.user._id)

        // if (!user){
        //     return response.status(400).send('User not found')
        // }
        const user = await request.user.remove()
        sendCancellationEmail(user.email, user.name)
        response.status(200).send(user)
    } catch (error) {
        response.status(500).send(error + 'Error deleting the User.')
    }
})

const multerOptions = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1000000,        
    },
    fileFilter(req, file, cb){
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload a valid word doc.'))            
        }
        return cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, multerOptions.single('avatar'), async (req, resp)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()    
    req.user.avatar =  buffer;
    await req.user.save();
    resp.send()
}, (error, req, resp, next)=>{
  resp.status(400).send('error: ' + error.message)  
})

router.delete('/users/me/avatar', auth, async (req, resp)=>{
    req.user.avatar = undefined
    await req.user.save();
    resp.send(200).status('Avatar saved.')
})

router.get('/users/me/avatar/:id',  async (req, resp)=>{
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar){
            resp.status(404).send('User or Avatar not found.')
        }
        resp.set('Content-Type','image/png')
        resp.send(user.avatar)
    } catch (error) {
        resp.status(404).send(error + ' Avatar not found')
    }
})
// app.get('/users/:name', (req, resp)=>{
//     User.findOne(req.body).then(result=>{
//         resp.send(result)
//     }).catch(error => {
//         resp.status(500).send()
//     })
// })


module.exports = router