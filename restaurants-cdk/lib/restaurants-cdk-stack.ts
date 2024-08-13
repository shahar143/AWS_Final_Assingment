import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
//import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';

export class RestaurantsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const useCacheFlag = true;

    // Students TODO Account Details: Change to your account id
    const labRole = iam.Role.fromRoleArn(this, 'Role', "arn:aws:iam::771045402253:role/LabRole", { mutable: false });

    // Students TODO Account Details: Change the vpcId to the VPC ID of your existing VPC
    const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
      vpcId: 'vpc-09abe69b266555013',
    });

    this.createNatGatewayForPrivateSubnet(vpc);

    //const table = this.createDynamoDBTable();

    // Create an S3 bucket
    const deploymentBucket = this.deployTheApplicationArtifactToS3Bucket(labRole);

    // new cdk.CfnOutput(this, 'Run Test Command', {
    //   value: `TABLE_NAME='${table.tableName}' AWS_REGION='${this.region}' npm test`,
    // });

  }

  private createNatGatewayForPrivateSubnet(vpc: cdk.aws_ec2.IVpc) {
    // Note for students: This is for cost reduction purposes. you shold not change this code.

    // create elastic IP for nat gateway
    const cfnEip = new ec2.CfnEIP(this, 'MyCfnEIP', {
      domain: 'vpc',
    });

    // create nat gateway for private subnet
    const cfnNatGateway = new ec2.CfnNatGateway(this, 'MyCfnNatGateway', {
      subnetId: vpc.publicSubnets[0].subnetId,
      allocationId: cfnEip.attrAllocationId,
    });

    // create route table for private subnet
    const cfnRouteTable = new ec2.CfnRouteTable(this, 'MyCfnRouteTable', {
      vpcId: vpc.vpcId,
    });

    // create route for private subnet to the nat in case of internet access
    new ec2.CfnRoute(this, 'MyCfnRoute', {
      routeTableId: cfnRouteTable.ref,
      destinationCidrBlock: '0.0.0.0/0',
      natGatewayId: cfnNatGateway.ref,
    });

    // associate the route table with the private subnet
    vpc.privateSubnets.forEach((subnet, index) => {
      new ec2.CfnSubnetRouteTableAssociation(this, `MyCfnSubnetRouteTableAssociation${index}`, {
        routeTableId: cfnRouteTable.ref,
        subnetId: subnet.subnetId,
      });
    });
  }

  private deployTheApplicationArtifactToS3Bucket(labRole: cdk.aws_iam.IRole) {
    // Note for students: This is for deployment purposes. you shold not change this code.
    const bucket = new s3.Bucket(this, 'DeploymentArtifact', {
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    });

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

  // private createDynamoDBTable() {
  //   // Students TODO: Change the table schema as needed

  //   const table = new dynamodb.Table(this, 'Restaurants', {
  //     partitionKey: { name: 'SimpleKey', type: dynamodb.AttributeType.STRING },
  //     removalPolicy: cdk.RemovalPolicy.DESTROY,
  //     billingMode: dynamodb.BillingMode.PROVISIONED,
  //     readCapacity: 1, // Note for students: you may need to change this num read capacity for scaling testing if you belive that is right
  //     writeCapacity: 1, // Note for students: you may need to change this num write capacity for scaling testing if you belive that is right
  //   });

  //   // Output the table name
  //   new cdk.CfnOutput(this, 'TableName', {
  //     value: table.tableName,
  //   });

  //   return table;
  // }
}
