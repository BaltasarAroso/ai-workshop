import { promises as fs } from 'fs';
import path from 'path';

interface Summary {
  timestamp: string;
  summary: string;
  tweetIds: string[];
}

interface MemoryData {
  [username: string]: Summary[];
}

interface CollectionData {
  [key: string]: any;
}

const defaultDbPath = 'database';
const defaultCollection = 'memory';

export default class Database {
  private dbPath: string;

  constructor(dbPath: string = defaultDbPath) {
    this.dbPath = dbPath;
    this.ensureDbExists();
  }

  private async ensureDbExists(): Promise<void> {
    try {
      await fs.access(this.dbPath);
    } catch {
      await fs.mkdir(this.dbPath, { recursive: true });
    }
  }

  async save(collection: string, data: CollectionData): Promise<void> {
    // Sort summaries by timestamp in descending order for each user
    if (collection === defaultCollection) {
      const memoryData = data as MemoryData;
      for (const user in memoryData) {
        memoryData[user].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }
    }
    
    const filePath = path.join(this.dbPath, `${collection}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async load(collection: string): Promise<CollectionData> {
    try {
      const filePath = path.join(this.dbPath, `${collection}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {};  // Return empty object instead of array
      }
      throw error;
    }
  }

  async addUserSummary(username: string, summary: string, tweetIds: string[]): Promise<void> {
    const data = await this.load(defaultCollection) as MemoryData;
    
    // Initialize user array if it doesn't exist
    if (!data[username]) {
      data[username] = [];
    }

    // Add new summary
    data[username].push({
      timestamp: new Date().toISOString(),
      summary,
      tweetIds: tweetIds || []
    });

    // Sort by timestamp descending
    data[username].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Save updated data
    await this.save('memory', data);
  }

  async getUserSummaries(username: string): Promise<Summary[]> {
    const data = await this.load(defaultCollection) as MemoryData;
    return data[username] || [];
  }

  async getLatestSummary(username: string): Promise<Summary | undefined> {
    const summaries = await this.getUserSummaries(username);
    return summaries[0]; // Now returns the first item since array is sorted desc
  }

  // Get latest summary for each user except 'all', already sorted by timestamp
  async getAllSummaries(): Promise<Summary[]> {
    const data = await this.load(defaultCollection) as MemoryData;
    const latestSummaries = Object.entries(data)
      .filter(([key]) => key !== 'all')
      .map(([_, summaries]) => summaries[0])
      .filter(Boolean)
    return latestSummaries;
  }

  async getTweetsFromTimeframe(user: string, timeframeInHours: number): Promise<boolean> {
    const data = await this.load(defaultCollection) as MemoryData;
    const timeframe = new Date(Date.now() - 1000 * 60 * 60 * timeframeInHours/4).getTime()/1000;
    const tweets = data[user]?.filter(tweet => 
      new Date(tweet.timestamp).getTime() > timeframe * 1000
    ) || [];
    return tweets.length > 0;
  }
} 