const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "users";

exports.handler = async (event) => {
    const { email, password, phone } = JSON.parse(event.body);

    // Validate that the required fields are provided
    if (!email || !password || !phone) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Email, password, and phone are required' }),
        };
    }

    // Check if the user already exists in DynamoDB
    const userParams = {
        TableName: TABLE_NAME,
        Key: { email: email },
    };

    const existingUser = await dynamo.get(userParams).promise();
    if (existingUser.Item) {
        return {
            statusCode: 409, // Conflict
            body: JSON.stringify({ error: 'User already exists' }),
        };
    }

    // Create a new user record in DynamoDB
    const params = {
        TableName: TABLE_NAME,
        Item: {
            email: email,
            password: password, // You should hash the password before storing it in a real-world scenario
            phone: phone,
            hasProfilePicture: false, // Initially, no profile picture
            profilePictureUrl: null,
        },
    };

    try {
        await dynamo.put(params).promise();
        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'User created successfully' }),
        };
    } catch (error) {
        console.error("Error creating user: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not create user' }),
        };
    }
};
