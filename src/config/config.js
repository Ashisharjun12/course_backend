import { config } from "dotenv";

config();

const { PORT, MONGO_URI } = process.env;

export const _config = { PORT, MONGO_URI };
