const mongoose = require('mongoose')
const connectionURL = process.env.MONGOOSE_DB_CONNECTION_URL

mongoose.connect(connectionURL, {
    useNewUrlParser:true,
    useCreateIndex:true
})