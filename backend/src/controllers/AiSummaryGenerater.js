import { asyncHandler } from "../utils/asyncHandler.js";

export const getAppointmentSummaryController = asyncHandler(async (req, res) => {
    /* 
    
    Here we get the data from the s3. generate the final summary from the discussion. store that summary data into db/s3. 
    1. get the all audioFile's Transcripts from the s3
    2. get all the reports extracted content. 
    3. call gemini model and pass this data and generate summay system prompt 
    4. store this summary in db+s3. 
    5. send this summary data back to frontend. 
    
    */


    const appointmentId = req.params;
})