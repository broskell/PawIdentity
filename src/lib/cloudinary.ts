import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
}

/**
 * Uploads a base64 encoded string or file buffer to Cloudinary
 * @param fileStr - Base64 data string (e.g. data:image/png;base64,...)
 * @param folder - Destination folder on Cloudinary
 * @returns Cloudinary upload response containing URL and public ID
 */
export async function uploadToCloudinary(
  fileStr: string,
  folder: string = 'pawpass'
): Promise<CloudinaryUploadResponse> {
  try {
    const result = await cloudinary.uploader.upload(fileStr, {
      folder: folder,
      resource_type: 'auto', // Auto-detect image vs raw files (PDFs)
    });
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type || 'image',
    };
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
}

export default cloudinary;
