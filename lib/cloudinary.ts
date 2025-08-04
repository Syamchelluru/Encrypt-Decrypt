import { v2 as cloudinary } from 'cloudinary'

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error('Cloudinary credentials are not set in environment variables')
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
  created_at: string
}

// Upload image to Cloudinary
export async function uploadImage(
  file: File | Buffer | string,
  options: {
    folder?: string
    public_id?: string
    transformation?: any
    quality?: string | number
    format?: string
  } = {}
): Promise<CloudinaryUploadResult> {
  try {
    const uploadOptions = {
      folder: options.folder || 'fix-my-area/issues',
      quality: options.quality || 'auto:good',
      format: options.format || 'auto',
      transformation: options.transformation || [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      ...options
    }

    let uploadData: string | Buffer

    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer()
      uploadData = Buffer.from(arrayBuffer)
    } else {
      uploadData = file
    }

    const result = await cloudinary.uploader.upload(
      uploadData instanceof Buffer ? `data:image/jpeg;base64,${uploadData.toString('base64')}` : uploadData,
      uploadOptions
    )

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at
    }
  } catch (error: any) {
    console.error('Cloudinary upload error:', error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }
}

// Upload multiple images
export async function uploadMultipleImages(
  files: File[],
  options: {
    folder?: string
    quality?: string | number
    maxFiles?: number
  } = {}
): Promise<CloudinaryUploadResult[]> {
  const maxFiles = options.maxFiles || 5
  
  if (files.length > maxFiles) {
    throw new Error(`Maximum ${maxFiles} images allowed`)
  }

  const uploadPromises = files.map((file, index) => 
    uploadImage(file, {
      ...options,
      public_id: `${Date.now()}_${index}`
    })
  )

  try {
    const results = await Promise.all(uploadPromises)
    return results
  } catch (error: any) {
    console.error('Multiple upload error:', error)
    throw new Error('Failed to upload one or more images')
  }
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error: any) {
    console.error('Cloudinary delete error:', error)
    return false
  }
}

// Delete multiple images
export async function deleteMultipleImages(publicIds: string[]): Promise<{ success: string[], failed: string[] }> {
  const results = await Promise.allSettled(
    publicIds.map(publicId => deleteImage(publicId))
  )

  const success: string[] = []
  const failed: string[] = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      success.push(publicIds[index])
    } else {
      failed.push(publicIds[index])
    }
  })

  return { success, failed }
}

// Generate optimized image URL
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: string | number
    format?: string
    crop?: string
  } = {}
): string {
  const transformation = []

  if (options.width || options.height) {
    transformation.push(`w_${options.width || 'auto'},h_${options.height || 'auto'}`)
  }

  if (options.crop) {
    transformation.push(`c_${options.crop}`)
  }

  if (options.quality) {
    transformation.push(`q_${options.quality}`)
  }

  if (options.format) {
    transformation.push(`f_${options.format}`)
  }

  const transformationString = transformation.length > 0 ? transformation.join(',') + '/' : ''

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}${publicId}`
}

// Get image metadata
export async function getImageMetadata(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId)
    return {
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      created_at: result.created_at,
      secure_url: result.secure_url
    }
  } catch (error: any) {
    console.error('Get image metadata error:', error)
    throw new Error(`Failed to get image metadata: ${error.message}`)
  }
}

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 10MB.'
    }
  }

  return { valid: true }
}

// Validate multiple image files
export function validateImageFiles(files: File[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const maxFiles = 5

  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} images allowed`)
  }

  files.forEach((file, index) => {
    const validation = validateImageFile(file)
    if (!validation.valid) {
      errors.push(`File ${index + 1}: ${validation.error}`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

export default cloudinary

