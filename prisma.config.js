import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "telebot/prisma/schema.prisma",
  migrations: {
    path: "telebot/prisma/migrations",
  },
  datasource: {
    url: process.env.PRISMA_DATABASE_URL,
  },
});
