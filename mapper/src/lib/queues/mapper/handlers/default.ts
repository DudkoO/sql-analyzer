import logger from '@lib/logger';
import Mapper from '@classes/Mapper';

export default async (message: any) => {
	logger.info(`New message received: ${JSON.stringify(message)}`);
	
	const mapperInstance = new Mapper();
	
	const sqlQueries = message.data;
	
	await mapperInstance.processLogs(sqlQueries);
}