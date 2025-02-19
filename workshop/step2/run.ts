import TwitterDigestAgent from './step2'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config()

// Initialize agent
const agent = new TwitterDigestAgent()

// Handle SIGTERM - Termination signal
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM signal')
    await agent.logout()
    process.exit(0)
})
  
// Handle SIGINT - Ctrl+C
process.on('SIGINT', async () => {
    console.log('Received SIGINT signal')
    await agent.logout()
    process.exit(0)
})


// For testing purposes - single run
agent.run()
