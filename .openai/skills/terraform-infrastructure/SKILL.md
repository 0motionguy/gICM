# Terraform Infrastructure as Code

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


Master Terraform for managing cloud infrastructure with code.

## Quick Reference

```hcl
# Define provider
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# Create resources
resource "aws_s3_bucket" "app_bucket" {
  bucket = "my-app-bucket"

  tags = {
    Name        = "App Bucket"
    Environment = "Production"
  }
}

# Use variables
variable "environment" {
  type    = string
  default = "development"
}

# Output values
output "bucket_name" {
  value = aws_s3_bucket.app_bucket.id
}

# Use modules
module "vpc" {
  source = "./modules/vpc"
  cidr   = "10.0.0.0/16"
}
```

## Commands
```bash
terraform init      # Initialize
terraform plan      # Preview changes
terraform apply     # Apply changes
terraform destroy   # Destroy infrastructure
terraform fmt       # Format code
terraform validate  # Validate syntax
```

## Best Practices

- Use remote state (S3 + DynamoDB)
- Organize with modules
- Use workspaces for environments
- Lock state files to prevent conflicts
- Never commit secrets (use variables)
- Tag all resources consistently
