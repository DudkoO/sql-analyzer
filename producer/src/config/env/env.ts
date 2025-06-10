let {
	CONSOLE_LOGGING_LEVELS: consoleLoggingLevels = 'custom,info,error,warn,query',
	RABBITMQ_MESSAGE_TTL: rabbitMqDefaultMessageTtl = '120000',
	RABBITMQ_USER,
	RABBITMQ_PASS,
	RABBITMQ_HOST,
	QUEUE_NAME_GOOGLE_MAPPER = 'mapper',
	MAPPER_TASK_CHUNK_SIZE: chunkSize = '10',
	PRODUCER_API_PORT: apiPort = '3000'
} = process.env;

const CONSOLE_LOGGING_LEVELS = consoleLoggingLevels.split(',');
const RABBITMQ_MESSAGE_TTL = Number.parseInt(rabbitMqDefaultMessageTtl);
const MAPPER_TASK_CHUNK_SIZE = Number.parseInt(chunkSize);
const PRODUCER_API_PORT = Number.parseInt(apiPort);

export {
	CONSOLE_LOGGING_LEVELS,
	RABBITMQ_USER,
	RABBITMQ_PASS,
	RABBITMQ_HOST,
	RABBITMQ_MESSAGE_TTL,
	QUEUE_NAME_GOOGLE_MAPPER,
	MAPPER_TASK_CHUNK_SIZE,
	PRODUCER_API_PORT
};