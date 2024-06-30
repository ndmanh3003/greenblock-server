const router = require('./router')

const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json({ limit: '50mb' }))
const cors = require('cors')
app.use(cors())
const morgan = require('morgan')
app.use(morgan('dev'))
require('dotenv').config()

//TODO: Connect to MongoDB
const db = require('./plugins/db')
db()

//TODO: Routes
router(app)

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080')
})
