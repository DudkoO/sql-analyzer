import dotenv from 'dotenv';
import 'module-alias/register';
import 'module-alias/register';
import mapperQueue from '@lib/queues/mapper';
import { connect } from '@/postgres';

dotenv.config();

const bootstrap = async () => {
	await connect();
	await mapperQueue.handle();
};

bootstrap().catch(console.error);
