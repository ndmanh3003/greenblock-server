import { Application } from 'express'
import { v2 as cloudinaryV2 } from 'cloudinary'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

cloudinaryV2.config({
  url: process.env.CLOUDINARY_URL
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryV2,
  params: {
    folder: process.env.CLOUDINARY_FOLDER,
    allowed_formats: ['jpg', 'png', 'jpeg'],
    resource_type: 'auto',
    transformation: [{ quality: 50 }]
  } as unknown
})

const parser = multer({ storage })

export default function cloudinary(app: Application) {
  app.post(
    '/upload',
    (req, res, next) => {
      const key = req.headers['greenblock_api_key']

      if (key !== process.env.GREENBLOCK_API_KEY) {
        return res.status(403).json({ error: 'Unauthorized access' })
      }

      next()
    },
    parser.single('image'),
    (req, res) => {
      res.json({ path: req.file.path })
    }
  )
}
