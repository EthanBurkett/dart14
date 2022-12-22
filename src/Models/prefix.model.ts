import { Schema, model } from "mongoose";

export interface Prefix {
  guildId: string;
  prefix: string;
}

export const PrefixSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, required: true },
});

export default model<Prefix>("Prefix", PrefixSchema);
