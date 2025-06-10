import Reducer from './../src/classes/Reducer';
import Analyzer from '@classes/Analyzer';
import sequelize from '@/postgres';
import { Query } from '@/postgres/models/query';
import logger from '@lib/logger';
import { Transaction } from 'sequelize'; // Импортируем тип для ясности

// 👇 Создаем константу для фейкового объекта транзакции
// @ts-ignore
const mockTransactionObject: Partial<Transaction> = { id: 'mock-tx-123' };

jest.mock('@/postgres/models/query', () => ({
	Query: {
		findAll: jest.fn()
	}
}));

jest.mock('@/postgres', () => ({
	// 👇 Теперь колбэк вызывается с объектом
	transaction: jest.fn(async (callback) => callback(mockTransactionObject))
}));

jest.mock('@lib/logger', () => ({
	warn: jest.fn(),
	info: jest.fn()
}));

jest.mock('@classes/Analyzer', () => ({
	generateRecommendations: jest.fn()
}));

const mockedQueryFindAll = Query.findAll as jest.Mock;
const mockedAnalyzer = Analyzer.generateRecommendations as jest.Mock;

describe('Reducer Logic', () => {
	
	beforeEach(() => {
		jest.clearAllMocks();
	});
	
	describe('recountStatisticsForTable', () => {
		const reducer = new Reducer();
		
		test('должен правильно рассчитывать статистику для заданной таблицы', async () => {
			const mockQueries = [
				{ tableName: 'users', joinedTables: ['profiles', 'roles'] },
				{ tableName: 'users', joinedTables: ['profiles'] },
				{ tableName: 'users', joinedTables: [] }
			];
			mockedQueryFindAll.mockResolvedValue(mockQueries);
			
			// 👇 Используем объект транзакции
			const statistics = await reducer.recountStatisticsForTable('users', mockTransactionObject as Transaction);
			
			expect(statistics).not.toBeNull();
			expect(statistics?.totalQueries).toBe(3);
		});
		
		test('должен возвращать null, если запросы не найдены', async () => {
			mockedQueryFindAll.mockResolvedValue([]);
			
			// 👇 Используем объект транзакции
			const statistics = await reducer.recountStatisticsForTable('orders', mockTransactionObject as Transaction);
			
			expect(statistics).toBeNull();
			expect(logger.warn).toHaveBeenCalled();
		});
	});
	
	describe('recountStatistics', () => {
		// ... остальная часть тестов для `recountStatistics` остается без изменений,
		// так как она корректно получит `mockTransactionObject` из мока `sequelize.transaction`
		let reducer: Reducer;
		
		beforeEach(() => {
			reducer = new Reducer();
			jest.spyOn(reducer, 'getUniqueTableNames').mockResolvedValue(['users']);
			jest.spyOn(reducer, 'recountStatisticsForTable').mockResolvedValue({
				totalQueries: 1,
				joinedTablesWithQueryCount: {}
			});
		});
		
		test('должен вызвать recountStatisticsForTable с объектом транзакции', async () => {
			await reducer.recountStatistics('users');
			
			// Проверяем, что в `recountStatisticsForTable` был передан именно наш объект
			expect(reducer.recountStatisticsForTable).toHaveBeenCalledWith('users', mockTransactionObject);
		});
	});
});