# CloudSim User Isolation with IAM

This guide explains how to set up IAM roles that isolate users so they can only see/manage their own EC2 instances.

## Architecture

```
CloudSim User (user@gmail.com)
       │
       ▼
CloudSim Backend (assumes IAM role)
       │
       ▼
AWS STS AssumeRole → CloudSimUserRole
       │
       ▼
IAM Policy checks:
  - Can only manage instances tagged with "CloudSimUser=6"
  - Cannot see other users' instances
```

## Step 1: Create IAM Policy for Regular Users

Create a file `user-policy.json`:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowDescribeAll",
            "Effect": "Allow",
            "Action": [
                "ec2:DescribeInstances",
                "ec2:DescribeInstanceStatus",
                "ec2:DescribeImages",
                "ec2:DescribeKeyPairs",
                "ec2:DescribeSecurityGroups",
                "ec2:DescribeSubnets",
                "ec2:DescribeVpcs"
            ],
            "Resource": "*"
        },
        {
            "Sid": "AllowStartStopOwnInstances",
            "Effect": "Allow",
            "Action": [
                "ec2:StartInstances",
                "ec2:StopInstances",
                "ec2:RebootInstances"
            ],
            "Resource": "arn:aws:ec2:*:096615316348:instance/*",
            "Condition": {
                "StringEquals": {
                    "ec2:ResourceTag/CloudSimUser": "${aws:PrincipalTag/CloudSimUser}"
                }
            }
        },
        {
            "Sid": "AllowRunInstancesWithTag",
            "Effect": "Allow",
            "Action": "ec2:RunInstances",
            "Resource": [
                "arn:aws:ec2:*:096615316348:instance/*"
            ],
            "Condition": {
                "StringEquals": {
                    "aws:RequestTag/CloudSimUser": "${aws:PrincipalTag/CloudSimUser}"
                },
                "ForAllValues:StringEquals": {
                    "ec2:InstanceType": ["t2.micro", "t3.micro"]
                }
            }
        },
        {
            "Sid": "AllowRunInstancesResources",
            "Effect": "Allow",
            "Action": "ec2:RunInstances",
            "Resource": [
                "arn:aws:ec2:*:096615316348:subnet/*",
                "arn:aws:ec2:*:096615316348:security-group/*",
                "arn:aws:ec2:*:096615316348:network-interface/*",
                "arn:aws:ec2:*:096615316348:volume/*",
                "arn:aws:ec2:*::image/*"
            ]
        },
        {
            "Sid": "AllowCreateTags",
            "Effect": "Allow",
            "Action": "ec2:CreateTags",
            "Resource": "arn:aws:ec2:*:096615316348:instance/*",
            "Condition": {
                "StringEquals": {
                    "ec2:CreateAction": "RunInstances"
                }
            }
        },
        {
            "Sid": "AllowCloudWatchMetrics",
            "Effect": "Allow",
            "Action": [
                "cloudwatch:GetMetricStatistics",
                "cloudwatch:ListMetrics"
            ],
            "Resource": "*"
        },
        {
            "Sid": "DenyTerminate",
            "Effect": "Deny",
            "Action": "ec2:TerminateInstances",
            "Resource": "*"
        },
        {
            "Sid": "DenyCostExplorer",
            "Effect": "Deny",
            "Action": "ce:*",
            "Resource": "*"
        }
    ]
}
```

## Step 2: Create Trust Policy

Create `trust-policy.json`:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::096615316348:user/cloudsim"
            },
            "Action": "sts:AssumeRole",
            "Condition": {
                "StringEquals": {
                    "sts:ExternalId": "cloudsim-app"
                }
            }
        }
    ]
}
```

## Step 3: Create the IAM Role

```bash
# Create the role
aws iam create-role \
    --role-name CloudSimUserRole \
    --assume-role-policy-document file://trust-policy.json \
    --description "Limited access role for CloudSim regular users"

# Attach the policy
aws iam put-role-policy \
    --role-name CloudSimUserRole \
    --policy-name CloudSimUserPolicy \
    --policy-document file://user-policy.json
```

## Step 4: Configure CloudSim

Update your `.env` file:

```bash
ENABLE_ROLE_BASED_ACCESS=true
AWS_ROLE_READONLY=arn:aws:iam::096615316348:role/CloudSimUserRole
```

## Step 5: Tag Instances on Creation

The backend must tag instances with the creating user's ID. Update `aws_service.py`:

```python
def create_instance(name: str, instance_type: str, user_id: int) -> dict:
    response = ec2_resource.create_instances(
        # ... existing params ...
        TagSpecifications=[{
            "ResourceType": "instance",
            "Tags": [
                {"Key": "Name", "Value": name},
                {"Key": "CloudSimUser", "Value": str(user_id)},  # User isolation tag
            ]
        }]
    )
```

## Limitations

⚠️ **DescribeInstances shows all instances**: AWS doesn't support filtering DescribeInstances by tag in IAM policies. Users can SEE all instances but can only START/STOP their own.

Alternative: Filter in the application layer (CloudSim backend filters results by CloudSimUser tag before returning to user).

## Quick Test

```bash
# Assume the role
aws sts assume-role \
    --role-arn arn:aws:iam::096615316348:role/CloudSimUserRole \
    --role-session-name test-session \
    --external-id cloudsim-app

# Try to terminate (should fail)
aws ec2 terminate-instances --instance-ids i-xxx  # Access Denied
```
