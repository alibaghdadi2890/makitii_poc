output "public_ip" {
  description = "Static IP. Point the DNS A record here."
  value       = aws_lightsail_static_ip.app.ip_address
}

output "instance_name" {
  value = aws_lightsail_instance.app.name
}
