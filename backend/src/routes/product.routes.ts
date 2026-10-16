import { deleteProduct } from "@/controller/product/deleteProduct";
import { getFeaturedProducts } from "@/controller/product/getFeaturedProducts";
import { getProductById } from "@/controller/product/getProductById";
import { getProducts } from "@/controller/product/getProducts";
import { toggleProduct } from "@/controller/product/toggleProduct";
import { updateProduct } from "@/controller/product/updateProduct";
import { apiValidator } from "@/middlewares/apiValidator";
import { authenticate } from "@/middlewares/authenticate";
import { authorize } from "@/middlewares/authorize";
import { uploadRateLimiter } from "@/middlewares/rateLimiter";
import productController from "@/modules/product/product.controller";
import { validator } from "@/validators";
import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { v7 as uuidv7 } from 'uuid'



const productRoutes = Router()

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'))
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv7()}${ext}`)
  }
})

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Only JPEG, PNG, WEBP and JPG images are alLowed"))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE_MB) * 1024 * 1024
  }
})

productRoutes.get('/', getProducts)

productRoutes.get('/featured', getFeaturedProducts)

productRoutes.get('/:id', getProductById)

productRoutes.put('/:id',
  authenticate,
  authorize("ADMIN"),
  uploadRateLimiter,
  upload.single("image"),
  apiValidator(validator.updateProductSchema),
  updateProduct
)

productRoutes.patch('/:id',
  authenticate,
  authorize("ADMIN"),
  toggleProduct
)

productRoutes.delete('/:id',
  authenticate,
  authorize("ADMIN"),
  deleteProduct
)

export default productRoutes
