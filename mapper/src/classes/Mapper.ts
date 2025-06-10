import ITableJoinsInfo from '@interfaces/table-joins-info';
import sequelize from '@/postgres';
import logger from '@lib/logger';

export default class Mapper {
	//    - `FROM\s+` - ищем ключевое слово FROM и один или более пробелов после него.
	//    - `("([^"]+)"|\S+)` - это основная группа для захвата имени таблицы.
	//      - `"` - ищет открывающую кавычку.
	//      - `([^"]+)` - захватывает любые символы, кроме закрывающей кавычки (это наша цель, если имя в кавычках).
	//      - `"|` - или
	//      - `\S+` - ищет любую последовательность непробельных символов (для имен без кавычек).
	//    - `/i` - флаг для регистронезависимого поиска (FROM, from, From).
	fromRegex = /FROM\s+("([^"]+)"|\S+)/i;
	//    - `JOIN\s+` - ищет ключевое слово JOIN и пробелы. Сюда попадут INNER JOIN, LEFT JOIN и т.д.
	//    - Группа для захвата имени таблицы такая же, как и для FROM.
	//    - `/gi` - флаги для глобального (найти все вхождения) и регистронезависимого поиска.
	joinRegex = /JOIN\s+("([^"]+)"|\S+)/gi;
	
	constructor(fromRegex?: RegExp, joinRegex?: RegExp) {
		this.fromRegex = fromRegex || this.fromRegex;
		this.joinRegex = joinRegex || this.joinRegex;
	}
	
	
	#cleanTableName(name: string): string {
		return name.replace(/"/g, '');
	}
	
	/**
	 * Анализирует строку SQL-запроса для определения основной и присоединенных таблиц.
	 * @param sql - Строка с SQL-запросом.
	 * @returns - Объект с основной таблицей и списком уникальных присоединенных таблиц.
	 */
	parseLog(sql: string): ITableJoinsInfo | null {
		const result: ITableJoinsInfo = {
			tableName: null,
			joinedTables: [],
			joinedTablesCount: null,
			source: null
		};
		
		const fromMatch = sql.match(this.fromRegex);
		
		if (fromMatch) result.tableName = this.#cleanTableName(fromMatch[1]);
		
		if (!result.tableName) {
			logger.error(`[Mapper][parseLog] Не удалось найти основную таблицу в SQL-запросе: ${sql}`);
			return null;
		}
		
		// Поиск всех присоединенных таблиц
		const joinMatches = sql.matchAll(this.joinRegex);
		
		const tables = new Set<string>();
		
		for (const match of joinMatches) {
			const tableName = this.#cleanTableName(match[1]);
			tables.add(tableName);
		}
		
		Object.assign(result, {
			joinedTables: Array.from(tables),
			joinedTablesCount: tables.size,
			source: sql
		});
		
		return result;
	}
	
	async processLogs(sqlQueries: string[]) {
		const parsedData: ITableJoinsInfo[] = [];
		
		for (const query of sqlQueries) {
			const parsedQuery = this.parseLog(query);
			
			if (parsedQuery) parsedData.push(parsedQuery);
		}
		
		await sequelize.models.Query.bulkCreate(parsedData as any[]);
	}
	
}