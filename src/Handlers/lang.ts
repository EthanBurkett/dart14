import {
  Colors,
  EmbedBuilder,
  MessageCreateOptions,
  MessagePayload,
} from "discord.js";
import { Command } from "..";

export interface Language {
  errors?: {
    noPermission?(
      command: Command
    ): string | EmbedBuilder | MessagePayload | MessageCreateOptions;
  };
}

export default (customLang: Language): Language => {
  return {
    errors: {
      noPermission(command: Command) {
        return new EmbedBuilder({
          title: "No Permission",
          description: `You need permission ${command.permission} to run this.`,
          color: Colors.Red,
        });
      },
    },
    ...customLang,
  };
};
