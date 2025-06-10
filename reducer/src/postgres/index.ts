import { Sequelize } from 'sequelize-typescript';
import databaseConfig from '@/postgres/config';
import logger from '@lib/logger';
import models from './models';

// экземпляр sequelize для работы с моделями
const sequelize = new Sequelize(databaseConfig);

if (models && models.length > 0)
	sequelize.addModels(models);
else
	console.warn('[Postgres provider] Массив конструкторов моделей пуст. Модели не были добавлены в Sequelize.');

sequelize.authenticate().then(() => {
	logger.info('[Sequelize] Connected successfully');
}).catch((error) => {
	logger.error('[Sequelize] Unable to connect to the database:', error);
	throw error;
});

export default sequelize;