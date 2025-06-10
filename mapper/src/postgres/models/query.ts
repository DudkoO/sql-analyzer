import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { PostgresTable } from '@constants/tables';

@Table({
	tableName: PostgresTable.QUERIES,
	timestamps: true
})
export class Query extends Model {
	@Column({
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
		primaryKey: true
	})
	id: string;
	
	@Column({
		type: DataType.STRING,
		allowNull: false
	})
	tableName: string;
	
	@Column({
		type: DataType.JSONB,
		allowNull: false
	})
	joinedTables: string[];
	
	@Column({
		type: DataType.INTEGER,
		allowNull: false
	})
	joinedTablesCount: number;
	
	@Column({
		type: DataType.STRING,
		allowNull: false
	})
	source: string;
}