import TwitterDigestAgent from './step0'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config()

// Initialize agent
const agent = new TwitterDigestAgent()

// For testing purposes - single run
agent.run()
