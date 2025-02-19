# Twitter Digest AI

An AI-powered Twitter digest system that monitors selected Twitter accounts, summarizes their content using OpenAI's GPT, and delivers periodic email summaries.

## Features

- 🐦 Monitors tweets from a configurable list of Twitter users
- 🤖 Uses OpenAI's GPT to generate intelligent summaries
- 📧 Sends periodic email digests (hourly/daily/weekly)
- 🎯 Customizable prompt templates for AI summarization
- 💾 Maintains memory of previous summaries

## Prerequisites

- Node.js (v20 or higher)
- OpenAI API key
- Twitter API credentials
- SMTP email server access

## Installation

1. Clone the repository:

```bash
git clone git@github.com:BaltasarAroso/ai-workshop.git
cd ai-workshop
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file with your credentials and settings. See `.env.example` for all required variables.

## Configuration

### Twitter Users
Edit `data/twitter_users.txt` to specify the Twitter handles you want to monitor (one per line).

### Prompt Template
Customize the AI summarization by editing `data/prompt_template.txt`.

### Environment Variables
Configure the following in your `.env` file:
- OpenAI API credentials
- Twitter API credentials
- SMTP email settings
- Update frequency (hourly/daily/weekly)

Example:
```# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Twitter Configuration
TWITTER_USERNAME=your_twitter_username
TWITTER_PASSWORD=your_twitter_password
TWITTER_EMAIL=your_twitter_email
TWITTER_2FA_SECRET=your_twitter_2fa_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
EMAIL_FROM=your_email@gmail.com
EMAIL_TO=recipient@email.com

# Update Frequency (in hours)
# Example:
# 15 minutes = 0.25
# 1 hour = 1
# 1 day = 24
# 1 week = 168
# 1 month = 720
UPDATE_FREQUENCY=24```

## Usage

Start the application:

```bash
npm start
```

The system will:
1. Load the configured Twitter users
2. Fetch their recent tweets
3. Generate AI summaries
4. Send email digests according to the configured schedule

## Project Structure

```
├── src/
│   ├── agents/
│   │   └── TwitterDigestAgent.js    # Main agent logic
│   ├── config/
│   │   └── config.js                # Configuration management
│   └── index.js                     # Application entry point
├── data/
│   ├── twitter_users.txt            # List of Twitter users to monitor
│   └── prompt_template.txt          # AI summarization prompt template
├── database/
│   └── memory.json                  # Persistent storage
├── package.json
├── .env                             # Environment variables
└── README.md
```

## Customization

### Update Frequency
Modify the `UPDATE_FREQUENCY` in your `.env` file:
- `0.25`: Runs every 15 minutes
- `1`: Runs every hour
- `24`: Runs once per day
- `168`: Runs once per week

### Email Template
Customize the email format by modifying the `formatEmailContent` method in `utils/utils.js`.

### Memory Storage
The system maintains state in `database/memory.json`. This helps track previously processed tweets and maintain context for summaries.

## License

This project is licensed under the MIT License - see the LICENSE file for details.