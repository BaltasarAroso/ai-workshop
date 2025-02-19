const marked = require('marked');

// Format Email Content
async function formatEmailContent(timeframe, summary, users) {
    // Convert markdown to HTML
    const htmlSummary = marked.parse(summary);
    
    // Format users
    const formattedUsers = users.map(user => `<a href="https://twitter.com/${user}">${user}</a>`).join(', ');

    const emailBody = `
        <h1>Twitter Digest Summary</h1>
        <h2>Timeframe: ${timeframe} hours</h2>
        <p><b>Users:</b> ${formattedUsers}</p>
        <div class="summary">
            ${htmlSummary}
        </div>
        <style>
            .summary h1 { font-size: 24px; margin-top: 20px; }
            .summary h2 { font-size: 20px; margin-top: 16px; }
            .summary h3 { font-size: 18px; margin-top: 14px; }
            .summary p { margin: 10px 0; }
            .summary ul { margin: 10px 0; padding-left: 20px; }
            .summary li { margin: 5px 0; }
            .summary strong { font-weight: bold; }
            .summary em { font-style: italic; }
            .summary code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
            .summary blockquote { 
                border-left: 4px solid #ddd;
                margin: 10px 0;
                padding-left: 10px;
                color: #666;
            }
        </style>
    `;
    return emailBody;
}

module.exports = {
    formatEmailContent
};