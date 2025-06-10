import dotenv from 'dotenv';
import 'module-alias/register';
import Producer from '@classes/Producer';
import http from 'http';
import { MAPPER_TASK_CHUNK_SIZE, PRODUCER_API_PORT } from '@config/env';

dotenv.config();

const filePath = '/usr/src/app/src/source-data/queries.sql';

const processData = async () => {
	console.log('Received request. Starting file processing...');
	try {
		await Producer.processFile(filePath, MAPPER_TASK_CHUNK_SIZE);
		console.log('File processing finished successfully.');
		return 'Processing started successfully.';
	} catch (error) {
		console.error('Error during file processing:', error);
		return 'Failed to start processing.';
	}
};

// Создаем простой HTTP сервер
const server = http.createServer(async (req, res) => {
	// Реагируем только на запросы к определенному пути, например /process
	// На все остальные запросы отвечаем ошибкой
	if (req.url === '/process' && req.method === 'POST') {
		const message = await processData();
		res.writeHead(200, { 'Content-Type': 'text/plain' });
		res.end(message);
	} else {
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.end('Not Found. Use POST /process to trigger the job.');
	}
});

server.listen(PRODUCER_API_PORT, () => {
	console.log(`Server is running inside the container and listening on port ${PRODUCER_API_PORT}`);
	console.log(`To trigger the job, run: docker exec -it <container_name> curl -X POST http://localhost:${PRODUCER_API_PORT}/process`);
});