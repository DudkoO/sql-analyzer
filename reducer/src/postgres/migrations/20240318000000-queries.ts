import { QueryInterface, DataTypes } from 'sequelize';
import { PostgresTable } from '@constants/tables';

module.exports = {
	async up(queryInterface: QueryInterface) {
		await queryInterface.createTable(PostgresTable.QUERIES, {
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true
			},
			tableName: {
				type: DataTypes.STRING(100),
				allowNull: false
			},
			joinedTables: DataTypes.JSONB,
			joinedTablesCount: DataTypes.INTEGER,
			source: DataTypes.TEXT,
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false
			}
		});
	},
	
	async down(queryInterface: QueryInterface) {
		await queryInterface.dropTable(PostgresTable.QUERIES);
	}
}; 