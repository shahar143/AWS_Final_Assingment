const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // Parse the incoming event body (assumed to be in JSON format)
    const requestBody = JSON.parse(event.body);

    // Destructure the necessary fields from the request body
    const { postId, username, email, location, timePosted, imageUrl, caption } = requestBody;
    
    // Fetch the profile picture of the user from the S3 bucket
    const profilePicture = `https://hsppbucket.s3.amazonaws.com/${email}.jpg`;

    // Define the parameters for the DynamoDB put operation
    const params = {
        TableName: 'posts', // Replace with your actual DynamoDB table name
        Item: {
            postId: postId || AWS.util.uuid.v4(), // Use provided postId or generate a UUID
            username,
            email,
            location,
            timePosted,
            imageUrl,
            profilePicture,
            caption,
        },
    };

    try {
        // Perform the put operation to add the new post to DynamoDB
        await dynamoDb.put(params).promise();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Allow CORS for all domains
            },
            body: JSON.stringify({ message: 'Post uploaded successfully' }),
        };
    } catch (error) {
        console.error('Error uploading post:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Could not upload post' }),
        };
    }
};
