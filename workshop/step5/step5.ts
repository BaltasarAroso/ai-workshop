import { Scraper, Tweet } from 'agent-twitter-client'
import OpenAI from 'openai'
import fs from 'fs'
import nodemailer from 'nodemailer'
import Database from '../database/Database'
import config from '../../src/config/config.ts'
import { formatEmailContent } from '../../src/utils/utils.js'

class TwitterDigestAgent {
  private openai: OpenAI
  private twitter: Scraper
  private emailTransporter: nodemailer.Transporter
  private db: Database
  private isLoggedIn: boolean

  constructor() {
    this.openai = new OpenAI({ apiKey: config.openai.apiKey })
    this.twitter = new Scraper()
    this.emailTransporter = nodemailer.createTransport(config.email.smtp)
    this.db = new Database('database')
    this.isLoggedIn = false
  }

  /* --------------------------- Twitter Client Authentication -------------------------- */
  private async loadCookiesFromFile(): Promise<string[]> {
    const cookies = fs.readFileSync('cookies.json', 'utf8')
    const cookiesArray = JSON.parse(cookies)
    const cookieStrings = cookiesArray.map(
      (cookie: any) =>
        `${cookie.key}=${cookie.value}; Domain=${cookie.domain}; Path=${
          cookie.path
        }; ${cookie.secure ? 'Secure' : ''}; ${
          cookie.httpOnly ? 'HttpOnly' : ''
        }; SameSite=${cookie.sameSite || 'Lax'}`
    )
    return cookieStrings
  }

  private async saveCookies(): Promise<void> {
    const cookies = await this.twitter.getCookies()
    fs.writeFileSync('cookies.json', JSON.stringify(cookies))
  }

  public async login(): Promise<void> {
    // Check if can avoid login by loading cookies from file
    try {
      const cookies = await this.loadCookiesFromFile()
      await this.twitter.setCookies(cookies)
      console.log('✅ Successfully loaded cookies')
      return
    } catch (error) {
      console.log(error)
      console.log('❌ Cookies not available. Logging in...')
    }

    // Login
    try {
      await this.twitter.login(
        config.twitter.username,
        config.twitter.password,
        config.twitter.email,
        config.twitter.twoFactorSecret
      )
      console.log('🔑 Successfully logged in to Twitter')
    } catch (error) {
      console.error('Failed to login to Twitter:', error)
      throw error
    }

    if (await this.twitter.isLoggedIn()) {
      console.log('✅ Successfully authenticated with Twitter')
      await this.saveCookies()
    } else {
      throw new Error('Authentication failed')
    }
  }

  public async logout(): Promise<void> {
    console.log('\n🛑 Received termination signal. Cleaning up...')
    try {
      await this.twitter.logout()
      console.log('👋 Twitter session closed')
    } catch (error) {
      console.error(`❌ Error during cleanup: ${error.message}`)
    }
  }

  /* --------------------- 1. User Input - Load from file --------------------- */
  private loadUsers(): string[] {
    //  Add code here
  }

  private loadPromptTemplate(): string {
    //  Add code here
  }

  /* ------------------- 2. Tools - Twitter Client Fetching ------------------- */
  private async fetchTweets(
    username: string,
    maxTweets: number = 100
  ): Promise<Tweet[]> {
    try {
      // add code here
    } catch (error) {
      console.error(`Error fetching tweets for ${username}:`, error)
      throw error
    }
  }

  /* ------------------------- 3. Reasoning - AI Agent ------------------------ */
  private async summarizeWithAI(
    tweets: Tweet[],
    promptTemplate: string
  ): Promise<string> {
    const prompt = promptTemplate.replace('{tweets}', JSON.stringify(tweets))

    const completion = await this.openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content:
            // add a useful prompt here
            '',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    })

    const content = completion.choices[0].message.content
    if (content === null) {
      throw new Error('AI response content is null')
    }
    return content
  }

  private async summarizeSummary(summaries: string[]): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content:
            // add a useful prompt here
            '',
        },
        { role: 'user', content: JSON.stringify(summaries) },
      ],
      temperature: 0.7,
    })

    const content = completion.choices[0].message.content
    if (content === null) {
      throw new Error('AI response content is null')
    }
    return content
  }

  /* ---------------------------- 4. Action - Email --------------------------- */
  private async sendEmail(content: string): Promise<void> {
    // Add code here
  }

  /* ---------------------------- 5. Run the Agent ---------------------------- */
  public async run(): Promise<void> {
    try {
      // Login
      await this.login()

      // Get users
      const users = this.loadUsers()

      // Get prompt template
      const promptTemplate = this.loadPromptTemplate()

      for (const user of users) {
        try {
          // 1. Check if Memory has tweets from a specific user within 1/4 of the defined timeframe (e.g. if timeframe is 1 day, check if there are tweets in memory from the past 24/4 = 6 hours)

          // Add code here

          // 2. Get tweets
          const tweets = await this.fetchTweets(user, 10)
          // Add code here

          // 3. Add sleep
          await new Promise(resolve => setTimeout(resolve, 1000))

          // 4. Summarize
          const summary = await this.summarizeWithAI(tweets, promptTemplate)

          // 5. Save to database
          // Add code here
        } catch (error) {
          console.error(`Error processing user ${user}:`, error)
          continue
        }
      }

      // 6. Summarize all summaries into one
      const allSummaries = await this.db.getAllSummaries()
      // Add code here

      // 7. Save to database
      // Add code here

      // 8. Send email
      if (allSummaries.length > 0) {
        const emailContent = await formatEmailContent(
          config.updateFrequency,
          allSummariesSummary,
          users.join(', ')
        )
        // Add code here
        console.log('📧 Email sent successfully')
      } else {
        console.log('No summaries generated to send email')
      }
    } catch (error) {
      console.error('Error in Twitter Digest Agent:', error)
    }
  }
}

export default TwitterDigestAgent
