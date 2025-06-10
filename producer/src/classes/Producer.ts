import fs from 'fs';
import * as readline from 'readline';
import mapperQueue from '@lib/queues/mapper';

export default class Producer {
	/**
	 * Асинхронно читает файл и разбивает его содержимое на чанки (массивы)
	 * по заданному количеству строк.
	 *
	 * @param filePath Путь к файлу (txt, sql и т.д.).
	 * @param chunkSize Количество строк в одном чанке. По умолчанию 100.
	 * @returns Promise, который разрешается массивом чанков (массив массивов строк).
	 */
	static async getChunks(filePath: string, chunkSize: number = 100): Promise<string[][]> {
		if (!fs.existsSync(filePath))
			throw new Error(`File not found: ${filePath}`);
		
		const allChunks: string[][] = [];
		let currentChunk: string[] = [];
		
		const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
		
		const rl = readline.createInterface({
			input: fileStream,
			crlfDelay: Infinity // для корректной обработки разрывов строк
		});
		
		for await (const line of rl) {
			currentChunk.push(line);
			
			// Если текущий чанк достиг нужного размера, добавляем его в общий массив
			// и создаем новый пустой чанк.
			if (currentChunk.length === chunkSize) {
				allChunks.push(currentChunk);
				currentChunk = [];
			}
		}
		
		if (currentChunk.length > 0) allChunks.push(currentChunk);
		
		return allChunks;
	}
	
	static async processFile(filePath: string, chunkSize: number = 100): Promise<void> {
		const chunks = await this.getChunks(filePath, chunkSize);
		
		for (const chunk of chunks) await mapperQueue.sendMessage('default', chunk);
	}
}