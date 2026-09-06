import { Client, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { normalizeMessage, normalizeInteraction, renderOutput, registerCommands, slashCommands } from './interface/index.js';

export { conversationId } from './interface/index.js';

export function createDiscordProvider({ token, log, client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  allowedMentions: { parse: [], repliedUser: false },
  rest: { timeout: 10_000, retries: 0 },
}) }) {
  let receive;
  const pending = new Set();
  const interactions = new Map();
  const commandNames = new Set(slashCommands.map(command => command.name));
  function schedule(work) {
    const task = Promise.resolve().then(work)
      .catch(() => log({ event: 'input_failed', provider: 'discord', errorCode: 'INPUT_PROCESSING_FAILED' }))
      .finally(() => pending.delete(task));
    pending.add(task);
  }
  const rejectInteraction = interaction => interaction.reply({
    content: 'Aira não pode atender este comando agora ou neste canal.', flags: MessageFlags.Ephemeral,
    allowedMentions: { parse: [], repliedUser: false },
  }).catch(() => log({ event: 'input_failed', provider: 'discord', errorCode: 'INTERACTION_REPLY_FAILED' }));

  client.on(Events.Error, () => log({ event: 'provider_error', provider: 'discord', errorCode: 'DISCORD_CLIENT_ERROR' }));
  client.on(Events.ShardError, () => log({ event: 'provider_error', provider: 'discord', errorCode: 'DISCORD_SHARD_ERROR' }));
  client.on(Events.MessageCreate, message => {
    if (!receive || !client.user || pending.size >= 32) return;
    const receiver = receive;
    schedule(() => receiver(normalizeMessage(message, client.user.id)));
  });
  client.on(Events.InteractionCreate, interaction => {
    if (!interaction.isChatInputCommand() || !commandNames.has(interaction.commandName)) return;
    if (!receive || !client.user || !interaction.guildId || interaction.user.bot || pending.size >= 32) {
      void rejectInteraction(interaction);
      return;
    }
    if (interactions.has(interaction.id)) return;
    const receiver = receive;
    const entry = { interaction, deliveryAttempted: false };
    interactions.set(interaction.id, entry);
    schedule(async () => {
      try {
        await interaction.deferReply();
        const outcome = await receiver(normalizeInteraction(interaction, client.user.id));
        if (outcome?.status === 'ignored') {
          await interaction.editReply({ content: 'Este comando não foi executado.', allowedMentions: { parse: [], repliedUser: false } });
        }
      } catch {
        if (interaction.deferred && !entry.deliveryAttempted) {
          await interaction.editReply({ content: 'Não foi possível concluir este comando.', allowedMentions: { parse: [], repliedUser: false } }).catch(() => {});
        }
        log({ event: 'input_failed', provider: 'discord', errorCode: 'INTERACTION_PROCESSING_FAILED' });
      } finally { interactions.delete(interaction.id); }
    });
  });
  return {
    id: 'discord',
    capabilities: () => ({ supportsReplies: true }),
    health: () => ({ status: client.isReady() ? 'connected' : 'disconnected' }),
    onMessage(handler) { receive = handler; },
    async connect() {
      await client.login(token);
      return { accountId: client.user.id };
    },
    async registerCommands() { await registerCommands(client.application); },
    async disconnect() {
      receive = undefined;
      await Promise.allSettled([...pending]);
      await client.destroy();
    },
    async sendMessage(input) {
      const payload = renderOutput(input);
      const prefix = `discord:${client.user?.id}:channel:`;
      if (input.providerAccountId !== client.user?.id || !input.conversationId.startsWith(prefix)) throw new Error('INVALID_DESTINATION');
      const channelId = input.conversationId.slice(prefix.length);
      const entry = interactions.get(input.replyTo);
      if (entry) {
        if (entry.interaction.channelId !== channelId) throw new Error('INVALID_DESTINATION');
        entry.deliveryAttempted = true;
        const sent = await entry.interaction.editReply(payload);
        return { messageId: sent.id };
      }
      const channel = await client.channels.fetch(channelId);
      if (!channel?.isTextBased() || typeof channel.send !== 'function') throw new Error('CHANNEL_UNAVAILABLE');
      const sent = await channel.send({
        ...payload,
        ...(input.replyTo ? { reply: { messageReference: input.replyTo, failIfNotExists: false } } : {}),
      });
      return { messageId: sent.id };
    },
  };
}
