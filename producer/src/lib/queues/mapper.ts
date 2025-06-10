import { Queue, RabbitConnection } from '@alohateam/rabbit-mq-sdk';
import logger from '@lib/logger';
import {
	QUEUE_NAME_GOOGLE_MAPPER,
	RABBITMQ_HOST as host,
	RABBITMQ_USER as user,
	RABBITMQ_PASS as password,
	RABBITMQ_MESSAGE_TTL as messageTtl
} from '@config/env';

if (!QUEUE_NAME_GOOGLE_MAPPER) throw new Error('QUEUE_NAME_GOOGLE_MAPPER is required');

const queueName: string = QUEUE_NAME_GOOGLE_MAPPER.toString();

const rabbitConn = new RabbitConnection({
	connectionString: `amqp://${user}:${password}@${host}`,
	reconnectDelayMs: 5000,
	logger
});

const instance = new Queue(rabbitConn, {
	queueName, logger,
	additionalQueueArgs: { messageTtl }
});

export default instance;