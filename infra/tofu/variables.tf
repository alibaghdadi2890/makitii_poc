variable "aws_region" {
  type    = string
  default = "eu-west-3"
}

variable "aws_profile" {
  type    = string
  default = "mhdb-hosting"
}

variable "project" {
  type    = string
  default = "makitii"
}

variable "environment" {
  type    = string
  default = "poc"
}

variable "bundle_id" {
  description = "Lightsail bundle. nano_3_0 ($5/mo, 512MB) is the smallest; micro_3_0 ($7/mo, 1GB) is what the other boxes on this account use."
  type        = string
  default     = "nano_3_0"
}

variable "availability_zone" {
  type    = string
  default = "eu-west-3a"
}

variable "ssh_public_key" {
  description = "SSH public key authorized for the deploy user."
  type        = string
}

variable "admin_ip_cidr" {
  description = "CIDR allowed to SSH in. 0.0.0.0/0 is needed while GitHub Actions deploys over SSH."
  type        = string
  default     = "0.0.0.0/0"
}
