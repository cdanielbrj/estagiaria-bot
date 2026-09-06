# Aira Gatse Architecture — v4

> **Repository:** `aira-gatse`
>
> **Status:** Container-first architecture baseline / product contract
>
> **Date:** 2026-09-05
>
> **Supersedes:** v3 as the proposed architecture reference; preserves prior versions for comparison.
>
> **Purpose:** Define Aira Gatse as one product and one persistent identity, with explicit execution strategies, a container-first runtime model, and an incremental implementation path.

## 1. Decisions and assumptions

### Confirmed product decisions

- Aira Gatse is one product, one runtime identity, and one acting system.
- Aira Gatse is container-first and is expected to run as a Dockerized self-hosted service; Docker is the supported deployment baseline.
- Aira is its short name. Aira and Gatse are not separate actors or autonomous subsystems.
- The transition from Estagiária to Aira Gatse is a conceptual and product evolution.
- Estagiária remains an origin reference and mention-based Easter egg; its old behavior is not an immutable specification.
- Multiple personas are not a current requirement. No persona registry, selection mechanism, or mandatory persona entity is needed.
- Gatse V combines multiple remote cognitive executors for genuinely complex tasks.
- Gatse Special integrates with our other independent applications.

### Proposed initial operating defaults

These defaults make the implementation plan concrete without implying that unresolved product choices have been approved:

- One modular service and one configured product identity.
- One application container for the initial runtime, with persistent data/config mounted outside the container image.
- Discord as the first channel; a second channel to validate independence before broad expansion.
- Explicit invocation in enabled conversations; autonomous participation is deferred.
- Bounded conversation history before deliberate long-term memory.
- Gatse I first, then Gatse III; other Styles are implemented when their use cases justify them.
- Exact commands, voice, Easter egg response, retention periods, budget values, deployment database, and second channel remain implementation decisions to close before their dependent features ship.

## 2. Product definition and naming

**Aira Gatse is a self-hosted runtime for a persistent digital identity that can converse, retain authorized context, execute commands, and use controlled capabilities across multiple channels.**

The supported deployment baseline is **Docker**. Aira Gatse should be distributable as a container image and runnable without installing language runtimes or application dependencies directly on the host.

Discord, Owncast, Twitch, YouTube, WhatsApp, and Web are channel providers. They do not define the product.

Naming origin:

```text
ESTAGIARIA → AIRAIGATSE → AIRA [I] GATSE → AIRA GATSE
                                  Identity
```

The historical name informs the product's origin. It does not impose a permanent personality, wording, command catalog, or compatibility obligation.

Product principle:

> One identity. Many presences. Multiple execution styles.

## 3. Identity and behavior

The application owns its identity and behavior independently from channel accounts and AI vendors.

```text
Aira Gatse
├── Identity: stable ID, canonical name, optional aliases
├── Behavior: voice, response guidance, templates, origin references
├── Policies: participation, memory access, authorization, execution limits
└── Channel accounts: manifestations of the same identity
```

Behavior is versioned product configuration and content. It can evolve without changing the identity's stable ID. It must not contain infrastructure credentials or vendor-specific orchestration.

No `personaId`, active-persona selector, or `personas/estagiaria/` hierarchy is required. Behavior should stay cohesive enough to extract later if a real requirement emerges; hypothetical multiple-persona support must not drive today's schema.

### 3.1 Estagiária Easter egg

Mentioning the historical name may trigger a small acknowledgment of the origin. This is an expression feature of Aira Gatse, not a persona switch.

Proposed initial behavior:

- Recognize the reference within an interaction already accepted by the participation policy.
- Acknowledge it briefly while continuing to answer the actual request.
- Do not activate a different identity, memory scope, or execution policy.
- Define matching and example responses with the behavior content before implementation.

Recognizing the word in arbitrary channel chatter does not automatically authorize a response. Broader alias-based invocation would be a separate participation setting.

### 3.2 Expression preserves execution results

Response composition applies the product's voice and channel constraints. It must preserve facts, numbers, errors, action status, and source references.

A deterministic result may use a template. A cognitive response may already be ready to send. Composition does not require a second LLM call.

## 4. Scope and boundaries

In scope:

- Normalized messages and events from enabled channels.
- Provider-scoped participants and conversations.
- Explicit participation rules and deterministic commands.
- Local and remote cognitive execution, controlled tools, and future remote executor coordination.
- Persistent conversation context, with deliberate long-term memory added separately.
- Explicit account linking with independent memory-access rules.
- Presence, health, execution diagnostics, and a later administrative UI.
- Intentional integrations with our independent applications through Gatse Special.

Out of scope:

- Streaming servers, multi-stream relays, and automatic chat mirroring.
- Generic social dashboards or unrelated workflow automation.
- Hosting other projects' internals or sharing their databases and domain models.
- A requirement to process every message with AI.
- A multiple-persona platform without a concrete product need.
- Implementing every channel and Style in the initial release.

## 5. Runtime and domain contracts

The initial architecture is a modular service. Modules separate responsibilities within Aira Gatse; their names do not create independent product actors.

```text
Channel event
  → Channel adapter
  → Normalized event
  → Participant resolution and participation policy
  → Authorized conversation context
  → Intent routing and execution policy
  → Style selection and execution
  → Response composition
  → Originating conversation through its adapter
```

### 5.1 Participants and conversations

- Participants are scoped by provider and the provider's native account scope where necessary.
- Equal display names never establish that two accounts belong to the same person.
- Conversations include provider/account scope and a native conversation reference to prevent collisions.
- Conversation metadata distinguishes public/group/private contexts and reply or thread boundaries where relevant.
- Product channel accounts and external participant accounts are different concepts.

### 5.2 Normalized input

Conceptual contract; concrete types are established during foundation work:

```ts
type IncomingMessage = {
  eventId: string;
  sourceMessageId: string;
  providerId: string;
  providerAccountId: string;
  conversationId: string;
  participantId: string;
  actorKind: 'human' | 'automation';
  conversationKind: 'group' | 'direct';
  invocation: 'explicit' | 'ambient';
  permissions: string[];
  input:
    | { type: 'conversation'; text: string }
    | { type: 'command'; name: string; args: Record<string, unknown> };
  receivedAt: string;
};
```

Each provider defines its own invocation interface. Adapters translate native syntax into `invocation` and explicit `command` or `conversation` input. Discord slash commands request commands; mentions request conversation. The engine never reinterprets conversation text as a deterministic command, even when that text is a command name.

The gateway validates and admits normalized events. Routing selects Gatse I for command requests. Conversation currently returns an explicit cognitive-capability-unavailable result with no selected Style, because cognitive Styles are not yet implemented. Future cognitive routing must use capabilities and policies rather than channel syntax. Structured commands do not bypass participation, argument validation, or authorization.

`permissions` is supplied by a trusted adapter/application policy, never extracted from user text or arguments. Current builtins are public, and the Discord adapter supplies no permission grants. Metadata for attachments, replies, and additional conversation types can be added to this contract when supported.

The adapter translates SDK objects, verifies inbound authenticity where supported, and supplies normalized references. Raw payloads and secrets do not travel through the domain.

### 5.3 Channel adapter

The contract covers lifecycle, normalized event ingestion, message delivery, health, and capabilities. An event callback or equivalent input port must be part of the actual implementation, not only `sendMessage`.

Capabilities describe replies, edits, threads, media, mentions, and other supported operations. The core checks capabilities; the adapter handles native formatting, length limits, and delivery errors. Missing optional capabilities have an explicit fallback.

Presence describes Aira Gatse's connection/readiness on a channel, not whether an unrelated live stream is online.

## 6. Participation and authorization

Participation is evaluated before cognitive interpretation or expensive context loading.

Proposed baseline:

- Ignore bot/self events and duplicate deliveries.
- In Discord guild conversations, accept explicit mentions and supported commands wherever Discord permissions allow the bot to receive and respond. Aira Gatse does not maintain a separate Discord channel allowlist.
- Direct messages and replies to Aira Gatse are independently configurable triggers; do not assume they are enabled.
- An accepted interaction can still be denied an operation by authorization policy.
- Administrative commands require explicit normalized permission checks.
- Rate limits and per-conversation admission limits bound accepted work.

Channel permissions inform the normalized authorization context. Neither model output nor instructions embedded in messages, retrieved documents, or tool results can grant permissions.

## 7. Gatse Styles

Styles describe how Aira Gatse fulfills work. They are not identities, independent engines, model rankings, or an automatic escalation ladder.

| Style | Definition | Typical use |
| --- | --- | --- |
| Gatse I — Deterministic | Known execution without an LLM | Commands, status, structured lookups, predefined operations |
| Gatse II — Local Cognitive | One local cognitive executor without tool augmentation | Conversation or transformation suitable for the configured local executor |
| Gatse III — Remote Cognitive | One remote cognitive executor without tool augmentation | Conversation, reasoning, or generation through a configured remote service |
| Gatse IV — Augmented | Cognitive execution combined with controlled tools | Search, external data, bounded multi-step tool use |
| Gatse V — Coordinated Remote | Coordinated use of at least two remote cognitive executors on the same complex task | Decomposition, independent analysis, critique, and synthesis |
| Gatse Special — Application Integration | An intentional integration with another application of ours through its public contract | An authorized query or action in Warden, Raven, or a future owned application |

### 7.1 Gatse I

Commands and predefined operations do not need AI. A deterministic operation may call an external API through a controlled capability while remaining Gatse I, except when the operation is an owned-application integration classified as Special.

Tools/capabilities share validation, authorization, logging, and retry policies regardless of whether a model requested them.

### 7.2 Gatse II and III

Local versus remote describes execution location, not guaranteed quality. Capabilities, availability, data policy, latency, and budget determine eligibility.

A remote executor is not inherently stronger than a local executor. Changing vendor or model changes an adapter or configuration, not product identity.

### 7.3 Gatse IV

The cognitive executor may be local or remote. The defining feature is controlled tool augmentation.

Tool names, schemas, results, and call limits are explicit. Execution supports bounded tool cycles and multiple requested calls rather than assuming a single call always completes the task.

### 7.4 Gatse V

Gatse V coordinates multiple remote cognitive executors when a concrete task benefits from that composition. Ordinary retries, repeated calls to one executor, and sequential provider fallback do not qualify by themselves.

Executors may use different models or vendors, but vendor diversity is not mandatory. They have explicit assignments and identifiable contributions. Aira Gatse owns orchestration and the final response.

Before execution, the plan defines:

- Why one executor is insufficient and what each executor contributes.
- Sequential or parallel dependencies, bounded fan-out, and a total step limit.
- A shared cost budget and deadline across all child executions, including synthesis.
- What context each executor may receive.
- How partial failure, cancellation, disagreement, and synthesis are handled.

Agreement between models is not proof of correctness. The final result must preserve material uncertainty and source evidence. No recursive spawning or unbounded debate is allowed.

Tools remain subject to the same policies when used by child executions. Gatse V stays disabled until a representative complex task demonstrates a useful improvement over a single executor under an explicit quality/cost/latency evaluation.

### 7.5 Gatse Special

Special identifies integration with our other applications. It is outside the numeric sequence and does not mean a higher intelligence level or greater privileges.

```text
Aira Gatse
  → Gatse Special integration adapter
  → Versioned external API/contract
  → Independent application authorizes and executes
  → Structured result returns to Aira Gatse
```

Rules:

- No direct imports of application internals, shared databases, or hidden runtime dependencies.
- The target application remains authoritative over its own domain and authorization.
- Each integration declares supported operations, credentials/scopes, input/output schemas, deadlines, and error semantics.
- Writes require an explicit authorization policy and idempotency support or a defined reconciliation strategy before retries.
- Special can be fully deterministic; cognitive interpretation is optional and cannot expand permissions.
- Warden and Raven are examples, not implementation commitments or evidence that suitable APIs already exist.
- Do not modify another project merely to manufacture an integration use case.

Generic third-party tools do not become Special just because they are external services. Remote model providers belong to cognitive execution, not Special.

### 7.6 Selection and composition

Select the least complex sufficient execution permitted by capability, privacy, authorization, and budget constraints. Numeric order is not the selection algorithm.

Record Style, executor, tools, and policy decisions separately. A simple status command stays I; one model with search is IV; coordinated remote analysis is V; a request owned by one of our applications is Special.

When strategies compose, retain a parent execution with explicit child steps and their Styles. For example, a V analysis may request a Special operation only if separately authorized. If a conversation discovers that a tool or integration is needed, log the transition and recheck policies before dispatch.

Failure does not automatically permit sending local/private context to a remote provider or escalating into V or Special.

## 8. Commands, executors, and capabilities

Commands expose provider-independent names, arguments, permission requirements, and structured results. Their contexts contain normalized participant and conversation references, not SDK interaction objects.

Cognitive executors share an interface for normalized inputs, outputs, capability declarations, usage, cancellation, and errors. Local/remote is executor metadata; adapter-specific features stay behind that boundary.

Each controlled capability declares:

- Name, description, input and output schemas.
- Required authorization and allowed context/data scope.
- Side effects, privilege requirements, and execution target as separate attributes.
- Timeout, retry eligibility, and idempotency semantics.

Delegation is a target/ownership property, not a side-effect class: a Special query may be read-only, while another Special operation may write data. Reversibility and privilege must also not be assumed equivalent.

No executor receives unrestricted shell, filesystem, Docker, network, or infrastructure access by default.

## 9. Memory and persistence

### 9.1 Conversation context — initial scope

- Persist a bounded history of accepted interactions and responses, with participant attribution.
- Isolate context by conversation and enforce visibility when retrieving it.
- Do not use a vendor thread/conversation ID as the application's only source of history.
- Define retention and context-window limits explicitly before enabling persisted conversation in deployment.
- Support clearing a conversation's retained context with an authorized operation.

### 9.2 Deliberate long-term memory — later scope

Long-term facts require a deliberate capture policy, provenance, visibility scope, correction/deletion behavior, and retention rules. Model-generated summaries are derived context, not automatically verified facts.

Explicit account linking may establish a participant relationship across channels. It does not authorize moving private messages or facts into public conversations. Linking and memory access are independently auditable decisions.

### 9.3 Operational persistence

Before cognitive conversation, establish storage for participant/conversation references, bounded history, execution/delivery metadata, and deduplication records.

Behavior and static configuration can remain versioned files. Observed provider presence is runtime state and must be refreshed after startup. Configuration ownership must be explicit; avoid conflicting database and file copies.

Use repository interfaces at domain boundaries and a database suitable for the initial single-node deployment. Choose the concrete database during foundation work. Include migrations, backup/restore, and retention cleanup in the operational plan.

Secrets belong in the configured secrets/environment mechanism, not plaintext domain records, normalized events, or history.

## 10. Execution and delivery reliability

- Serialize state-changing conversation processing per conversation in the initial runtime; independent conversations may proceed concurrently under global limits.
- Deduplicate using provider/account/conversation/source-message scope, not the generated request ID.
- Bound queues, execution duration, tool cycles, retries, and total cost.
- Retry only eligible transient failures; do not blindly repeat side effects or uncertain sends.
- Track execution outcome separately from response delivery outcome.
- Persist enough state to recognize incomplete work after restart and report or reconcile it without automatically repeating completed actions.
- Treat an uncertain external write outcome as unknown until reconciled, not as confirmed failure or success.
- Cancel or expire work when its budget/deadline is exhausted; account for child work in V.

Exactly-once delivery across arbitrary providers is not assumed. Where a provider cannot deduplicate sends, document the recovery tradeoff and avoid claiming a guarantee the adapter cannot enforce.

## 11. Observability, health, and administration

Structured execution records include request/parent/step IDs, provider and conversation references, intent, selected Style and transitions, executor, tools/integration, duration, usage/cost when available, status, and normalized error code.

Do not indiscriminately log private message text, search queries, sensitive tool results, credentials, or raw SDK payloads.

Health distinguishes the application, channel providers, cognitive executors, and implemented integrations. A remote executor failure should degrade cognitive capability while deterministic commands remain available where possible.

Start with structured logs and health endpoints. Administrative APIs require authentication. A later UI can show identity/behavior version, presence, recent executions, Style usage, and failures. Runtime operation must not require the UI.

## 13. Container and deployment model

Docker is part of the supported runtime contract, not an optional packaging detail.

### 12.1 Initial topology

The initial deployment should remain intentionally small:

```text
Unraid / Docker host
└── aira-gatse
    ├── application runtime
    ├── channel adapters
    ├── execution / Gatse Styles
    ├── health/API surface
    └── mounted persistent state
```

A separate database container may be introduced only if the selected persistence technology requires it or a concrete operational need justifies it. Do not split the application into multiple services merely to imitate a distributed architecture.

### 12.2 Container image

The application must have a reproducible image build.

The image should:

- use a pinned, supported runtime base;
- install only production dependencies in the runtime stage;
- prefer a multi-stage build where it materially reduces image size or build/runtime coupling;
- run as a non-root user when feasible;
- expose only documented application ports;
- contain no credentials, tokens, local development state, or persistent conversation data;
- define a deterministic startup command;
- terminate cleanly on container stop/restart signals.

Do not require interactive setup inside a running container.

### 12.3 Persistence

Container replacement, image upgrade, or recreation must not destroy required application state.

Persistent data must live outside the immutable image through explicit mounts/volumes.

At minimum, the deployment design must identify storage for:

- database/state files when using embedded persistence;
- migrations;
- retained conversation context;
- execution/deduplication/recovery metadata;
- optional generated operational state that must survive recreation.

Versioned behavior and static configuration may remain in the image when they are part of the released product version. Environment-specific configuration and secrets must not.

The exact Unraid host path is a deployment choice and must not be hardcoded into application code.

### 12.4 Configuration and secrets

Runtime configuration is supplied explicitly through validated environment variables and/or mounted configuration files.

Rules:

- no secrets committed to the repository;
- no secrets baked into the image;
- disabled capabilities do not require their credentials;
- startup validation reports missing configuration with actionable errors;
- provider/model credentials are scoped to the minimum required permissions;
- secret values must not appear in ordinary logs or health responses.

### 12.5 Networking

The container must not assume a specific Docker network name, host IP, reverse proxy, or public domain.

Provider callbacks, webhooks, and administration endpoints bind through documented configuration.

Only required ports should be published. Outbound provider/API connections should use normal container networking unless a future deployment requirement explicitly defines otherwise.

Reverse proxy, TLS termination, Cloudflare Tunnel, VPN routing, or Unraid-specific ingress remain deployment/infrastructure concerns outside the Aira Gatse domain.

### 12.6 Health and lifecycle

The container must expose a lightweight application health endpoint suitable for Docker/Unraid health checks.

Health should distinguish:

- application/runtime ready;
- provider degraded/offline;
- cognitive executor degraded/offline;
- optional integration degraded/offline.

A failure of a remote provider or cognitive executor must not necessarily mark the entire container unhealthy if the application can continue serving deterministic capabilities.

Startup and shutdown must support:

- database migration/checks before accepting work;
- provider connection initialization;
- graceful cancellation or bounded shutdown of active work;
- clean provider disconnect where supported;
- recovery metadata sufficient to inspect unfinished/uncertain work after restart.

### 12.7 Logging

Application logs go to stdout/stderr in structured form so Docker/Unraid can collect them.

Do not make host-mounted log files a runtime requirement.

Sensitive message content, credentials, raw provider payloads, and private tool results must not be logged indiscriminately.

### 12.8 Image/version lifecycle

Application version and image version should be identifiable at runtime.

Upgrades should follow:

```text
pull/build new image
  → stop/recreate container
  → run/verify migrations
  → health check
  → resume provider connectivity
```

Rollback expectations must be documented whenever a database migration is not backward compatible.

### 12.9 Development parity

Local development may run outside Docker for speed, but the container remains the deployment reference.

Before a milestone is considered deployable, its acceptance path must also succeed through the Docker image, not only through a host-installed development runtime.

### 12.10 Unraid baseline

The intended first production-like environment is Unraid.

The repository should eventually provide the information needed to create or maintain an Unraid template, including:

- image/repository;
- application port(s);
- persistent data mount(s);
- required and optional environment variables;
- health endpoint;
- expected restart policy;
- optional provider-specific settings.

The core application must remain standard Docker and must not depend on Unraid-specific APIs or filesystem conventions.


## 12. Configuration

Conceptual example for the first cognitive milestone, not a required configuration schema:

```yaml
airaGatse:
  name: Aira Gatse
  shortName: Aira
  behavior: default

execution:
  styleI:
    enabled: true
  styleII:
    enabled: false
  styleIII:
    enabled: true
    executor: primaryRemote
  styleIV:
    enabled: false
  styleV:
    enabled: false
  special:
    enabled: false

providers:
  discord:
    enabled: true
  owncast:
    enabled: false
```

`behavior` refers to the single product's behavior configuration, not a persona selector. Executor details, participation settings, budgets, and retention settings must be explicitly validated in the actual schema.

Validate enabled capabilities and their required credentials at startup, with actionable errors. Disabled capabilities must not require credentials. Runtime outages are handled as capability degradation according to policy.

## 14. Source organization

```text
src/
├── main.js
├── core/
│   ├── gatse-engine/
│   │   ├── contracts/              # shared input, context, result, output port
│   │   ├── gateway/                # input validation and admission
│   │   ├── routing/                # participation policy and Style selection
│   │   ├── runtime.js              # execution, limits and delivery lifecycle
│   │   └── gatse-styles/
│   │       └── gatse-i/
│   │           ├── execute.js
│   │           └── commands/
│   │               ├── registry.js
│   │               ├── helpers/
│   │               └── builtins/
│   └── infrastructure/
│       ├── config/
│       ├── api/
│       └── log/
└── providers/
    └── discord/
        ├── index.js                # connection, transport and native lifecycle
        ├── register-commands.js    # explicit slash command publication operation
        └── interface/
            ├── incoming.js
            ├── outgoing.js
            ├── commands.js
            └── index.js
```

### Provider interfaces

Every implemented provider must have its own `interface/` directory defining native invocation, normalized input, and output rendering. It is the provider's user-facing protocol boundary, not a separate Web UI. Directory internals may vary with the provider's actual capabilities.

The Discord interface maps slash commands to command requests, and mentions to conversation requests. Native command declarations, mention syntax, interaction acknowledgments, reply tokens, formatting, and channel delivery constraints stay inside the provider. The core receives none of those native objects or credentials. The provider can change its invocation UI without changing command implementations.

### Engine boundaries

`gateway` is the actual normalized entry point used by adapters. It validates event contracts, checks provider scope, applies participation policy, and sends admitted requests with a selected route to the runtime. It does not connect to Discord or host an HTTP server.

`routing` selects a Style from the already explicit request kind and application policy. `runtime` owns admission capacity, deduplication, execution context, result recording, and delivery. Shared contracts are siblings of these modules because they apply across the engine, not only at its input boundary.

`gatse-styles/gatse-i` owns deterministic execution and its commands. Each future Style is added alongside it only when implemented. A Style uses shared engine contracts but does not import providers, gateway, router, or another Style's internals. A command used as an invocation method can request other Styles; that does not make the resulting capability part of Gatse I.

### Commands and helpers

Commands accept `{ args, context }` and return `{ status, data, text }`. Their context contains participant identity, trusted permissions, product identity, runtime state, and a visible command catalog where needed. It contains no transport, SDK message, reply method, or destination. Every builtin must execute in tests without a provider or runtime bootstrap.

The registry resolves command names and aliases. Builtins are deployment-managed code; they are not editable through the future UI. Their helper directory contains definition validation, argument/permission checks, result construction, and plain-text formatting. Native channel formatting is never a command helper.

Add `gatse-i/commands/custom/` when configurable deterministic commands are implemented. Their definitions are persisted data, not generated source files. They share command lookup and validation, with collision protection for builtin names/aliases and authorization for edits.

There is no presentation subsystem. Identity belongs to product configuration. The `about` command exposes the product name, current application version, and repository. The Estagiária origin remains available as a future Easter egg, without being tied to this command. Response composition helpers remain with the deterministic commands that use them.

### Delivery and infrastructure

The runtime sends `{ providerAccountId, conversationId, replyTo?, result }` through the provider output port and respects declared reply capability. The adapter renders and delivers the result. Discord keeps interaction state locally, acknowledges slash requests, and edits the deferred response; it does not pass interaction tokens into the engine or resend uncertain deliveries.

`main.js` constructs the provider, runtime, and gateway, then attaches the gateway as the provider's normalized input receiver. `core/infrastructure` supplies configuration, API transport, and logging. Future persistence belongs there as well.

Add `integrations/` alongside `providers/` for implemented Gatse Special adapters. Create no empty Style trees, speculative custom-command implementation, or generic presentation framework.

## 15. Migration and implementation sequence

Preserve Git history and useful product ideas. The legacy implementation is reference material, not a requirement to preserve old behavior or internal architecture.

The inspected legacy code centralizes Discord, remote conversation, polling, and search in `index.js`. Its local phrase catalog is not connected to that flow, and a modular command engine must be established rather than assumed to exist. Recover useful behavior examples if available; do not block the new identity on reproducing the old remote prompt.

The legacy Assistants integration must be replaced rather than treated as a working prerequisite for migration. The prior review confirmed its retirement in the [official migration guide](https://developers.openai.com/api/docs/assistants/migration). Concrete executor selection and API implementation are validated during that milestone.

### 15.1 Near-term delivery

The next implementation sequence is SQLite persistence, custom Gatse I commands, and an authenticated Web UI. SQLite owns custom command definitions and later operational state through versioned migrations in a mounted Docker volume. Custom commands use the same registry, validation, routing, and response contracts as builtins, while builtin definitions remain release-managed source code. The Web UI manages persisted custom commands and exposes selected runtime information through an authenticated application service/API; it does not access the database or provider SDKs directly.

| Milestone | Deliverable | Acceptance evidence |
| --- | --- | --- |
| A — Product foundation | Runtime/tooling baseline, Docker image/container contract, identity/behavior content, participation defaults, normalized contracts, Discord adapter, initial Gatse I commands | An accepted command produces an Aira Gatse response without AI credentials both in development and from the built container; ignored/unauthorized input is handled correctly |
| B — State and reliability | SQLite, migrations, mounted persistence, bounded history, participant scopes, ordering, deduplication, execution/delivery tracking | Container recreation/restart preserves retained context and required operational state; simultaneous messages remain ordered; duplicate input does not rerun completed work; context does not cross conversations |
| C — Gatse III | One remote executor adapter, product-owned context, deadlines and budgets, graceful failure | Cognitive conversation works; executor outage preserves deterministic commands; behavior is configured outside vendor code |
| D — Second channel | One real additional provider, selected for actual use | Reuses commands, behavior, routing, and storage contracts without duplicating domain logic; replies stay at origin |
| E — Gatse IV | Controlled tool registry and one search implementation with source references | Schema/authorization failures are handled; tool cycles terminate; failures and sources are represented correctly |
| F — Deliberate memory | Explicit capture, provenance, deletion, optional verified account linking | Linking does not leak private context; correction/deletion and retention policies are demonstrable |
| G — Optional capabilities | Gatse II, UI, additional channels, Gatse V, or Gatse Special according to a concrete need | Each capability meets its own scope, authorization, and operational criteria before enablement |

Milestone G is a set of independent extensions, not a mandatory sequence. Special does not depend on V. V does not depend on Special or on a local executor.

Before implementing V, define a representative complex task and compare the coordinated approach with a single executor. Before implementing Special, choose one application and one operation backed by a stable, authorized contract.

Owncast remains a possible second channel; this document does not establish that it is currently available or selected.

## 16. Review criteria

1. One product and one acting identity; internal execution roles do not become product personas.
2. Identity and behavior evolve independently from providers and models.
3. Estagiária is an origin reference/Easter egg, not an immutable persona contract.
4. No multiple-persona infrastructure without an actual requirement.
5. Styles are explicit strategies; select sufficient permitted execution instead of escalating by number.
6. V coordinates multiple remote cognitive executors; Special integrates with our independent applications.
7. Tools and integrations remain schema-validated, permissioned, bounded, and observable across Styles.
8. Provider SDKs and vendor orchestration stay behind adapters.
9. Memory retrieval respects visibility independently from identity linking.
10. Execution completion and response delivery are separate states.
11. External applications retain domain ownership and authorization; no shared internals.
12. Preserve factual execution results when composing product expression.
13. Docker is the supported deployment baseline; required state survives container recreation and secrets never live in the image.
14. Implement in complete, testable increments; do not create speculative frameworks or empty modules.

## 17. Changes from v3

- Made Docker the supported deployment baseline instead of leaving runtime packaging implicit.
- Defined the initial one-container topology and explicitly rejected premature service splitting.
- Added image, persistence, secrets, networking, health, lifecycle, logging, versioning, and rollback expectations.
- Clarified that Unraid is the intended first production-like host while the application remains standard Docker.
- Added container recreation and image execution to milestone acceptance criteria.
- Preserved all v3 product, identity, behavior, Gatse Style, memory, reliability, and provider decisions unchanged.
