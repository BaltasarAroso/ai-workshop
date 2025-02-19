import { OpenAI } from 'openai'
import { Scraper } from 'agent-twitter-client'
import nodemailer from 'nodemailer'
import fs from 'fs'
import Database from '../../src/db/Database'
import config from '../../src/config/config'

class TwitterDigestAgent {
  private openai: OpenAI
  private twitter: Scraper
  private emailTransporter: nodemailer.Transporter
  private db: Database

  constructor() {
    //  Add code here - Define private properties (this.openai, this.twitter)
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
      // Check if can avoid login by loading cookies from file
      try {
        const cookies = await this.loadCookiesFromFile()
        await this.twitter.setCookies(cookies)
        console.log('✅ Twitter Login: Successfully loaded cookies from file')
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

  /* ------------------------------ Main Function ----------------------------- */
  public async run(): Promise<void> {
    // Try to login and logout
    try {
      await this.login()
      console.log('✅ Successfully logged in to Twitter')
      // Sleep for 5 seconds
      console.log('🔄 Sleeping for 5 seconds...')
      await new Promise(resolve => setTimeout(resolve, 5000))
      console.log('🔄 Waking up...')
      await this.logout()
      console.log('👋 Successfully logged out from Twitter')
    } catch (error) {
      console.error('Failed to login to Twitter:', error)
      throw error
    }
  }
}

export default TwitterDigestAgent
