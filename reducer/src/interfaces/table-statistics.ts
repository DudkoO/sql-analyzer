interface IJoinedTableWithQueryCount {
	tableName: string;
	queryCount: number;
	percentage?: number;
}

interface IJoinedTablesWithQueryCount {
	[tableName: string]: IJoinedTableWithQueryCount;
}

interface ITableStatistics {
	totalQueries: number;
	joinedTablesWithQueryCount: IJoinedTablesWithQueryCount;
}

export default ITableStatistics;
export { IJoinedTablesWithQueryCount, IJoinedTableWithQueryCount, ITableStatistics };