import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getAppointmentById } from "../repositories/appointment.Repository.js";
import { getAudioFilesByAppointmentId, getTranscriptByAudioFileId } from "../repositories/audioFile.Repository.js";
import s3 from "../db/aws.js";

export const generateTranscriptController = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    console.log("request arrived with appointment id as : ", appointmentId)

    if (!appointmentId) {
        throw new ApiError(400, "appointmentId is required");
    }

    const appointment = await getAppointmentById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    if (appointment.doctor_id !== req.doctor.id) {
        throw new ApiError(403, "You are not authorized to generate transcript for this appointment");
    }

    const audioFiles = await getAudioFilesByAppointmentId(appointmentId);
    if (!audioFiles || audioFiles.length === 0) {
        throw new ApiError(404, "Audio files not found for this appointment");
    }

    const generateTranscript = await AiAudioFilesHandler(audioFiles);
    if (!generateTranscript) {
        console.log(generateTranscript)
        throw new ApiError(500, "Failed to generate transcript in generateTranscriptController ");
    }

    return res.status(200).json(new ApiResponse(200, generateTranscript, "Transcript generated successfully"));

});

const AiAudioFilesHandler = async (audioFiles) => {
    /* 

    iterate all the files and check if url exists or not. 
    fatch all the audio files from each url. 
    if any file don't contain file on s3 create different array and then right now do console.log()
    Loop through each file. 
        1. generate Ai Transcript for file
        2. store Trascipt
    send the success response. 

    */

    // iterate audio files
    console.log(audioFiles.length)
    for (const audioFile of audioFiles) {
        console.log("Audio file : ", audioFile)
        console.log("---------------------------------------------------------")

        // check if audio file already has transcript in the audio_extractions table 
        const existingTranscript = await getTranscriptByAudioFileId(audioFile.id);
        if (existingTranscript) {
            console.log(`Audio file ${audioFile.file_url} already has transcript`);
            continue;
        }


        // download file from s3. 
        const key = audioFile.file_url;
        console.log("key: ", key)
        console.log("---------------------------------------------------------")

        let file
        try {
            const fileContent = await fetchFileFromS3(key)
            // showing first 100 char of fileContent
            console.log("file content fatched from s3 ")

            // convert file to normal form
            file = await convertS3StreamToBase64(fileContent);
            // showing first 100 char of file
            console.log("file converted to normal form : ", file.slice(0, 100))
            console.log("---------------------------------------------------------")

        } catch (error) {
            console.error("Error while fatching audio file", [error.message], error.stack)
            continue;
        }

        // generate ai transcipt
        let transcipt
        try {
            transcipt = await generateAiTranscript(file);
            console.log("Transcript generated successfully");
            console.log("Transcript : ", transcipt);
            console.log("---------------------------------------------------------")
        } catch (error) {
            console.error("Error while generating ai transcipt");
            throw new ApiError(500, "Failed to generate transcript");
        }


        // store transcript 
        try {
            const result = await storeTranscript(transcipt, audioFile)
        } catch (error) {
            console.error("Error while storing the Transcript--->", error.message)
        }
    }

    return true;
}

const fetchFileFromS3 = async (s3key) => {
    // logic to fetch file from s3 using s3key
    try {

        // command
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3key
        })



        // send command to s3
        const response = await s3.send(command);

        return response.Body;

    } catch (error) {
        throw new ApiError(500, "Failed to fetch audio file from S3", [error.message], error.stack);
    }
}

const convertS3StreamToBase64 = async (fileContent) => {
    try {

        if (!fileContent) {
            throw new ApiError(500, "S3 file response body is empty");
        }

        // convert file to buffer
        const audioFileBuffer = Buffer.from(
            await fileContent.transformToByteArray()
        );

        // convert buffer to base64
        const base64AudioFile = audioFileBuffer.toString("base64");

        return base64AudioFile;

    } catch (error) {
        throw new ApiError(500, "Failed to convert audio file to text", [error.message], error.stack);
    }
}

import { GoogleGenAI } from "@google/genai";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { TRANSCRIPTION_PROMPT } from "./prompts/TranscriptPrompt.js";
import { sql } from "../db/db.js";


const generateAiTranscript = async (audioFile) => {
    /* call geminin api key
       generate transcript
       validate text content */

    try {

        // using gemini api
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: "audio/webm",
                                data: audioFile,
                            },
                        },
                        {
                            text: TRANSCRIPTION_PROMPT,
                        },
                    ],
                }
            ]
        })

        console.log("------------------------------------------------------")
        console.log(response.usageMetadata);
        console.log("------------------------------------------------------")

        return response.text

    } catch (error) {
        console.error("Error while generating ai transcipt", [error.message], error.stack)
        throw new ApiError(500, "Failed to generate transcript");
    }

}

const storeTranscript = async (audioFileTranscript, audioFile) => {
    /* 
    generate key 
    1. store transcipt to s3
    2. store to db
    */

    const key = audioFile.file_url.replace(
        /\/([^/]+)\.webm$/,
        '/Transcripts/$1.txt'
    );

    console.log(key);

    // store to s3
    try {
        await storeAudioTransciptToS3(key, audioFileTranscript)

        console.log("Transcript store in s3")
    } catch (error) {
        console.error("error while storing to aws s3")
    }

    // store to db
    try {
        const result = await sql`
            INSERT INTO audio_extractions(
                file_url,
                appointment_id,
                audio_file_id
            )
            VALUES (${key}, ${audioFile.appointment_id}, ${audioFile.id})
            RETURNING *;
        `
        console.log("transcript url store in db")
        console.log("-----------------------------------------------")
    } catch (error) {
        console.error("error while storing to db", error.message)
    }


    return true
}

const storeAudioTransciptToS3 = async (key, audioTranscipt) => {

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: audioTranscipt,
        ContentType: "text/plain"
    })

    const response = await s3.send(command);

    return response;

}
