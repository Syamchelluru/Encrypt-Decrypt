import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { uploadMultipleImages, validateImageFiles } from '@/lib/cloudinary'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await requireAuth(request)
    
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'No images provided'
      }, { status: 400 })
    }
    
    // Validate files
    const validation = validateImageFiles(files)
    if (!validation.valid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid files',
        error: validation.errors.join(', ')
      }, { status: 400 })
    }
    
    // Upload images to Cloudinary
    const uploadResults = await uploadMultipleImages(files, {
      folder: `fix-my-area/issues/${user.id}`,
      quality: 'auto:good',
      maxFiles: 5
    })
    
    // Return upload results
    return NextResponse.json<ApiResponse>({
      success: true,
      message: `${uploadResults.length} image(s) uploaded successfully`,
      data: {
        images: uploadResults.map(result => ({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes
        }))
      }
    })
    
  } catch (error: any) {
    console.error('Upload error:', error)
    
    if (error.message === 'Authentication required') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Authentication required'
      }, { status: 401 })
    }
    
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to upload images',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

