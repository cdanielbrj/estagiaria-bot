# Discord interface

The adapter owns connection and interaction delivery. Its `interface/` directory defines how Discord users invoke Aira, how native events become engine requests, and how results become Discord responses.

## Invocation

| Discord input | Normalized request | Execution |
| --- | --- | --- |
| Native `/status`, `/help`, `/about` | `command` with name and arguments | Gatse I |
| `@Aira status` or `@Aira question...` | `conversation` with text | Cognitive capability selection; currently unavailable |
| Ordinary channel chatter | Ambient conversation event | Ignored |

Mentions do not implicitly execute commands. Cognitive Styles are not implemented yet, so an accepted mention receives an explicit unavailable response with no selected Style. `/about` reports the product name, current application version, and GitHub repository.

Aira accepts invocations in any guild channel where Discord delivers events and the bot has the required permissions. There is no application-side channel allowlist. Access is managed with Discord's server, category, channel, and thread permissions. Bots, webhooks, and DMs do not execute work. Discord-specific user-permission mapping must be implemented before adding privileged commands; current builtins are public and receive no permission grants.

## Registering slash commands

Configure `.env` as described in the deployment guide and install the bot with application-command access. Enable **Message Content Intent** so the provider can receive the full text of mentioned questions. See Discord's [application commands documentation](https://docs.discord.com/developers/interactions/application-commands).

Build the image, then explicitly register the commands against the configured Discord application:

```sh
docker compose build aira-gatse
docker compose run --rm --no-deps aira-gatse node src/providers/discord/register-commands.js
```

This operation uses credentials from `.env` and creates or updates the three global slash command declarations. It does not bulk-replace unrelated commands. Registration is not performed on service startup or in tests. Re-run it when changing native command declarations; ordinary handler changes only require rebuilding/recreating the service.

Then start or recreate the service:

```sh
docker compose up --build -d --wait aira-gatse
```

## Boundary and delivery

Slash invocations produce engine command requests. Native interaction objects, authentication tokens, acknowledgments, and message methods stay in the provider. Slash responses use deferred replies and edits, following the [Discord.js interaction API](https://discord.js.org/docs/packages/discord.js/14.27.0/ChatInputCommandInteraction:Class).

The output interface validates structured results and renders a plain-text fallback, with automatic mentions disabled and Discord's message length limit enforced. Uncertain sends are not automatically retried or redirected to another delivery method.

Tests simulate the interface and native transport. They do not register commands, log into Discord, or prove live account permissions.
