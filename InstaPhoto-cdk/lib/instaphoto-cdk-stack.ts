import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class InstaPhotoCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Students TODO Account Details: Change to your account id
    const labRole = iam.Role.fromRoleArn(this, 'Role', "arn:aws:iam::771045402253:role/LabRole", { mutable: false });

    // Students TODO Account Details: Change the vpcId to the VPC ID of your existing VPC
    const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
      vpcId: 'vpc-09abe69b266555013',
    });

    const table = this.createDynamoDBTable(labRole);

    const postsTable = this.createDynamoDBPostsTable(labRole); 

    const profilePictureBucket = this.createProfilePictureBucket(labRole);

    // Create an S3 bucket
    const deploymentBucket = this.deployTheApplicationArtifactToS3Bucket(labRole);

    const imageProcessingQueue = this.creatreImageProcessingQueue(labRole);

    const GetUserById = this.createLambdaGetUserById(table.tableName, labRole);
    const AddUser = this.createLambdaAddUser(table.tableName, labRole);
    const DeleteUser = this.createLambdaDeleteUser(table.tableName, labRole);
    const UploadProfilePicture = this.uploadProfilePicture(table.tableName, labRole, profilePictureBucket, imageProcessingQueue);
    const GenPreSignedUrl = this.genPreSignedUrl(table.tableName, labRole, profilePictureBucket);
    const presentFrontPage = this.createLambdaPresentFrontPage(table.tableName, labRole);
  
    const FetchPosts = this.createLambdafetchPosts(postsTable.tableName, labRole);
    const UploadPost = this.createLambdaUploadPosts(postsTable.tableName, labRole);

    // Grant Lambda permission to read from the DynamoDB table
    table.grantReadWriteData(GetUserById);
    table.grantReadWriteData(AddUser);
    table.grantReadWriteData(DeleteUser);
    table.grantReadWriteData(UploadProfilePicture);
    table.grantReadWriteData(GenPreSignedUrl);

    postsTable.grantReadWriteData(FetchPosts);
    postsTable.grantReadWriteData(UploadPost);

    const apiGatewayGetUserById = this.createAPIGateway(GetUserById, AddUser, DeleteUser, UploadProfilePicture, GenPreSignedUrl, FetchPosts, UploadPost, presentFrontPage);


    new cdk.CfnOutput(this, 'Run Test Command', {
      value: `TABLE_NAME='${table.tableName}' AWS_REGION='${this.region}' npm test`,
    });

  }

  private createLambdaGetUserById(tableName: string, labRole: iam.IRole) {
    // Lambda Function to Check User Credentials
    const getUserById = new lambda.Function(this, 'GetUserById', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'GetUserById.handler',
      code: lambda.Code.fromAsset('GetUserById'),
      environment: {
        TABLE_NAME: tableName,
      },
      role: labRole, // important for the lab so the cdk will not create a new role
    });

    return getUserById;
  }

  private uploadProfilePicture(tableName: string, labRole: iam.IRole, profilePictureBucket: s3.Bucket, imageProcessingQueue: sqs.Queue) {
    const uploadProfilePicture = new lambda.Function(this, 'UploadProfilePicture', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'UploadProfilePicture.handler',
      code: lambda.Code.fromAsset('UploadProfilePicture'),
      environment: {
        TABLE_NAME: tableName,
        BUCKET_NAME: profilePictureBucket.bucketName,
        QUEUE_URL: imageProcessingQueue.queueUrl, 
      },
      role: labRole,
    });

    profilePictureBucket.grantReadWrite(uploadProfilePicture);
    imageProcessingQueue.grantSendMessages(uploadProfilePicture);
    return uploadProfilePicture;
}

private genPreSignedUrl(tableName: string, labRole: iam.IRole, profilePictureBucket: s3.Bucket) {
  const genPreSignedUrl = new lambda.Function(this, 'GenPreSignedUrl', {
    runtime: lambda.Runtime.NODEJS_LATEST,
    handler: 'GenPreSignURL.handler',
    code: lambda.Code.fromAsset('GenPreSignURL'),
    environment: {
      TABLE_NAME: tableName,
      BUCKET_NAME: profilePictureBucket.bucketName,
    },
    role: labRole,
  });

  return genPreSignedUrl;
}


  private createLambdaAddUser(tableName: string, labRole: iam.IRole) {
    // Lambda Function to Check User Credentials
    const addUser = new lambda.Function(this, 'AddUser', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'AddUser.handler',
      code: lambda.Code.fromAsset('AddUser'),
      environment: {
        TABLE_NAME: tableName,
      },
      role: labRole, // important for the lab so the cdk will not create a new role
    });

    return addUser;
  }

  private createLambdaDeleteUser(tableName: string, labRole: iam.IRole) {
    // Lambda Function to Check User Credentials
    const deleteUser = new lambda.Function(this, 'DeleteUser', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'DeleteUser.handler',
      code: lambda.Code.fromAsset('DeleteUser'),
      environment: {
        TABLE_NAME: tableName,
      },
      role: labRole, // important for the lab so the cdk will not create a new role
    });

    return deleteUser;
  }

  private createLambdafetchPosts(tableName: string, labRole: iam.IRole) {
    // Lambda Function to Check User Credentials
    const fetchPosts = new lambda.Function(this, 'FetchPosts', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'FetchPosts.handler',
      code: lambda.Code.fromAsset('FetchPosts'),
      environment: {
        TABLE_NAME: tableName,
      },
      role: labRole, // important for the lab so the cdk will not create a new role
    });

    return fetchPosts;
  }

  private createLambdaUploadPosts(tableName: string, labRole: iam.IRole) {
    // Lambda Function to Check User Credentials
    const uploadPost = new lambda.Function(this, 'UploadPost', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'UploadPost.handler',
      code: lambda.Code.fromAsset('UploadPost'),
      environment: {
        TABLE_NAME: tableName,
      },
      role: labRole, // important for the lab so the cdk will not create a new role
    });

    return uploadPost;
  }

  private createLambdaPresentFrontPage(tableName: string, labRole: iam.IRole) {
    // Lambda Function to Check User Credentials
    const presentFrontPage = new lambda.Function(this, 'PresentFrontPage', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'PresentFrontPage.handler',
      code: lambda.Code.fromAsset('PresentFrontPage'),
      environment: {
        TABLE_NAME: tableName,
      },
      role: labRole, // important for the lab so the cdk will not create a new role
    });

    return presentFrontPage;
  }

  private createAPIGateway(getUserByIdLambda: lambda.Function, addUserLambda: lambda.Function, deleteUserLambda: lambda.Function, 
    uploadProfilePictureLambda: lambda.Function, genPreSignedUrlLambda: lambda.Function, fetchPosts: lambda.Function, 
    uploadPost: lambda.Function, presentFrontPage: lambda.Function) {
    const api = new apigateway.RestApi(this, 'InstaPhotoApi', {
      restApiName: 'InstaPhoto Service',
      description: 'This service Get User By Id',
    });

    const getUserById = api.root.addResource('GetUserById');
    const getUserByIdParam = getUserById.addResource('{email}');
    getUserByIdParam.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(getUserByIdLambda));

    const addUser = api.root.addResource('AddUser');
    addUser.addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(addUserLambda));

    const deleteUser = api.root.addResource('DeleteUser');
    const deleteUserParam = deleteUser.addResource('{email}');
    deleteUserParam.addMethod('DELETE', new cdk.aws_apigateway.LambdaIntegration(deleteUserLambda));

    const uploadProfilePicture = api.root.addResource('UploadProfilePicture');
    uploadProfilePicture.addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(uploadProfilePictureLambda));

    const genPreSignedUrl = api.root.addResource('GenPreSignedUrl');
    genPreSignedUrl.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(genPreSignedUrlLambda));

    const fetchPostsResource = api.root.addResource('FetchPosts');
    fetchPostsResource.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(fetchPosts));

    const uploadPostResource = api.root.addResource('UploadPost');
    uploadPostResource.addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(uploadPost));

    const presentFrontPageResource = api.root.addResource('PresentFrontPage'); //ok
    presentFrontPageResource.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(presentFrontPage));

    return api;
  }

  private createProfilePictureBucket(labRole: iam.IRole) {
    const profilePictureBucket = new s3.Bucket(this, 'ProfilePictureBucket', {
      bucketName: 'hsppbucket',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Ensures security by blocking public access
    });

    profilePictureBucket.grantReadWrite(labRole);
    return profilePictureBucket;
  }

  private creatreImageProcessingQueue(labRole: iam.IRole) {
    const imageProcessingQueue = new sqs.Queue(this, 'ImageProcessingQueue', {
      queueName: 'hsiqueue',
      visibilityTimeout: cdk.Duration.seconds(300), // Timeout for processing image tasks
    });
      
    imageProcessingQueue.grantSendMessages(labRole);
    return imageProcessingQueue
  }

  private deployTheApplicationArtifactToS3Bucket(labRole: iam.IRole) {
    const bucket = new s3.Bucket(this, 'DeploymentArtifact', {
      bucketName: 'hsbdartifact',
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
      websiteIndexDocument: 'index.html',
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
      
    });

    bucket.grantReadWrite(labRole);

    // Deploy the website content to the S3 bucket
    new s3Deployment.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3Deployment.Source.asset('./../service-files', {
        exclude: ['node_modules', '*.test.js'],
      })],
      destinationBucket: bucket,
      role: labRole,
    });

    // Output the bucket name
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    });
    return bucket;
  }

  private createDynamoDBTable(labRole: iam.IRole) {
    // Students TODO: Change the table schema as needed

    const table = new dynamodb.Table(this, 'users', {
      tableName: 'users',
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1, // Note for students: you may need to change this num read capacity for scaling testing if you belive that is right
      writeCapacity: 1, // Note for students: you may need to change this num write capacity for scaling testing if you belive that is right
    });

    table.grantFullAccess(labRole); 

    // Output the table name
    new cdk.CfnOutput(this, 'TableName', {
      value: table.tableName,
    });

    return table;
  }

  private createDynamoDBPostsTable(labRole: iam.IRole) {
    // Define the DynamoDB table with a partition key and a sort key
    const table = new dynamodb.Table(this, 'posts', {
        tableName: 'posts',
        partitionKey: { name: 'postId', type: dynamodb.AttributeType.STRING },
        sortKey: { name: 'timePosted', type: dynamodb.AttributeType.STRING }, // Adding the sort key
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        billingMode: dynamodb.BillingMode.PROVISIONED,
        readCapacity: 1, // Adjust based on your needs
        writeCapacity: 1, // Adjust based on your needs
    });

    // Grant full access to the table for the specified role
    table.grantFullAccess(labRole);

    // Output the table name
    new cdk.CfnOutput(this, 'TableName', {
        value: table.tableName,
    });

    return table;
}
}