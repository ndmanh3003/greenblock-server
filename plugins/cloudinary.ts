import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

cloudinary.config({
  url: process.env.CLOUDINARY_URL
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'greenblock',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    resource_type: 'auto',
    transformation: [{ quality: 50 }]
  } as unknown
})

const parser = multer({ storage })

export default parser
