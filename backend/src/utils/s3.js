
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../db/aws.js";

const generatePresignedUploadUrl = async (fileLocation, fileType) => {
    try {
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileLocation,
            ContentType: fileType,
        });

        return await getSignedUrl(s3, command, { expiresIn: 600 });
    } catch (error) {
        console.error("Error generating presigned upload URL:", error);
        throw new Error("Could not generate presigned upload URL");
    }
};

const generatePresignedDownloadUrl = async (fileLocation) => {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileLocation,
        });

        return await getSignedUrl(s3, command, { expiresIn: 600 });
    } catch (error) {
        console.error("Error generating presigned download URL:", error);
        throw new Error("Could not generate presigned download URL");
    }
};

export { generatePresignedUploadUrl, generatePresignedDownloadUrl };