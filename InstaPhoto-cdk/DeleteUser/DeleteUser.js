const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "users";

exports.handler = async (event) => {
    const { email_id } = event.pathParameters;

    // Validate that the email is provided
    if (!email_id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Email is required' }),
        };
    }

    const params = {
        TableName: TABLE_NAME,
        Key: { email: email_id },
    };

    try {
        await dynamo.delete(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User deleted successfully' }),
        };
    } catch (error) {
        console.error("Error deleting user: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not delete user' }),
        };
    }
};
