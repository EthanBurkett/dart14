import {
  CacheType,
  ChannelType,
  Client,
  Collection,
  EmbedBuilder,
  GuildMember,
  Interaction,
  Message,
  MessageCreateOptions,
  MessagePayload,
} from "discord.js";
import DartCommands, { Command, Settings } from "..";
import lang from "./lang";

export default class CommandHandler {
  private _client: Client<boolean>;
  private _instance: DartCommands;
  private _commands: Collection<string, Command>;
  private _settings: Settings;

  constructor(client: Client<boolean>, instance: DartCommands) {
    this._client = client;
    this._instance = instance;
    this._commands = instance.commands;
    this._settings = instance.settings;

    this._client.on("messageCreate", async (message) => {
      await this._handleLegacy(message);
    });
    this._client.on("interactionCreate", async (interaction) => {
      await this._handleSlash(interaction);
    });
  }

  private async _handleSlash(interaction: Interaction<CacheType>) {
    if (!interaction.isCommand()) return;
    const { commandName, guild, channelId } = interaction;

    const member = interaction.member as GuildMember;
    let command: Command | undefined = this._commands.get(commandName);
    if (!command) return;

    if (command.type != "slash" && command.type != "both") return;

    if (command.permission) {
      if (!member.permissions.has(command.permission)) {
        const lang = this._instance.lang?.errors?.noPermission!(command);
        return this._replyFromCallback(
          lang,
          interaction,
          this._client,
          command
        );
      }
    }

    let execute = command.execute({
      message: null,
      interaction,
      args: interaction.options.data.map((option) => option.value),
      instance: this._instance,
      client: this._client,
      member: member!,
      guild: interaction.guild!,
      channel: interaction.channel!,
      author: interaction.user,
    });

    if (execute instanceof Promise) execute = await execute;

    this._replyFromCallback(execute, interaction, this._client, command);
  }

  private async _handleLegacy(message: Message<boolean>) {
    if (message.author.bot) return;
    let prefix = this._settings.bot.prefix;
    if (message.channel.type == ChannelType.DM)
      prefix = this._settings.bot.prefix;
    if (this._client.cache.prefixes.get(message.guild!.id))
      prefix = this._client.cache.prefixes.get(message.guild!.id)!;
    if (!prefix) prefix = "!";
    const MessagePrefix = message.content.trim().substring(0, prefix.length);

    if (MessagePrefix != prefix) return;

    let args = message.content.trim().substring(prefix.length).split(/ +/g);

    let command = this._commands.get(args[0]);
    if (!command) {
      command = this._commands.find((cmd) => cmd.names?.includes(args[0]));
    }
    if (!command) return;

    if (command.permission) {
      if (!message.member?.permissions.has(command.permission)) {
        const lang = this._instance.lang?.errors?.noPermission!(command);
        const reply = this._replyFromCallback(
          lang,
          message,
          this._client,
          command
        );
        return reply;
      }
    }

    if (command.type == "slash") return;

    if (
      command.testOnly &&
      !this._settings.bot.testServers?.includes(message.guild!.id)
    )
      return;

    args = args.slice(1);

    let execute = command.execute({
      args,
      client: this._client,
      interaction: null,
      instance: this._instance,
      message,
      member: message.member!,
      guild: message.guild!,
      channel: message.channel!,
      author: message.member!.user,
    });

    if (execute instanceof Promise) execute = await execute;

    this._replyFromCallback(execute, message, this._client, command);
  }

  private _replyFromCallback(
    reply: string | void | MessageCreateOptions | EmbedBuilder | MessagePayload,
    msgOrInter: any,
    client: Client<boolean>,
    command: Command
  ) {
    if (!reply) return;
    else if (reply instanceof EmbedBuilder) {
      return msgOrInter
        .reply({
          embeds: [reply],
        })
        .catch((e: any) => {
          console.log(e);
          client.error(`Failed to reply. Command: ${command.names![0]}`);
        });
    } else if (typeof reply == "string") {
      return msgOrInter.reply(reply).catch((e: any) => {
        console.log(e);
        client.error(`Failed to reply. Command: ${command.names![0]}`);
      });
    } else {
      return msgOrInter.reply(reply).catch((e: any) => {
        console.log(e);
        client.error(`Failed to reply. Command: ${command.names![0]}`);
      });
    }
  }
}
