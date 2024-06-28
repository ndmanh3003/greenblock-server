const router = require('./router')

const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json({ limit: '50mb' }))
const cors = require('cors')
app.use(cors())
const morgan = require('morgan')
app.use(morgan('dev'))
const dotenv = require('dotenv')
dotenv.config()

//TODO: Connect to MongoDB
const mongoose = require('mongoose')
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: Error) => console.log('Failed to connect to MongoDB', err))

//TODO: Routes
router(app)

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080')
})
