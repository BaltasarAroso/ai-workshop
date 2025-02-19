import { Scraper, Tweet } from 'agent-twitter-client'
import OpenAI from 'openai'
import fs from 'fs'
import nodemailer from 'nodemailer'
import Database from '../database/Database'
import config from '../../src/config/config.ts'

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
}
export default TwitterDigestAgent
