import 'module-alias/register'
import 'express-async-errors'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import router from '@/routing/router'
import db from '@/plugins/database'
import { errorHandler } from '@/middlewares/errorHandler'
import cloudinary from '@/plugins/cloudinary'

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(morgan('dev'))
app.use(express.static('public'))
dotenv.config()
db()
router(app)
app.use(errorHandler)
cloudinary(app)

const port = parseInt(process.env.PORT || '4000', 10)
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
