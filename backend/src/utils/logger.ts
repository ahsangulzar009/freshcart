import fs from 'fs'
import path from 'path'

const LOG_DIR = path.join(process.cwd(), "logs")

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG"

function formatMessage(
  level: LogLevel,
  message: string,
  meta?: unknown
): string {
  const UTCTime = new Date().toISOString()
  const LocalTimestamp = new Date(UTCTime).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
  const metaStr = meta ? `| ${JSON.stringify(meta)}` : "";
  return `[UTC: ${UTCTime}] [LOCAL: ${LocalTimestamp}] [${level}] "${message}" ${metaStr}`
}

function writeToFile(level: LogLevel, content: string) {
  const date = new Date().toISOString().split("T")[0];
  const filename = path.join(LOG_DIR, `${date}-${level.toLowerCase()}.log`)
  fs.appendFileSync(filename, content + '\n')
}

export const logger = {
  info: (message: string, meta?: unknown) => {
    const formatted = formatMessage("INFO", message, meta)
    writeToFile("INFO", formatted)
  },
  warn: (message: string, meta?: unknown) => {
    const formatted = formatMessage("WARN", message, meta)
    writeToFile("WARN", formatted)
  },
  error: (message: string, meta?: unknown) => {
    const formatted = formatMessage("ERROR", message, meta)
    writeToFile("ERROR", formatted)
  },
  debug: (message: string, meta?: unknown) => {
    const formatted = formatMessage("DEBUG", message, meta)
    writeToFile("DEBUG", formatted)
  },
}

export default logger
