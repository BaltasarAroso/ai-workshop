# Step 5

## Objective

In this step, you will implement the `TwitterDigestAgent` class to fetch tweets, summarize them using OpenAI, and send an email with the summary.

## Instructions

### 5. Run the Agent

1. Implement the `run` method to orchestrate the entire process:
   - Login to Twitter.
   - Load users and prompt template.
   - Fetch tweets for each user.
   - Summarize tweets using OpenAI.
   - Save summaries to the database.
   - Summarize all summaries into one.
   - Send an email with the summarized content.
