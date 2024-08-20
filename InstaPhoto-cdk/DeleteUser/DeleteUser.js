const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "users";

exports.handler = async (event) => {
    const email_id = event.pathParameters.email;

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
        const result = await dynamo.delete(params).promise();
        console.log("User deleted: ", result);
        if (result.Attributes) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'User deleted successfully' }),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'User not found' }),
            };
        };
    } catch (error) {
        console.error("Error deleting user: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not delete user' }),
        };
    }
};
