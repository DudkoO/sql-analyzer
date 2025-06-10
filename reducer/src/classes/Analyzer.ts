import logger from '@lib/logger';
import ITableStatistics from '@/interfaces/table-statistics';

// Define a type for the config keys
type ConfigKeys = keyof typeof Analyzer.percentageLoadLevelConfig;

interface IRecommendation {
	loadLevel: string;
	percentage: number;
	recommendations: string[];
}

interface IRecommendations {
	[joinTableName: string]: IRecommendation;
}

export default class Analyzer {
	static percentageLoadLevelConfig = {
		0: {
			name: 'low',
			recommendations: ['Связь между таблицами используется редко. Это не является системной проблемой производительности']
		},
		30: {
			name: 'medium',
			recommendations: [
				`1.Анализировать запросы (EXPLAIN). Это ваш главный инструмент на этом этапе. Для самых частых запросов, использующих этот джойн, проанализируйте план выполнения. Убедитесь, что СУБД эффективно использует индексы и не прибегает к полному сканированию таблиц (Full Table Scan).`,
				`2.Оптимизировать индексы. Возможно, простого индекса недостаточно. Рассмотрите создание покрывающих индексов (Covering Indexes), которые включают все поля, выбираемые из присоединяемой таблицы. Это позволит СУБД брать данные только из индекса, что очень быстро.`,
				`3.Кэшировать на уровне приложения. Если данные не требуют стопроцентной актуальности, результаты часто выполняемых джойнов можно кэшировать в Redis или Memcached, чтобы снизить нагрузку на базу данных.`
			]
		},
		65: {
			name: 'high',
			recommendations: [`Рассмотрите возможность частичной денормализации или создания материализованных представлений (Materialized Views) для часто используемых джойнов. Это может значительно ускорить запросы, но потребует дополнительного места и усилий по поддержанию актуальности данных.`]
		},
		90: {
			name: 'critical',
			recommendations: [
				`Агрессивная денормализация. Рассмотрите возможность переноса всех часто используемых полей из присоединяемой таблицы. Если отношение между таблицами "один к одному", подумайте об их полном слиянии.`,
				`Пересмотр архитектуры. Такая сильная связь может указывать на то, что сущности были разделены неправильно. Возможно, с точки зрения логики приложения, это должна быть одна сущность и, соответственно, одна таблица. Этот вариант требует глубокого анализа, но может решить корень проблемы, а не ее симптомы.`
			]
		}
	};
	
	static generateRecommendations(tableName: string, statisticsByTable: ITableStatistics): void {
		const recommendations: IRecommendations = {};
		
		for (const joinedTableName in statisticsByTable.joinedTablesWithQueryCount) {
			const joinedTable = statisticsByTable.joinedTablesWithQueryCount[joinedTableName];
			const percentage = joinedTable.percentage || 0;
			
			const thresholds = Object.keys(this.percentageLoadLevelConfig)
				.map(Number)
				.sort((a, b) => b - a);
			
			for (const threshold of thresholds)
				if (percentage >= threshold) {
					const recommendationStrings = this.percentageLoadLevelConfig[threshold as ConfigKeys].recommendations;
					
					recommendations[joinedTableName] = {
						loadLevel: this.percentageLoadLevelConfig[threshold as ConfigKeys].name,
						percentage, recommendations: recommendationStrings
					};
					
					break;
				}
		}
		
		if (Object.keys(recommendations).length > 0) {
			logger.info(`[Reducer] Recommendations for table "${tableName}":`);
			console.dir(recommendations, { depth: null, colors: true });
		} else {
			logger.info('[Reducer] No recommendations generated for table:', tableName);
		}
	}
}