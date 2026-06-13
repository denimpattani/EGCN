import { v2 as cloudinary } from 'cloudinary';

// Check if credentials are present
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('⚠️  Cloudinary environment variables are missing! Media uploads will fail.');
}

cloudinary.config({
  cloud_name: cloudName || 'placeholder_cloud',
  api_key: apiKey || 'placeholder_key',
  api_secret: apiSecret || 'placeholder_secret',
});

export default cloudinary;
