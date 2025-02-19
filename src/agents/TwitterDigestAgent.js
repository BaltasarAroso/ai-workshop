const { OpenAI } = require('openai');
const { Scraper } = require('agent-twitter-client');
const nodemailer = require('nodemailer');
const fs = require('fs');

// Import files
const config = require('../config/config');
const Database = require('../database/Database');
const { formatEmailContent } = require('../utils/utils');

class TwitterDigestAgent {
    constructor() {
        this.openai = new OpenAI(config.openai.apiKey);
        this.twitter = new Scraper();
        this.emailTransporter = nodemailer.createTransport(config.email.smtp);
        this.db = new Database('database');
        this.isLoggedIn = false;
    }

    /* --------------------------- Twitter Client Authentication -------------------------- */
    async loadCookiesFromFile() {
        const cookies = fs.readFileSync('cookies.json', 'utf8');
        const cookiesArray = JSON.parse(cookies);
        const cookieStrings = cookiesArray.map(
            (cookie) =>
                `${cookie.key}=${cookie.value}; Domain=${cookie.domain}; Path=${cookie.path}; ${
                    cookie.secure ? "Secure" : ""
                }; ${cookie.httpOnly ? "HttpOnly" : ""}; SameSite=${
                    cookie.sameSite || "Lax"
                }`
        );
        return cookieStrings;
    }
    async saveCookies() {
        const cookies = await this.twitter.getCookies();
        fs.writeFileSync('cookies.json', JSON.stringify(cookies));
    }

    async login() {
        // Check if can avoid login by loading cookies from file
        try {
            const cookies = await this.loadCookiesFromFile();
            await this.twitter.setCookies(cookies);
            console.log('✅ Successfully loaded cookies');
            return;
        } catch (error) {
            console.log(error)
            console.log('❌ Cookies not available. Logging in...');
        }

        // Login
        try {
            await this.twitter.login(config.twitter.username, config.twitter.password, config.twitter.email, config.twitter.twoFactorSecret);
            console.log('🔑 Successfully logged in to Twitter');
        } catch (error) {
            console.error('Failed to login to Twitter:', error);
            throw error;
        }

        if (await this.twitter.isLoggedIn()) {
            console.log("✅ Successfully authenticated with Twitter");
            await this.saveCookies();
        } else {
            throw new Error("Authentication failed");
        }
    }

    async logout() {
        console.log('\n🛑 Received termination signal. Cleaning up...');
        try {
            await this.twitter.logout();
            console.log('👋 Twitter session closed');
        } catch (error) {
            console.error(`❌ Error during cleanup: ${error.message}`);
        }
    }

    /* --------------------- 1. User Input - Load from file --------------------- */
    loadUsers() {
        const users = fs.readFileSync('data/twitter_users.txt', 'utf-8');
        return users.split('\n').filter(user => user.trim());
    }

    loadPromptTemplate() {
        const template = fs.readFileSync('data/prompt_template.txt', 'utf-8');
        return template;
    }

    /* ------------------- 2. Tools - Twitter Client Fetching ------------------- */
    async fetchTweets(username, maxTweets = 100) {
        try {
            const tweets = this.twitter.getTweets(username, maxTweets);
            const timeframe = new Date(Date.now() - 1000 * 60 * 60 * config.updateFrequency).getTime()/1000;
            const tweetsWhere = await this.twitter.getTweetsWhere(tweets, 
                (tweet) => tweet.timestamp > timeframe
            );
            return tweetsWhere;
        } catch (error) {
            console.error(`Error fetching tweets for ${username}:`, error);
            throw error;
        }
    }

    /* ------------------------- 3. Reasoning - AI Agent ------------------------ */
    async summarizeWithAI(tweets, promptTemplate) {
        const prompt = promptTemplate.replace('{tweets}', JSON.stringify(tweets));
        
        const completion = await this.openai.chat.completions.create({
            model: config.openai.model,
            messages: [
                { role: "system", content: "You are a helpful AI that summarizes Twitter content. You are given a list of tweets and you need to summarize the content of the tweets in a concise and informative way. You should include the most important information from the tweets and the most relevant details. Make sure to not focus extensively on a tweet or user in order to cover the most relevant information from the provided tweets. Include a TLDR; in 5 bullet points with the main topics." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        return completion.choices[0].message.content;
    }

    async summarizeSummary(summaries) {
        const completion = await this.openai.chat.completions.create({
            model: config.openai.model,
            messages: [
                { role: "system", content: "You are a helpful AI that summarizes Twitter content. You are given a list of summaries and you need to summarize the content of the summaries in a concise and informative way. You should include the most important information from the summaries and the most relevant details. Make sure to not focus extensively on a tweet or user in order to cover the most relevant information from the provided summaries. Include a TLDR; in 5 bullet points with the main topics." },
                { role: "user", content: JSON.stringify(summaries) }
            ],
            temperature: 0.7,
        });

        return completion.choices[0].message.content;
    }

    /* ---------------------------- 4. Action - Email --------------------------- */
    async sendEmail(content) {
        const mailOptions = {
            from: config.email.from,
            to: config.email.to,
            subject: 'Twitter Digest Summary',
            html: content
        };

        await this.emailTransporter.sendMail(mailOptions);
    }

    /* ---------------------------- 5. Run the Agent ---------------------------- */
    async run() {
        try {
            // Login
            await this.login();

            // Get users
            const users = this.loadUsers();

            // Get prompt template
            const promptTemplate = this.loadPromptTemplate();

            for (const user of users) {
                try {
                    // Check if Memory has tweets from a specific user within 1/4 of the defined timeframe (e.g. if timeframe is 1 day, check if there are tweets in memory from the past 24/4 = 6 hours)
                    const hasTweets = await this.db.getTweetsFromTimeframe(user, config.updateFrequency);
                    if (hasTweets) {
                        console.log(`✅ Tweets found for user ${user} in the past ${config.updateFrequency}`);
                        continue;
                    }

                    // Get tweets
                    const tweets = await this.fetchTweets(user, 10);
                    if (!tweets || !tweets.length) {
                        console.log(`❌ No tweets found for user ${user}`);
                        continue;
                    } else {
                        console.log(`🔄 ${user}: processing ${tweets.length} tweets`)
                    }

                    // Add sleep
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Summarize
                    const summary = await this.summarizeWithAI(tweets, promptTemplate);
                    
                    // Save to database
                    await this.db.addUserSummary(
                        user,
                        summary,
                        tweets.map(tweet => tweet.id)
                    );

                    console.log(`✅ Processed ${user}`);

                } catch (error) {
                    console.error(`Error processing user ${user}:`, error);
                    continue;
                }
            }

            // Summarize all summaries into one
            const allSummaries = await this.db.getAllSummaries();
            const allSummariesSummary = await this.summarizeSummary(allSummaries, promptTemplate);
            // Save to database
            await this.db.addUserSummary(
                'all',
                allSummariesSummary,
                allSummaries.map(summary => summary.user)
            );

            // Send email
            if (allSummaries.length > 0) {
                const emailContent = await formatEmailContent(config.updateFrequency, allSummariesSummary, users.join(', '));
                await this.sendEmail(emailContent);
                console.log('📧 Email sent successfully');
            } else {
                console.log('No summaries generated to send email');
            }

        } catch (error) {
            console.error('Error in Twitter Digest Agent:', error);
        }
    }
}

module.exports = TwitterDigestAgent; 