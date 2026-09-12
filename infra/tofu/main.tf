provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
      ManagedBy   = "OpenTofu"
    }
  }
}

locals {
  name = "${var.project}-${var.environment}"
}

resource "aws_lightsail_key_pair" "deploy" {
  name       = "${local.name}-deploy"
  public_key = var.ssh_public_key
}

resource "aws_lightsail_instance" "app" {
  name              = local.name
  availability_zone = var.availability_zone
  blueprint_id      = "ubuntu_24_04"
  bundle_id         = var.bundle_id
  key_pair_name     = aws_lightsail_key_pair.deploy.name

  user_data = templatefile("${path.module}/bootstrap.sh", {
    compose_b64 = base64encode(file("${path.module}/../compose/docker-compose.yml"))
    caddy_b64   = base64encode(file("${path.module}/../compose/Caddyfile"))
    env_b64     = base64encode(file("${path.module}/../compose/.env.example"))
    ssh_pub_key = var.ssh_public_key
  })
}

resource "aws_lightsail_static_ip" "app" {
  name = "${local.name}-ip"
}

resource "aws_lightsail_static_ip_attachment" "app" {
  static_ip_name = aws_lightsail_static_ip.app.name
  instance_name  = aws_lightsail_instance.app.name

  lifecycle {
    replace_triggered_by = [aws_lightsail_instance.app.id]
  }
}

# Caddy terminates TLS on the box itself, so 80 and 443 are open to the world.
resource "aws_lightsail_instance_public_ports" "app" {
  instance_name = aws_lightsail_instance.app.name

  port_info {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"
    cidrs     = [var.admin_ip_cidr]
  }

  port_info {
    from_port  = 80
    to_port    = 80
    protocol   = "tcp"
    cidrs      = ["0.0.0.0/0"]
    ipv6_cidrs = ["::/0"]
  }

  port_info {
    from_port  = 443
    to_port    = 443
    protocol   = "tcp"
    cidrs      = ["0.0.0.0/0"]
    ipv6_cidrs = ["::/0"]
  }
}
