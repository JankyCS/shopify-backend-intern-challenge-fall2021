const app = require('./index')
const db = require('./db')

const apiPort = 3000

db.on('error', console.error.bind(console, 'MongoDB connection error:'))
app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))
