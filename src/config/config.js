import { config } from "dotenv";

config();

const {
  PORT,
  MONGO_URI,
  REDIS_URI,
  ACTIVATION_SECRET,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SERVICE,
  SMTP_USER,
  SMTP_PASS,
} = process.env;

export const _config = {
  PORT,
  MONGO_URI,
  REDIS_URI,
  ACTIVATION_SECRET,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_SERVICE,
  SMTP_USER,
};
