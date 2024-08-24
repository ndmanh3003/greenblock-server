import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { db } from './plugins/db'
import { keepAlive } from './utils'

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(morgan('dev'))
dotenv.config()
db()
keepAlive()

import { router } from './router'
router(app)

const port = parseInt(process.env.PORT || '8080', 10)
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`)
})
