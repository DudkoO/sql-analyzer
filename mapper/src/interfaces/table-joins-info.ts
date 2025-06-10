export default interface ITableJoinsInfo {
	tableName: string | null;
	joinedTables: string[];
	joinedTablesCount: number | null;
	source: string | null;
}