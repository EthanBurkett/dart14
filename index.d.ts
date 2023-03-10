import {
  Message,
  Interaction,
  CacheType,
  ApplicationCommandOptionData,
  Embed,
  MessagePayload,
  MessageCreateOptions,
  EmbedBuilder,
  Client,
  PermissionsString,
  Collection,
  GuildMember,
  Guild,
  ChannelType,
  User,
} from "discord.js";
import mongoose from "mongoose";
import DartCommands from "./src";

export interface Language {
  errors?: {
    noPermission?(
      command: Command
    ): string | EmbedBuilder | MessagePayload | MessageCreateOptions;
  };
}

export interface CommandOptions {
  message: Message<boolean> | null;
  interaction: Interaction<CacheType> | null;
  args: (string | number | boolean | undefined)[] | undefined;
  instance: DartCommands;
  client: Client<boolean>;
  member: GuildMember;
  guild: Guild;
  channel: ChannelType;
  author: User;
}

export enum CommandType {
  Legacy = "legacy",
  Slash = "slash",
  Both = "both",
}

export interface Command {
  names?: string[] | string;
  type: CommandType;
  description: string;
  permission?: PermissionsString;
  testOnly?: boolean;
  options?: ApplicationCommandOptionData[];
  execute(
    options: CommandOptions
  ): string | EmbedBuilder | MessagePayload | MessageCreateOptions | void;
}

export interface Settings {
  client: Client<boolean>;
  bot: {
    prefix?: string;
    commandsDir: string;
    testServers?: string[];
  };
  events?: {
    [key: string]: (client: Client<boolean>, instance: DartCommands) => void;
  };
  defaultCommands?: {
    [key: string]: {
      names?: string;
      type?: CommandType;
      description?: string;
      usage?: string;
      permission?: PermissionsString;
      testOnly?: boolean;
      options?: ApplicationCommandOptionData[];
      execute?(
        options: CommandOptions
      ): string | Embed | MessagePayload | MessageCreateOptions | void;
    };
  };
  mongo?: {
    uri: string;
    dbOptions?: mongoose.ConnectOptions;
  };
  languageSettings?: Language;
}

export default class {
  constructor(settings: Settings);
  public get commands(): Collection<string, Command>;
  public get settings(): Settings;
  public get cache(): {
    commands: Collection<string, Command>;
  };
  public get lang(): Language;
}
