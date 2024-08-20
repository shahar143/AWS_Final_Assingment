const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    try {
        // Read the index.html file from the local file system
        const filePath = path.join(__dirname, 'index.html');
        const htmlContent = fs.readFileSync(filePath, 'utf8');

        return {
            statusCode: 200, 
            headers: {
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*',
            },
            body: htmlContent,  
        };
    } catch (error) {
        console.error('Error serving index.html:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Could not load index.html' }),
        };
    }
};
