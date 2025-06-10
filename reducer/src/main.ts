import dotenv from 'dotenv';
import 'module-alias/register';
import Reducer from '@classes/Reducer';
import http from 'http';
import { REDUCER_API_PORT } from '@config/env';

dotenv.config();

const runRecount = async () => {
	console.log('Received request. Starting statistics recount...');
	try {
		const reducer = new Reducer();
		await reducer.recountStatistics();
		console.log('Statistics recount finished successfully.');
		return 'Recount started successfully.';
	} catch (error) {
		console.error('Error during statistics recount:', error);
		return 'Failed to start recount.';
	}
};

// Создаем простой HTTP сервер
const server = http.createServer(async (req, res) => {
	// Реагируем только на POST-запросы к пути /recount
	if (req.url === '/recount' && req.method === 'POST') {
		const message = await runRecount();
		res.writeHead(200, { 'Content-Type': 'text/plain' });
		res.end(message);
	} else {
		// На все остальные запросы отвечаем ошибкой
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.end('Not Found. Use POST /recount to trigger the job.');
	}
});

// Запускаем сервер
server.listen(REDUCER_API_PORT, () => {
	console.log(`Reducer server is running inside the container on port ${REDUCER_API_PORT}`);
	console.log(`To trigger the recount, run: docker exec -it reducer curl -X POST http://localhost:${REDUCER_API_PORT}/recount`);
});