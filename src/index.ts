import TwitterDigestAgent from './agents/TwitterDigestAgent'
import cron from 'node-cron'
import config from './config/config'

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

// Convert hours to cron expression
function hoursToCron(hours: number): string {
  if (hours < 1) {
    // For less than 1 hour, convert to minutes
    const minutes = Math.round(hours * 60)
    return `*/${minutes} * * * *`
  } else if (hours === 24) {
    // Daily at midnight
    return '0 0 * * *'
  } else if (hours === 168) {
    // Weekly at midnight on Sunday
    return '0 0 * * 0'
  } else {
    // Every N hours
    return `0 */${hours} * * *`
  }
}

// Set up cron schedule based on hours configuration
const cronSchedule: string = hoursToCron(config.updateFrequency)

const job = cron.schedule(cronSchedule, () => {
  agent.run()
})

// Initial run
job.start()
