import express from 'express'
const app = express()

import bodyParser from 'body-parser'
app.use(bodyParser.json({ limit: '50mb' }))
import cors from 'cors'
app.use(cors())
import morgan from 'morgan'
app.use(morgan('dev'))

import dotenv from 'dotenv'
dotenv.config()

//TODO: Connect to MongoDB
import { db } from './plugins/db'
db()

//TODO: Routes
import router from './router'
router(app)

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080')
})
