import { cloudinary } from '../config/cloudinary.js';

class CloudinaryService {
    async deleteImage(publicId) {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result;
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            throw error;
        }
    }

    getPublicIdFromUrl(url) {
        // Extract public_id from Cloudinary URL
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        return `${folder}/${filename.split('.')[0]}`;
    }
}

export default new CloudinaryService();
