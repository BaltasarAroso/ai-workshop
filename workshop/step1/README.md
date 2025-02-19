# Step 1

## Objective

In this step, you will initialize the TwitterDigestAgent by implementing its constructor.

## Instructions

1. Create a `.env` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   TWITTER_USERNAME=your_twitter_username
   TWITTER_PASSWORD=your_twitter_password
   TWITTER_EMAIL=your_twitter_email
   TWITTER_2FA_CODE=your_2fa_code
   EMAIL_FROM=your_email@gmail.com
   EMAIL_TO=recipient@email.com
   ```

2. In the constructor of `step1.ts`, initialize the following properties:
   - `this.openai`: Create a new OpenAI instance using the config
   - `this.twitter`: Create a new Scraper instance
   
   The `emailTransporter` and `db` properties are already initialized for you.

## Example Implementation

```typescript
constructor() {
  this.openai = new OpenAI({
    apiKey: config.openai.apiKey
  })
  this.twitter = new Scraper()
  this.emailTransporter = nodemailer.createTransport(config.email.smtp)
  this.db = new Database('database')
}
```

## Environment Variables

| Variable                | Description                                          |
|-------------------------|------------------------------------------------------|
| `OPENAI_API_KEY`        | Your OpenAI API key from https://platform.openai.com |
| `SMTP_HOST`             | SMTP server hostname (e.g., smtp.gmail.com)          |
| `SMTP_PORT`             | SMTP server port (e.g., 587 for TLS)                 |
| `SMTP_USER`             | Your SMTP username/email                             |
| `SMTP_PASS`             | Your SMTP password or app-specific password          |
| `TWITTER_USERNAME`      | Your Twitter/X username                              |
| `TWITTER_PASSWORD`      | Your Twitter/X password                              |
| `TWITTER_EMAIL`         | Email associated with your Twitter account           |
| `TWITTER_2FA_CODE`      | Your Twitter 2FA code (if enabled)                   |
| `EMAIL_FROM`            | Email address to send the digests                    |
| `EMAIL_TO`              | Email address to receive the digests                 |

## Tips

- The OpenAI constructor requires an API key which is already available in `config.openai.apiKey`
- The Scraper class from 'agent-twitter-client' doesn't require any parameters
- Make sure you've imported all necessary dependencies at the top of the file
- For Gmail, you'll need to use an App Password if 2FA is enabled
- Twitter login process (including cookie handling) is implemented in the next step due to its complexity

## Next Steps

Once you've implemented the constructor and set up your environment variables, you can proceed to the next step. The file loading methods (`loadUsers` and `loadPromptTemplate`) are already implemented for you.
