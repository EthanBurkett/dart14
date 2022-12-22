import {
  ApplicationCommandData,
  ChannelType,
  Client,
  Collection,
  EmbedBuilder,
  Guild,
  GuildMember,
  PermissionFlags,
  PermissionsString,
  TextBasedChannel,
  User,
} from "discord.js";
import CommandLoader from "./Handlers/commandLoader";
import chalk from "chalk";

declare module "discord.js" {
  interface Client {
    log: (...message: any[]) => void;
    error: (...message: any[]) => void;
    cache: {
      prefixes: Collection<string, string>;
    };
  }
}

export default class DartCommands {
  private _settings: Settings;
  private _commands: Collection<string, Command>;
  private _commandLoader: CommandLoader;
  private _commandHandler: CommandHandler;
  private _lang?: Language;
  private _cache: {
    prefixes: Collection<string, string>;
  };

  constructor(settings: Settings) {
    this._settings = settings;
    this._settings.client.log = (...message: any[]) => {
      console.log(
        chalk.magentaBright.bold("Dart Commands"),
        chalk.grey.bold("»"),
        ...message
      );
    };
    this._settings.client.error = (...message: any[]) => {
      console.log(
        chalk.redBright.bold("Error"),
        chalk.grey.bold("»"),
        ...message
      );
    };

    this._lang = lang({});
    if (this._settings.languageSettings)
      this._lang = lang(this._settings.languageSettings);

    this._settings.client.cache = {
      prefixes: new Collection(),
    };
    this._cache = this._settings.client.cache;

    if (this._settings.mongo) {
      this._mongo();
      this._loadCache();
    }

    this._commandLoader = new CommandLoader(this._settings.client, settings);
    this._commands = this._commandLoader.commands;
    this._commandHandler = new CommandHandler(this._settings.client, this);

    if (this._settings.events) {
      for (const event in this._settings.events) {
        this._settings.events[event](this._settings.client, this);
      }
    }

    this._settings.client.log(
      `${this._settings.client.user?.tag} is now ready.`
    );
  }

  public get commands() {
    return this._commands;
  }

  public get settings() {
    return this._settings;
  }

  public get cache() {
    return this._settings.client.cache;
  }

  public get lang() {
    return this._lang;
  }

  private async _mongo() {
    mongoose.set("strictQuery", true);
    await mongoose
      .connect(this._settings.mongo!.uri, this._settings.mongo?.dbOptions)
      .then(() => {
        this._settings.client.log(`Connected to MongoDB.`);
      })
      .catch((e) => {
        this._settings.client.error(`Failed to connect to MongoDB: ${e}`);
        process.exit(0);
      });
  }

  private async _loadCache() {
    const prefixes = await prefixModel.find({});
    prefixes.map((prefix) => {
      this._settings.client.cache.prefixes.set(prefix.guildId, prefix.prefix);
    });
  }
}

// TYPINGS

import {
  Message,
  Interaction,
  CacheType,
  ApplicationCommandOptionData,
  Embed,
  MessagePayload,
  MessageCreateOptions,
} from "discord.js";
import mongoose from "mongoose";
import CommandHandler from "./Handlers/commandHandler";
import prefixModel from "./Models/prefix.model";
import lang, { Language } from "./Handlers/lang";

export interface CommandOptions {
  message: Message<boolean> | null;
  interaction: Interaction<CacheType> | null;
  args: (string | number | boolean | undefined)[] | undefined;
  instance: DartCommands;
  client: Client<boolean>;
  member: GuildMember;
  guild: Guild;
  channel: TextBasedChannel | null;
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
  usage?: string;
  permission?: PermissionsString;
  testOnly?: boolean;
  options?: ApplicationCommandOptionData[];
  execute(
    options: CommandOptions
  ): string | EmbedBuilder | MessagePayload | MessageCreateOptions | void;
}

export const DefaultCommands = ["prefix"];

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
