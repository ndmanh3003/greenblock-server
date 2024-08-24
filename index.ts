import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { db } from './plugins/db'

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(morgan('dev'))
dotenv.config()
db()

import { router } from './router'
router(app)

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on port ${process.env.PORT || 8080}`)
})
