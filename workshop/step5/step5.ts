import { Scraper, Tweet } from 'agent-twitter-client'
import OpenAI from 'openai'
import fs from 'fs'
import nodemailer from 'nodemailer'
import Database from '../../src/db/Database'
import config from '../../src/config/config'
import { formatEmailContent } from '../../src/utils/utils'

class TwitterDigestAgent {
  private openai: OpenAI
  private twitter: Scraper
  private emailTransporter: nodemailer.Transporter
  private db: Database

  constructor() {
    this.openai = new OpenAI({ apiKey: config.openai.apiKey })
    this.twitter = new Scraper()
    this.emailTransporter = nodemailer.createTransport(config.email.smtp)
    this.db = new Database('database')
  }

  /* --------------------------- Twitter Client Authentication -------------------------- */
  private async loadCookiesFromFile(): Promise<string[]> {
    try {      
      const cookies = fs.readFileSync(config.cookiePath, 'utf8')
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
    } catch (error) {
      throw error
    }
  }

  private async saveCookies(): Promise<void> {
    const cookies = await this.twitter.getCookies()
    fs.writeFileSync(config.cookiePath, JSON.stringify(cookies))
  }

  public async login(): Promise<void> {
    // Check if can avoid login by loading cookies from file'
    try {
      const cookies = await this.loadCookiesFromFile()
      await this.twitter.setCookies(cookies)
      console.log('✅ Twitter Login: Successfully loaded cookies from file')
      return
    } catch (error) {
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
      await this.saveCookies()
      console.log('✅ Twitter Login: Successfully saved cookies')
    } catch (error) {
      console.error('Failed to login to Twitter:', error)
      throw error
    }
  }

  public async logout(): Promise<void> {
    console.log('\n🛑 Received termination signal. Cleaning up...')
    try {
      await this.twitter.logout()
      console.log('👋 Twitter session closed')
    } catch (error: any) {
      console.error(`❌ Error during cleanup: ${error.message}`)
    }
  }

  /* --------------------- 1. User Input - Load from file --------------------- */
  private loadUsers(): string[] {
    const users = fs.readFileSync(config.usersPath, 'utf-8')
    return users.split('\n').filter(user => user.trim())
  }

  private loadPromptTemplate(): string {
    const template = fs.readFileSync(config.promptTemplatePath, 'utf-8')
    return template
  }

  /* ------------------- 2. Tools - Twitter Client Fetching ------------------- */
  private async fetchTweets(
    username: string,
    maxTweets: number = 100
  ): Promise<Tweet[]> {
    try {
      const tweets = this.twitter.getTweets(username, maxTweets)
      const timeframe =
        new Date(
          Date.now() - 1000 * 60 * 60 * config.updateFrequency
        ).getTime() / 1000
      const tweetsWhere = await this.twitter.getTweetsWhere(
        tweets,
        (tweet: Tweet) =>
          tweet.timestamp !== undefined && tweet.timestamp > timeframe
      )
      return tweetsWhere
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
            'You are a helpful AI that summarizes Twitter content. You are given a list of tweets and you need to summarize the content of the tweets in a concise and informative way. You should include the most important information from the tweets and the most relevant details. Make sure to not focus extensively on a tweet or user in order to cover the most relevant information from the provided tweets. Include a TLDR; in 5 bullet points with the main topics.',
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
            'You are a helpful AI that summarizes Twitter content. You are given a list of summaries and you need to summarize the content of the summaries in a concise and informative way. You should include the most important information from the summaries and the most relevant details. Make sure to not focus extensively on a tweet or user in order to cover the most relevant information from the provided summaries. Include a TLDR; in 5 bullet points with the main topics.',
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
    const emailContent = await formatEmailContent({
      timeframe: config.updateFrequency,
      summary: content,
      users: this.loadUsers(),
    })
    const mailOptions = {
      from: config.email.from,
      to: config.email.to,
      subject: 'Twitter Digest Summary',
      html: emailContent,
    }

    await this.emailTransporter.sendMail(mailOptions)
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
          const hasTweets = await this.db.getTweetsFromTimeframe(
            user,
            config.updateFrequency
          )
          if (hasTweets) {
            console.log(
              `✅ Tweets found for user ${user} in the past ${config.updateFrequency}`
            )
            continue
          }

          // 2. Get tweets
          const tweets = await this.fetchTweets(user, 10)
          if (!tweets || !tweets.length) {
            console.log(`❌ No tweets found for user ${user}`)
            continue
          } else {
            console.log(`🔄 ${user}: processing ${tweets.length} tweets`)
          }

          // 3. Add sleep
          await new Promise(resolve => setTimeout(resolve, 1000))

          // 4. Summarize
          const summary = await this.summarizeWithAI(tweets, promptTemplate)

          // 5. Save to database
          await this.db.addUserSummary(
            user,
            summary,
            tweets.map(tweet => tweet.id || '')
          )

          console.log(`✅ Processed ${user}`)
        } catch (error) {
          console.error(`Error processing user ${user}:`, error)
          continue
        }
      }

      // 6. Summarize all summaries into one
      console.log('🔄 Summarizing all summaries into one')
      const allSummaries = await this.db.getAllSummaries()
      // Add code here
      const allSummariesSummary = ''

      // 7. Save to database
      // Add code here

      // 8. Send email
      if (allSummaries.length > 0) {
        console.log('🔄 Sending email')
        await this.sendEmail(allSummariesSummary)
        console.log('📧 Email sent successfully to ', config.email.to)
      } else {
        console.log('No summaries generated to send email')
      }
    } catch (error) {
      console.error('Error in Twitter Digest Agent:', error)
    }
  }
}

export default TwitterDigestAgent
