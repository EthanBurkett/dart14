# Dart Commands v14

Dart commands has come back and updated to discord.js v14, including new features, wayyy less bugs (we're aware the original was very buggy), everything has been fixed and optimized for your needs to quickly create bots on the fly.

## Starting your project

Dart can be used in TypeScript, TypeScript is recommended and will be used for examples throughout docs.

```ts
import DartCommands from 'dart14';
import { Client, IntentsBitFields } from "discord.js";
import path from "path";

// Events
import MyEvent from "./events/MyEvent";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", () => {
    new DartCommands({
        client,
        bot: {
            commandsDir: path.join(__dirname, "commands"),
            prefix: "!", // Optional, default is "!"
            testServers: ["your server"], // Optional: Used for commands to only be ran in certain servers
        }
        events: { // Optional
            MyEvent
        },
        defaultCommands: { // Optional: Customize what the default commands can do
            command: { // This can be any default command that ships with Dart, e.g "prefix", you can also extract this to a command file and import it.
                names: ["prefix", "p"], // Would add "p" as a command alias
                description: "Change the description if you like",
                permission: "BanMembers", // Even the permission
                execute() { // You can even change what the command does!
                    return "No prefix changing!"
                }
            }
        },
        mongo: { // Optional
            uri: "mongodb://127.0.0.1:27017/myDb",
            dbOptions: {} // Optional configuration
        },
        languageSettings: { // Optional, change what messages are sent that are unchangeable within the library, e.g. permission error messages
            errors: {
                noPermission(command) {
                    return "You don't have permission!" // Or you can return an embed
                }
            }
        }
    })
})

client.login("bot token")
```

## Creating your first command

`commands/ping.ts`

```ts
import { Command, CommandType } from 'dart14';
import { EmbedBuilder, Colors } from 'discord.js';

export default {
    description: "Returns pong!",
    type: CommandType.Both, // CommandTyoe.Legacy, CommandType.Slash
    names: ["ping", "p"], // Optional: Name of command and aliases
    permission: "Administrator",
    testOnly: true, // Optional: Can only be used in test servers
    options: [] // Optional: Used for slash commands
    execute({
        message,
        interaction,
        member,
        guild,
        instance,
        client,
        author,
        channel
    }) {
        return "Pong!";
        // Or you can reply with embeds
        return new EmbedBuilder({
            title: "Pong!",
            color: Colors.Green
        });
        // Or you can return an object!
        return {
            content: "Pong 1!",
            embeds: [
                new EmbedBuilder({
                    title: "Pong 2!",
                    color: Colors.Green
                });
            ],
            components: [your components]
        }
        // or if you'd like, return nothing
        return;
    }
} as Command
```

## Creating the event file

Events will **not** automatically load, this is due to performace. You will need to import your events in the main index file for your bot.

`events/MyEvent.ts`

```ts
import { Client, Message } from "discord.js";
import DartCommands from "dart14";

export default (client: Client<boolean>, instance: DartCommands) => {
  client.on("messageCreate", (message: Message<boolean>) => {
    console.log(message.content);
  });
};
```

## And that's it! You can now productively use DartCommands!
