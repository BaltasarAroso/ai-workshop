# Step 5

## Objective

In this step, you will implement the `TwitterDigestAgent` class to fetch tweets, summarize them using OpenAI, and send an email with the summary.

## Instructions

### 5. Run the Agent

Implement the `run` method to orchestrate the entire process:
1. Login to Twitter.
2. Load users and prompt template.
3. Fetch tweets for each user.
4. Summarize tweets using OpenAI.
5. Save summaries to the database.
6. Summarize all summaries into one.
7. Send an email with the summarized content.


## How to Run / Test

Ensure you are in the main directory.
```bash
npm run step5
```