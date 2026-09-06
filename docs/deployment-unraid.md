# Docker and Unraid — milestone A

Aira Gatse uses a standard Docker container. The runtime has no knowledge of Unraid paths, networks, proxies, or APIs. This release does not include automatic remote deployment.

## Image and execution

For ongoing local development, keep the application service running and rebuild it after source changes. Test containers remain disposable. To start the local service without loading credentials from your `.env`, use:

```sh
docker compose --env-file .env.example up --build -d --wait aira-gatse
```

Once you intend to enable the configured integrations, recreate the same service with `docker compose up --build -d --wait aira-gatse` to load your `.env`. A running container does not pick up edits to that file automatically. Keeping the service running does not add durable application storage; persistence remains the next milestone.

Build on the target host, or publish an image to your chosen registry once a distribution policy is established. The name below is local; it does not imply a published repository. Replace `your-revision` with the revision being built:

```sh
docker build --target runtime --build-arg APP_REVISION=your-revision -t aira-gatse:0.2.0 .
```

When distributing an image between machines, build for the target host architecture. A local build uses the local Docker platform; it does not verify execution on another architecture.

| Container/template field | Value |
| --- | --- |
| Image | Local `aira-gatse:0.2.0`, or `ghcr.io/cdanielbrj/aira-gatse:<latest-or-commit-sha>` |
| Network | Default bridge or an operator-defined network |
| Internal port | TCP 3000, health only at this stage |
| Port publication | Optional for the internal healthcheck; restrict to the host/administrative network if published |
| User | `node` (UID/GID 1000 in the image) |
| Restart policy | `unless-stopped` |
| Stop timeout | At least 20 seconds |
| Init | Enabled (`--init`) |
| Filesystem | Read-only; temporary `/tmp` if needed |
| Health | `GET /health`; the Dockerfile includes the healthcheck command |
| Configuration | `DISCORD_ENABLED`, `DISCORD_TOKEN`; `HEALTH_HOST=0.0.0.0`, `HEALTH_PORT=3000` |
| Current volumes | None; milestone A does not store persistent history |

The repository's Compose file is the executable operational reference. Credentials belong to environment configuration, never image contents. Do not mount the Docker socket into the application container.

## Persistence planned for milestone B

The planned contract is an internal `/data` directory, mounted to a volume or an operator-selected path on Unraid. The application does not consume this path yet; it does not represent implemented persistence.

The embedded database, retained history, and durable execution/deduplication/recovery metadata should reside in that mount. The database choice will be finalized in milestone B. Migration scripts belong to the versioned image; the applied migration version belongs to the persistent database. Set directory ownership to the runtime UID/GID before enabling writes.

No `/mnt/...` path should enter application code. Milestone B acceptance requires backup/restore and container recreation with data preserved.

## Upgrades and rollback

1. Run tests in Docker and build an image with an identifiable tag/revision.
2. Record the previous image and, once a database exists, obtain a consistent backup and check migration compatibility.
3. Recreate the container while preserving configuration and future mounts.
4. Check health, version/revision, logs, and provider connectivity.
5. If necessary, revert to the previous image. Milestone A has no migrations; a future incompatible migration will require a compatible restore, not just a tag change.

Discord requires outbound connections; this implementation needs no webhook or public endpoint. Proxy, TLS, and external access remain infrastructure choices.
