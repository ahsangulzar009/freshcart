import 'dotenv/config'
import { defineConfig } from "prisma/config";

const prismaUrl = process.env.DATABASE_URL

if(!prismaUrl) throw new Error("DB url required")

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: prismaUrl
  },
});
