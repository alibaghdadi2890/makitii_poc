#!/bin/bash
# First-boot bootstrap. Templated by Tofu; runs once as root via Lightsail user_data.
#
# Lightsail prepends its own #!/bin/sh preamble to user_data, so the shebang
# above is ignored on first invocation — the whole file runs under /bin/sh.
# We detect this and re-exec under bash so we can use pipefail and >(tee ...).
# The Lightsail preamble re-runs under bash on the second pass; it's idempotent
# (writes the same SSH CA file, echoes the same status lines).

if [ -z "$${BASH_VERSION:-}" ]; then
  exec /bin/bash "$0" "$@"
fi

set -euxo pipefail
exec > >(tee /var/log/makitii-bootstrap.log) 2>&1

#--------------------------------------------------------------------
# Docker Engine + compose plugin (official Docker repo).
#--------------------------------------------------------------------
apt-get update
apt-get install -y ca-certificates curl gnupg

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

ARCH=$(dpkg --print-architecture)
CODENAME=$(. /etc/os-release && echo "$VERSION_CODENAME")
echo "deb [arch=$ARCH signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $CODENAME stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

#--------------------------------------------------------------------
# 1 GB swap: the nano bundle has 512 MB and sharp needs headroom on uploads.
#--------------------------------------------------------------------
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo "/swapfile none swap sw 0 0" >> /etc/fstab
fi

#--------------------------------------------------------------------
# `deploy` user: home dir, docker + sudo groups, SSH key, passwordless sudo.
#--------------------------------------------------------------------
if ! id -u deploy >/dev/null 2>&1; then
  useradd -m -s /bin/bash -G sudo,docker deploy
fi
echo 'deploy ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/deploy
chmod 440 /etc/sudoers.d/deploy

install -d -m 0700 -o deploy -g deploy /home/deploy/.ssh
cat > /home/deploy/.ssh/authorized_keys <<'PUBKEY'
${ssh_pub_key}
PUBKEY
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys

#--------------------------------------------------------------------
# Persistent dirs: app code + Postgres data.
#--------------------------------------------------------------------
install -d -m 0755 -o deploy -g deploy /opt/makitii
install -d -m 0755 -o deploy -g deploy /var/lib/makitii/data /var/lib/makitii/caddy

#--------------------------------------------------------------------
# Seed docker-compose.yml and .env stub from repo files (base64-injected by Tofu).
# Deploy workflow overwrites compose on each deploy; .env is operator-managed.
#--------------------------------------------------------------------
echo "${compose_b64}" | base64 -d > /opt/makitii/docker-compose.yml
chown deploy:deploy /opt/makitii/docker-compose.yml
chmod 644 /opt/makitii/docker-compose.yml

echo "${caddy_b64}" | base64 -d > /opt/makitii/Caddyfile
chown deploy:deploy /opt/makitii/Caddyfile

echo "${env_b64}" | base64 -d > /opt/makitii/.env
chown deploy:deploy /opt/makitii/.env
chmod 600 /opt/makitii/.env

echo "makitii bootstrap completed at $(date -u +%FT%TZ)"
