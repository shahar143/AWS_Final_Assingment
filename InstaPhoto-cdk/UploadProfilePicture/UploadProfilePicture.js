const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "users";
const BUCKET_NAME = "profilePictureBucket";

exports.handler = async (event) => {
    const { email, profilePicture } = JSON.parse(event.body);

    // Validate that the required fields are provided
    if (!email || !profilePicture) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Email and profile picture are required' }),
        };
    }

    // Check if the user exists in DynamoDB
    const userParams = {
        TableName: TABLE_NAME,
        Key: { email: email },
    };

    const user = await dynamo.get(userParams).promise();
    if (!user.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'User not found' }),
        };
    }

    // Decode the base64 image and upload it to S3
    const profilePictureKey = `profile-pictures/${email}.jpg`;
    const buffer = Buffer.from(profilePicture, 'base64');
    const s3Params = {
        Bucket: BUCKET_NAME,
        Key: profilePictureKey,
        Body: buffer,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg'
    };

    try {
        await s3.upload(s3Params).promise();

        // Update the user's record in DynamoDB
        const updateParams = {
            TableName: TABLE_NAME,
            Key: { email: email },
            UpdateExpression: "set profilePictureUrl = :url, hasProfilePicture = :status",
            ExpressionAttributeValues: {
                ":url": `https://${BUCKET_NAME}.s3.amazonaws.com/${profilePictureKey}`,
                ":status": true,
            },
            ReturnValues: "UPDATED_NEW"
        };

        await dynamo.update(updateParams).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Profile picture uploaded and user record updated successfully' }),
        };
    } catch (error) {
        console.error("Error uploading profile picture: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not upload profile picture' }),
        };
    }
};
