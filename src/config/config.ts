import path from 'path'
import fs from "fs";

// Find the root directory of the project
function findRoot(dir: string): string {
  if (fs.existsSync(path.join(dir, "package.json")) || fs.existsSync(path.join(dir, ".git"))) {
    return dir;
  }
  const parent = path.dirname(dir);
  return parent !== dir ? findRoot(parent) : dir;
}

// Load environment variables
import dotenv from 'dotenv'
dotenv.config({
  path: path.join(findRoot(process.cwd()), '.env')
})

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
  cookiePath: string
  databasePath: string
  promptTemplatePath: string
  usersPath: string
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
  
  // Paths
  cookiePath: path.join(findRoot(process.cwd()), 'cookies.json'),
  databasePath: path.join(findRoot(process.cwd()), 'memory'),
  promptTemplatePath: path.join(findRoot(process.cwd()), 'data/prompt_template.txt'),
  usersPath: path.join(findRoot(process.cwd()), 'data/twitter_users.txt'),
}

export default config
