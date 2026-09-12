# Makitii POC — ops

One Lightsail box (`makitii-poc`, nano_3_0, eu-west-3, AWS profile `mhdb-hosting`), static IP
**15.224.6.58**. Docker Compose runs two containers: `caddy` (:80/:443, TLS) and `app`
(Express serving the SPA, the API and `/uploads`; SQLite + uploads on `/var/lib/makitii/data`).

## Deploy

Push to `main`. `.github/workflows/deploy.yml` builds the image to
`ghcr.io/alibaghdadi2890/makitii-poc:<sha>`, copies `infra/compose/*` and `infra/scripts/deploy.sh`
to `/opt/makitii/` over SSH, runs the script (pull, up, verify the running SHA) and curls
`/api/health` on the box.

Secrets on the repo: `LIGHTSAIL_HOST`, `LIGHTSAIL_USER` (`deploy`), `LIGHTSAIL_SSH_KEY`
(private half of `~/.ssh/makitii`).

## Turning on the domain

1. Add an A record for the hostname → `15.224.6.58`.
2. On the box, set `SITE_ADDRESS=<hostname>` in `/opt/makitii/.env` and `docker compose up -d`.
   Caddy fetches the Let's Encrypt certificate and redirects HTTP to HTTPS.

```bash
ssh -i ~/.ssh/makitii deploy@15.224.6.58
cd /opt/makitii && sed -i 's/^SITE_ADDRESS=.*/SITE_ADDRESS=makitii.example.com/' .env && docker compose up -d
```

## Daily

```bash
ssh -i ~/.ssh/makitii deploy@15.224.6.58 'cd /opt/makitii && docker compose ps'
ssh -i ~/.ssh/makitii deploy@15.224.6.58 'cd /opt/makitii && docker compose logs -f app'
# reset demo data:
ssh -i ~/.ssh/makitii deploy@15.224.6.58 'cd /opt/makitii && docker compose exec app node --no-warnings server/src/seed.js --reset'
```

## Infra

`infra/tofu/` (OpenTofu, local state, gitignored). `tofu apply` after editing; the bootstrap script
only runs on first boot, so changes to it need a new instance.
