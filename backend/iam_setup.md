# CloudSim IAM Role Setup

## 1. Admin Role Policy (CloudSimAdminRole)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:*",
                "cloudwatch:*",
                "ce:*",
                "iam:ListRoles",
                "iam:PassRole"
            ],
            "Resource": "*"
        }
    ]
}
```

## 2. Developer Role Policy (CloudSimDeveloperRole)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:Describe*",
                "ec2:RunInstances",
                "ec2:StartInstances",
                "ec2:StopInstances",
                "ec2:RebootInstances",
                "ec2:TerminateInstances",
                "cloudwatch:GetMetricStatistics",
                "cloudwatch:ListMetrics",
                "ce:GetCostAndUsage"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Deny",
            "Action": [
                "ec2:CreateVpc",
                "ec2:DeleteVpc",
                "ec2:ModifyVpc*"
            ],
            "Resource": "*"
        }
    ]
}
```

## 3. ReadOnly Role Policy (CloudSimReadOnlyRole)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:Describe*",
                "cloudwatch:GetMetricStatistics",
                "cloudwatch:ListMetrics",
                "ce:GetCostAndUsage"
            ],
            "Resource": "*"
        }
    ]
}
```

## 4. Student Role Policy (CloudSimStudentRole)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:DescribeInstances",
                "ec2:DescribeInstanceStatus",
                "ec2:RunInstances",
                "ec2:StartInstances",
                "ec2:StopInstances"
            ],
            "Resource": "*",
            "Condition": {
                "StringEquals": {
                    "ec2:InstanceType": ["t2.micro", "t3.micro"]
                }
            }
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudwatch:GetMetricStatistics"
            ],
            "Resource": "*"
        }
    ]
}
```

## 5. Trust Policy (for all roles)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::096615316348:user/cloudsim"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

## Setup Commands
```bash
# Create roles
aws iam create-role --role-name CloudSimAdminRole --assume-role-policy-document file://trust-policy.json
aws iam create-role --role-name CloudSimDeveloperRole --assume-role-policy-document file://trust-policy.json
aws iam create-role --role-name CloudSimReadOnlyRole --assume-role-policy-document file://trust-policy.json
aws iam create-role --role-name CloudSimStudentRole --assume-role-policy-document file://trust-policy.json

# Attach policies
aws iam put-role-policy --role-name CloudSimAdminRole --policy-name AdminPolicy --policy-document file://admin-policy.json
aws iam put-role-policy --role-name CloudSimDeveloperRole --policy-name DeveloperPolicy --policy-document file://developer-policy.json
aws iam put-role-policy --role-name CloudSimReadOnlyRole --policy-name ReadOnlyPolicy --policy-document file://readonly-policy.json
aws iam put-role-policy --role-name CloudSimStudentRole --policy-name StudentPolicy --policy-document file://student-policy.json
```