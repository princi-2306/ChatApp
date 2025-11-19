import { v2 as cloudinary } from 'cloudinary';

const UploadOnCloudinary = async (files, resourceType = "image") => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        if (!Array.isArray(files) || files.length === 0) {
            throw new Error("No valid files provided for upload");
        }

        const uploadedFiles = await Promise.all(
            files.map((file) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { 
                            resource_type: resourceType, // "image", "video", or "raw" for documents
                            folder: resourceType === "image" ? "chat_images" : "chat_files"
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(Buffer.from(file));
                });
            })
        );
        
        return uploadedFiles;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return null;
    }
};

const DeleteOnCloudinary = async (publicId, resourceType = "image") => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        if (!publicId) return null;
        const response = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return response;
    } catch (error) {
        console.log("Error While Deleting the file on Cloudinary,", error);
        return null;
    }
}

export {
    UploadOnCloudinary,
    DeleteOnCloudinary
};
