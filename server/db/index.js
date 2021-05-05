const mongoose = require('mongoose')

const mongoUrl = 'mongodb://127.0.0.1:27017/image-repo'

mongoose
    .connect(mongoUrl, { useNewUrlParser: true })
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

module.exports = db