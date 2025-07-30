import { v2 as cloudinary } from 'cloudinary';


const UploadOnCloudinary = async (files) => {
    
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        if (!Array.isArray(files) || files.length === 0) {
            throw new Error("No valid files provided for upload");
        }

        // Convert ArrayBuffer to Buffer (Fixing the issue)
        const uploadedImages = await Promise.all(
            files.map((file) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { resource_type: "image" },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(Buffer.from(file)); // Convert ArrayBuffer to Buffer
                });
            })
        );
        
        return uploadedImages; // Return an array of uploaded image data
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return null;
    }
};



const DeleteOnCloudinary = async (publicId) => {
    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        if (!publicId) return null
        // delete the file on cloudinary
        const response = await cloudinary.uploader.destroy(publicId)
        return response;
    } catch (error) {
        console.log("Error While Deleting the file on Cloudinary,", error)
        return null;
    }
}

export {
    UploadOnCloudinary,
    DeleteOnCloudinary
};