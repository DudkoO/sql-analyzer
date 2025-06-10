import sequelize from '@/postgres';
import { Query } from '@/postgres/models/query';
import logger from '@lib/logger';
import { Transaction } from 'sequelize';
import Analyzer from '@classes/Analyzer';
import ITableStatistics from '@/interfaces/table-statistics';

export default class Reducer {
	
	constructor() {
	}
	
	async getUniqueTableNames(): Promise<string[]> {
		const results = await Query.findAll({
			attributes: ['tableName'],
			group: ['tableName']
		});
		
		const tableNameSet = new Set(results.map(item => item.tableName));
		
		return tableNameSet.size > 0 ? Array.from(tableNameSet) : [];
	}
	
	async recountStatisticsForTable(tableName: string, transaction: Transaction): Promise<ITableStatistics | null> {
		const statistics: ITableStatistics = { totalQueries: 0, joinedTablesWithQueryCount: {} };
		
		const queries = await Query.findAll({
			where: { tableName },
			transaction
		});
		
		if (!queries || queries.length === 0) {
			logger.warn('[Reducer] [recountStatistics] No queries found for table:', tableName);
			return null;
		}
		
		for (const query of queries) {
			statistics.totalQueries += 1;
			
			for (const joinedTableName of query.joinedTables || []) {
				if (!statistics.joinedTablesWithQueryCount[joinedTableName])
					statistics.joinedTablesWithQueryCount[joinedTableName] = {
						tableName: joinedTableName,
						queryCount: 0
					};
				
				statistics.joinedTablesWithQueryCount[joinedTableName].queryCount += 1;
			}
		}
		
		for (const tableName in statistics)
			for (const joinedTableName in statistics.joinedTablesWithQueryCount)
				statistics.joinedTablesWithQueryCount[joinedTableName].percentage =
					statistics.joinedTablesWithQueryCount[joinedTableName].queryCount / statistics.totalQueries * 100;
		
		return statistics;
	}
	
	async recountStatistics(tableName?: string) {
		
		const tableNames = tableName
			? [tableName]
			: await this.getUniqueTableNames();
		
		const needRecommendations = true;
		
		return await sequelize.transaction(async transaction => {
			for (const tableName of tableNames) {
				const statistics = await this.recountStatisticsForTable(tableName, transaction);
				
				if (needRecommendations && statistics)
					Analyzer.generateRecommendations(tableName, statistics);
			}
		});
	}
	
}