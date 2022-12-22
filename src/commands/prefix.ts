import { ApplicationCommandOptionType } from "discord.js";
import { Command, CommandType, Settings } from "..";
import prefixModel from "../Models/prefix.model";

export const command = (settings: Settings) => {
  return {
    names: ["prefix"],
    description: "Change the prefix of the server.",
    type: CommandType.Both,
    options: [
      {
        name: "prefix",
        description: "The new prefix for the server.",
        type: ApplicationCommandOptionType.String,
      },
    ],
    async execute({ message, args, instance, client }) {
      if (args?.length === 0) {
        const res = await prefixModel.findOne({ guildId: message?.guild?.id });
        return `The prefix for this server is \`${
          res?.prefix || instance.settings.bot.prefix
        }\``;
      }

      await prefixModel.findOneAndUpdate(
        {
          guildId: message?.guild?.id,
        },
        {
          prefix: args![0],
        },
        { upsert: true }
      );

      client.cache.prefixes.set(message?.guild?.id!, args![0] as string);

      return `The prefix for this server has been changed to \`${args![0]}\``;
    },
    ...settings.defaultCommands?.prefix,
  } as Command;
};
