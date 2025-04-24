import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
};

const colors = {
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "blue",
};
winston.addColors(colors);

const consoleFormat = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	winston.format.colorize({ all: true }),
	winston.format.printf(
		(info) => `${info.timestamp} [${info.level}]: ${info.message}`
	)
);

const fileFormat = winston.format.combine(
	winston.format.timestamp(),
	winston.format.json()
);

const logger = winston.createLogger({
	level: process.env.environment === "development" ? "debug" : "info",
	levels,
	transports: [
		new winston.transports.Console({
			format: consoleFormat,
		}),
		new DailyRotateFile({
			filename: "logs/error-%DATE%.log",
			datePattern: "YYYY-MM-DD",
			level: "error",
			maxFiles: "30d", // Keep logs for 30 days
			format: fileFormat,
		}),

		// Daily rotating combined logs
		new DailyRotateFile({
			filename: "logs/combined-%DATE%.log",
			datePattern: "YYYY-MM-DD",
			maxFiles: "30d",
			format: fileFormat,
		}),
	],
	exceptionHandlers: [
		new winston.transports.File({ filename: "logs/exceptions.log" }),
	],
	exitOnError: false,
});

logger.stream = {
	write: (message: string) => logger.http(message.trim()),
} as any;

export default logger