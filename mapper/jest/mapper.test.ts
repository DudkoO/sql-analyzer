import Mapper from './../src/classes/Mapper'; // Импортируем класс Mapper
import sequelize from '@/postgres';
import logger from '@lib/logger';

// Мокаем зависимости ДО того, как они будут использованы в тестах
jest.mock('@/postgres', () => ({
	models: {
		Query: {
			// Создаем мок-функцию для bulkCreate
			bulkCreate: jest.fn().mockResolvedValue(true)
		}
	}
}));

// Можно также замокать логгер, чтобы он не выводил сообщения во время тестов
jest.mock('@lib/logger', () => ({
	error: jest.fn(),
	info: jest.fn()
}));


describe('Mapper Logic', () => {
	
	// Перед каждым тестом очищаем моки от предыдущих вызовов
	beforeEach(() => {
		(sequelize.models.Query.bulkCreate as jest.Mock).mockClear();
		(logger.error as jest.Mock).mockClear();
	});
	
	describe('parseLog (Unit Tests)', () => {
		const mapper = new Mapper();
		
		test('должен проанализировать простой запрос с одним FROM и одним JOIN', () => {
			const sql = 'SELECT * FROM users u JOIN profiles p ON u.id = p.user_id';
			const result = mapper.parseLog(sql);
			expect(result).toEqual({
				tableName: 'users',
				joinedTables: ['profiles'],
				joinedTablesCount: 1,
				source: sql
			});
		});
		
		test('должен анализировать имена таблиц в двойных кавычках', () => {
			const sql = 'SELECT id FROM "Users" JOIN "UserProfiles" ON Users.id = "UserProfiles".user_id';
			const result = mapper.parseLog(sql);
			expect(result).toEqual({
				tableName: 'Users',
				joinedTables: ['UserProfiles'],
				joinedTablesCount: 1,
				source: sql
			});
		});
		
		test('должен обрабатывать несколько JOIN и возвращать уникальные имена таблиц', () => {
			const sql = `
          SELECT u.name, p.title, c.comment
          FROM users u
                   LEFT JOIN posts p ON u.id = p.user_id
                   INNER JOIN comments c ON p.id = c.post_id
                   LEFT JOIN posts p2 ON u.id = p2.user_id -- Duplicate join
			`;
			const result = mapper.parseLog(sql);
			expect(result).toEqual({
				tableName: 'users',
				// `posts` должен встречаться только один раз
				joinedTables: ['posts', 'comments'],
				joinedTablesCount: 2,
				source: sql
			});
		});
		
		test('должен возвращать null, если предложение FROM не найдено', () => {
			const sql = 'SELECT * WHERE id = 1';
			const result = mapper.parseLog(sql);
			expect(result).toBeNull();
			// Проверяем, что была вызвана ошибка в логгере
			expect(logger.error).toHaveBeenCalled();
		});
	});
	
	
	// --- Модульный тест для `processLogs`, изолированный от БД ---
	describe('processLogs (Module Test)', () => {
		const mapper = new Mapper();
		
		test('должен обработать список SQL-запросов и вызвать bulkCreate с проанализированными данными', async () => {
			const sqlQueries = [
				'SELECT * FROM users JOIN profiles ON users.id = profiles.user_id',
				'SELECT * FROM orders', // Запрос без JOIN'ов
				'INVALID SQL' // Невалидный запрос, который будет отфильтрован
			];
			
			await mapper.processLogs(sqlQueries);
			
			// Проверяем, что `bulkCreate` был вызван один раз
			expect(sequelize.models.Query.bulkCreate).toHaveBeenCalledTimes(1);
			
			// Проверяем, с КАКИМИ данными был вызван `bulkCreate`
			expect(sequelize.models.Query.bulkCreate).toHaveBeenCalledWith([
				{
					tableName: 'users',
					joinedTables: ['profiles'],
					joinedTablesCount: 1,
					source: sqlQueries[0]
				},
				{
					tableName: 'orders',
					joinedTables: [],
					joinedTablesCount: 0,
					source: sqlQueries[1]
				}
			]);
		});
	});
});