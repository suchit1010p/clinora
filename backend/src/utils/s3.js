
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
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

const deleteFileFromS3 = async (fileLocation) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileLocation,
        });

        await s3.send(command);
    } catch (error) {
        console.error("Error deleting file from S3:", error);
        throw new Error("Could not delete file from S3");
    }
};

export { generatePresignedUploadUrl, generatePresignedDownloadUrl, deleteFileFromS3 };