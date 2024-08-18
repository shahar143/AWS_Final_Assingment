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
    const labRole = iam.Role.fromRoleArn(this, 'Role', "arn:aws:iam::648440372507:role/LabRole", { mutable: false });

    // Students TODO Account Details: Change the vpcId to the VPC ID of your existing VPC
    const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
      vpcId: 'vpc-0db6a0e723bdca343',
    });

    const table = this.createDynamoDBTable(labRole);

    const profilePictureBucket = this.createProfilePictureBucket(labRole);

    // Create an S3 bucket
    const deploymentBucket = this.deployTheApplicationArtifactToS3Bucket(labRole);

    const imageProcessingQueue = this.creatreImageProcessingQueue(labRole);

    const GetUserById = this.createLambdaGetUserById(table.tableName, labRole, vpc);
    const AddUser = this.createLambdaAddUser(table.tableName, labRole, vpc);
    const DeleteUser = this.createLambdaDeleteUser(table.tableName, labRole, vpc);
    const UploadProfilePicture = this.uploadProfilePictureToS3Bucket(table.tableName, labRole, profilePictureBucket, imageProcessingQueue, vpc);

    // Grant Lambda permission to read from the DynamoDB table
    table.grantReadWriteData(GetUserById);
    table.grantReadWriteData(AddUser);
    table.grantReadWriteData(DeleteUser);
    table.grantReadWriteData(UploadProfilePicture);

    const apiGatewayGetUserById = this.createAPIGateway(GetUserById, AddUser, DeleteUser, UploadProfilePicture);


    new cdk.CfnOutput(this, 'Run Test Command', {
      value: `TABLE_NAME='${table.tableName}' AWS_REGION='${this.region}' npm test`,
    });

  }

  private createLambdaGetUserById(tableName: string, labRole: cdk.aws_iam.IRole, vpc: ec2.IVpc) {
    // Lambda Function to Check User Credentials
    const getUserById = new cdk.aws_lambda.Function(this, 'GetUserById', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
      handler: 'GetUserById.handler',
      code: cdk.aws_lambda.Code.fromAsset('GetUserById'),
      environment: {
        TABLE_NAME: tableName,
      },
      vpc: vpc, 
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }, 
      role: labRole, // important for the lab so the cdk will not create a new role
    });

    return getUserById;
  }

  private uploadProfilePictureToS3Bucket(tableName: string, labRole: cdk.aws_iam.IRole, profilePictureBucket: s3.Bucket, imageProcessingQueue: sqs.Queue, vpc: ec2.IVpc) {
    const uploadProfilePicture = new cdk.aws_lambda.Function(this, 'UploadProfilePicture', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
      handler: 'UploadProfilePicture.handler',
      code: cdk.aws_lambda.Code.fromAsset('UploadProfilePicture'),
      environment: {
        TABLE_NAME: tableName,
        BUCKET_NAME: profilePictureBucket.bucketName,
        QUEUE_URL: imageProcessingQueue.queueUrl, 
      },
      vpc: vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }, 
      role: labRole,
    });

    profilePictureBucket.grantReadWrite(uploadProfilePicture);
    imageProcessingQueue.grantSendMessages(uploadProfilePicture);
    return uploadProfilePicture;
}


  private createLambdaAddUser(tableName: string, labRole: cdk.aws_iam.IRole, vpc: ec2.IVpc) {
    // Lambda Function to Check User Credentials
    const addUser = new cdk.aws_lambda.Function(this, 'AddUser', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
      handler: 'AddUser.handler',
      code: cdk.aws_lambda.Code.fromAsset('AddUser'),
      environment: {
        TABLE_NAME: tableName,
      },
      vpc: vpc, 
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }, 
      role: labRole, // important for the lab so the cdk will not create a new role
    });

    return addUser;
  }

  private createLambdaDeleteUser(tableName: string, labRole: cdk.aws_iam.IRole, vpc: ec2.IVpc) {
    // Lambda Function to Check User Credentials
    const deleteUser = new cdk.aws_lambda.Function(this, 'DeleteUser', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
      handler: 'DeleteUser.handler',
      code: cdk.aws_lambda.Code.fromAsset('DeleteUser'),
      environment: {
        TABLE_NAME: tableName,
      },
      vpc: vpc, 
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }, 
      role: labRole, // important for the lab so the cdk will not create a new role
    });

    return deleteUser;
  }

  private createAPIGateway(getUserByIdLambda: lambda.Function, addUserLambda: lambda.Function, deleteUserLambda: lambda.Function, uploadProfilePictureLambda: lambda.Function) {
    const api = new cdk.aws_apigateway.RestApi(this, 'InstaPhotoApi', {
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

    return api;
  }

  private createProfilePictureBucket(labRole: cdk.aws_iam.IRole) {
    const profilePictureBucket = new s3.Bucket(this, 'ProfilePictureBucket', {
      bucketName: 'HSPPBucket',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Ensures security by blocking public access
    });

    profilePictureBucket.grantReadWrite(labRole);
    return profilePictureBucket;
  }

  private creatreImageProcessingQueue(labRole: cdk.aws_iam.IRole) {
    const imageProcessingQueue = new sqs.Queue(this, 'ImageProcessingQueue', {
      queueName: 'HSIqueue',
      visibilityTimeout: cdk.Duration.seconds(300), // Timeout for processing image tasks
    });
      
    imageProcessingQueue.grantSendMessages(labRole);
    return imageProcessingQueue
  }

  private deployTheApplicationArtifactToS3Bucket(labRole: cdk.aws_iam.IRole) {
    const bucket = new s3.Bucket(this, 'DeploymentArtifact', {
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

  private createDynamoDBTable(labRole: cdk.aws_iam.IRole) {
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
}