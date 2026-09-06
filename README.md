# Aira Gatse

One identity with adaptive cognition and multiple execution styles. Aira Gatse for newcomers, Estagiária to old friends.

Aira Gatse is a self-hosted digital identity designed to interact across channels through a single Docker-based runtime. Its behavior and execution capabilities remain independent from any channel or AI provider.

## Getting started

Requires Docker Engine/Desktop and Docker Compose v2.

Copy `.env.example` to `.env` and configure the integrations you want to enable. Then build and start the service:

```sh
docker compose up --build -d --wait
```

Discord is disabled by default. To enable it, set `DISCORD_ENABLED=true`, provide `DISCORD_TOKEN`, and enable **Message Content Intent** for the bot in the Discord Developer Portal. Grant the bot permission to send messages and read message history wherever it should be available.

Use `/help` in Discord to discover the available commands.

## Roadmap

The next product increments are:

1. Add SQLite persistence with versioned migrations and a Docker volume.
2. Add custom Gatse I commands backed by persisted definitions, while keeping builtins deployment-managed.
3. Add an authenticated Web UI for managing custom commands and inspecting runtime information.

These features will use the existing engine contracts so channel providers remain independent from command storage and administration.

## Development

Run tests through Docker:

```sh
docker compose --profile test run --build --rm test
```

Rebuild after code changes. To view logs or stop the service:

```sh
docker compose logs -f aira-gatse
docker compose down
```

## Documentation

- [Architecture](docs/aira-gatse-architecture-v4.md)
- [Docker and Unraid operations](docs/deployment-unraid.md)
- [Discord interface](docs/providers/discord.md)
- [Configuration example](.env.example)
