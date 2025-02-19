export interface Config {
  openai: {
    apiKey: string
    model: string
  }
  twitter: {
    username: string
    password: string
    email: string
    twoFactorSecret: string
  }
  email: {
    smtp: {
      host: string
      port: number
      auth: {
        user: string
        pass: string
      }
    }
    from: string
    to: string
  }
  updateFrequency: number
}

const config: Config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
  },
  twitter: {
    username: process.env.TWITTER_USERNAME || '',
    password: process.env.TWITTER_PASSWORD || '',
    email: process.env.TWITTER_EMAIL || '',
    twoFactorSecret: process.env.TWITTER_2FA_SECRET || '',
  },
  email: {
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '0', 10),
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
      },
    },
    from: process.env.EMAIL_FROM || '',
    to: process.env.EMAIL_TO || '',
  },
  updateFrequency: parseInt(process.env.UPDATE_FREQUENCY || '24', 10), // in hours
}

export default config
