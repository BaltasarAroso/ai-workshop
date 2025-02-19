import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import fs from 'fs'
import TwitterDigestAgent from './agents/TwitterDigestAgent'

// Mock the external dependencies
jest.mock('openai')
jest.mock('agent-twitter-client')
jest.mock('nodemailer')
jest.mock('../../src/db/Database')
jest.mock('../../src/config/config', () => ({
  default: {
    openai: { apiKey: 'test-api-key' },
    email: { smtp: {} },
    twitter: {
      username: 'test-user',
      password: 'test-pass',
      email: 'test@email.com',
      twoFactorSecret: '123456'
    },
    cookiePath: 'cookies.json',
    databasePath: 'database/memory.json',
    promptTemplatePath: 'data/prompt_template.txt',
    usersPath: 'data/twitter_users.txt'
  }
}))

// Add test configuration variables
const TEST_CONFIG = {
  users: ['elonmusk', 'BarackObama', 'BillGates'],
  sampleUser: 'elonmusk',
  tweetCount: 10,
  promptTemplate: 'Analyze tweets from {username}: {tweets}',
  testEmail: 'test@email.com',
  mockCookies: [
    {
      key: 'test',
      value: 'value',
      domain: '.twitter.com',
      path: '/',
      secure: true,
      httpOnly: true
    }
  ]
}

describe('TwitterDigestAgent - Step 1', () => {
  let agent: TwitterDigestAgent
  
  beforeEach(() => {
    // Create test files using TEST_CONFIG
    fs.writeFileSync('data/twitter_users.txt', TEST_CONFIG.users.join('\n'))
    fs.writeFileSync('data/prompt_template.txt', TEST_CONFIG.promptTemplate)
    
    agent = new TwitterDigestAgent()
  })

  afterEach(() => {
    // Clean up test files
    try {
      fs.unlinkSync('data/twitter_users.txt')
      fs.unlinkSync('data/prompt_template.txt')
      fs.unlinkSync('cookies.json')
    } catch (error) {
      // Ignore errors if files don't exist
    }
    jest.clearAllMocks()
  })

  describe('File Loading', () => {
    it('should load users from file correctly', () => {
      const users = (agent as any).loadUsers()
      expect(users).toEqual(TEST_CONFIG.users)
    })

    it('should load prompt template from file correctly', () => {
      const template = (agent as any).loadPromptTemplate()
      expect(template).toBe(TEST_CONFIG.promptTemplate)
    })

    it('should handle empty lines in users file', () => {
      fs.writeFileSync('data/twitter_users.txt', `${TEST_CONFIG.users[0]}\n\n${TEST_CONFIG.users[1]}\n\n`)
      const users = (agent as any).loadUsers()
      expect(users).toEqual([TEST_CONFIG.users[0], TEST_CONFIG.users[1]])
    })
  })

  describe('Twitter Authentication', () => {
    it('should load cookies if available', async () => {
      fs.writeFileSync('cookies.json', JSON.stringify(TEST_CONFIG.mockCookies))

      await agent.login()
      expect(fs.existsSync('cookies.json')).toBeTruthy()
    })

    it('should perform full login if cookies are not available', async () => {
      // Ensure cookies.json doesn't exist
      try {
        fs.unlinkSync('cookies.json')
      } catch (error) {
        // Ignore if file doesn't exist
      }

      await agent.login()
      // Verify that new cookies were saved
      expect(fs.existsSync('cookies.json')).toBeTruthy()
    })
  })

  describe('Twitter Logout', () => {
    it('should logout successfully', async () => {
      await agent.logout()
      expect(fs.existsSync('cookies.json')).toBeFalsy()
    })
  })

  describe('Twitter Fetch Tweets', () => {
    it('should fetch tweets successfully', async () => {
      const tweets = await (agent as any).fetchTweets(TEST_CONFIG.sampleUser, TEST_CONFIG.tweetCount)
      expect(tweets.length).toBeGreaterThan(0)
    })
  })

  describe('Twitter Summarize Tweets', () => {
    it('should summarize tweets successfully', async () => {
      const summary = await (agent as any).summarizeTweets(TEST_CONFIG.sampleUser, TEST_CONFIG.tweetCount)
      expect(summary).toBeDefined()
    })
  })

  describe('Twitter Send Email', () => {
    it('should send email successfully', async () => {
      const email = await (agent as any).sendEmail(TEST_CONFIG.testEmail, 'Test Email', 'This is a test email')
      expect(email).toBeDefined()
    })
  })

  describe('Twitter Run', () => {
    it('should run successfully', async () => {
      await (agent as any).run()
      expect(true).toBeTruthy()
    })
  })
  
})
