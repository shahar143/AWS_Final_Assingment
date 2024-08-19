const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET_NAME = "profilePictureBucket";

exports.handler = async (event) => {
    const { email } = JSON.parse(event.body);

    // Validate that the email is provided
    if (!email) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Email is required' }),
        };
    }

    // Generate a pre-signed URL for the profile picture
    const profilePictureKey = `profile-pictures/${email}.jpg`;
    const url = s3.getSignedUrl('getObject', {
        Bucket: BUCKET_NAME,
        Key: profilePictureKey,
        Expires: 60 * 60 // URL expires in 1 hour
    });

    return {
        statusCode: 200,
        body: JSON.stringify({ preSignedUrl: url }),
    };
};
