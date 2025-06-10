import 'module-alias/register';
import dotenv from 'dotenv';

dotenv.config();

import logger from '@lib/logger';
import { SequelizeOptions } from 'sequelize-typescript';
import { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } from '@config/env';
import { models } from './models';

const databaseConfig: SequelizeOptions = {
	dialect: 'postgres',
	host: POSTGRES_HOST,
	port: POSTGRES_PORT,
	username: POSTGRES_USER,
	password: POSTGRES_PASSWORD,
	database: POSTGRES_DB,
	models,
	logging: message => logger.log('query', message),
	define: { timestamps: false }
};

// это для миграций sequelize, он поддерживает только common js
module.exports = {
	local: databaseConfig,
	development: databaseConfig,
	staging: databaseConfig,
	production: databaseConfig
};
