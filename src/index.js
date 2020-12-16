const express = require('express')
require('./db/mongoose')
const bcrypt = require('bcryptjs')
const taskRouter = require('./routers/ task')
const userRouter = require('./routers/user')

const PORT = process.env.PORT

const app = express()
app.use(express.json())

app.use(userRouter)
app.use(taskRouter)

app.listen(PORT, ()=>{
    console.log('Server started on Port '   + PORT )
})
