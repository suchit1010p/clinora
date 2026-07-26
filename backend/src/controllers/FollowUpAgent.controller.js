/*
// Appointment completed

1. Generate AI Summary from transcript + reports.

// Create follow-up schedule

2. Create follow-up entries in the followup_jobs table
   (Day 2, Day 5, Day 10, ... according to your logic).

// Scheduler runs

3. Google Cloud Scheduler wakes up.

4. Fetch all pending follow-up jobs whose scheduled_time <= NOW().

// Prepare AI input

5. For each follow-up job, create an object containing:
   - Patient Details
   - AI Generated Summary
   - Previous Follow-up Summaries
   - Current Attempt Number

// Start follow-up session

6. Create a followup_session:
   - patient_id
   - appointment_id
   - attempt
   - status = active
   - started_at

// Generate first message

7. Pass each object to the AI.

8. AI generates the first personalized message for every patient.

// Save conversation

9. Create conversation JSON with the first assistant message.

10. Upload conversation JSON to S3.

11. Save the S3 file_url in the followup_session table.

// Send message

12. Send the generated message to the patient's Telegram chat.

// Patient replies

13. Telegram webhook receives:
    - chat_id
    - message

14. Find patient using telegram_chat_id.

15. Find the active followup_session using patient_id.

16. Load:
    - Conversation JSON from S3
    - AI Generated Summary
    - Patient Details
    - Previous Follow-up Summaries

17. Append patient's message to the conversation JSON.

// Continue conversation

18. Send all context to the AI.

19. AI understands the reply and returns:
    - Next message
    - Conversation status (continue / completed)
    - Conversation result (if completed)

20. Append AI reply to the conversation JSON.

21. Upload the updated JSON back to S3.

22. Send AI reply to Telegram.

// Conversation completed

23. If AI marks conversation as completed:
    - Update followup_session:
        status = completed
        ended_at = NOW()
        result = (improvement | no_improvement | serious | consult_doctor | new_problem | side_effect)

    - Mark the corresponding follow-up job as completed.

    - Generate and store a structured follow-up summary for use in the next follow-up attempt.


 

patients
---------
id
...
telegram_chat_id (UNIQUE)

        │
        ▼

followup_sessions
-----------------
id
appointment_id
patient_id
attempt
status
file_url
started_at
ended_at

*/