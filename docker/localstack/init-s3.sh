#!/bin/sh

echo "Creating S3 bucket..."

awslocal s3api create-bucket \
  --bucket "${AWS_S3_BUCKET_NAME}"

echo "S3 buckets:"
awslocal s3api list-buckets