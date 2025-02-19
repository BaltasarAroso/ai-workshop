module.exports = {
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-4-turbo-preview"
    },
    twitter: {
        username: process.env.TWITTER_USERNAME,
        password: process.env.TWITTER_PASSWORD,
        email: process.env.TWITTER_EMAIL,
        twoFactorSecret: process.env.TWITTER_2FA_SECRET
    },
    email: {
        smtp: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        },
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO
    },
    updateFrequency: process.env.UPDATE_FREQUENCY || 24 // in hours
} 