import importer from '@alohateam/importer';
import path from 'path';
import getFileName from '@lib/service/getFileName';

const handlers = importer({
	dirname: path.resolve(__dirname),
	filter: /[^index](.+)\.js$/,
	recursive: true,
	resolve: (module) => ({
		[getFileName(module.filePath)]: module.content.default
	}),
	map: (name, filepath) => getFileName(filepath)
}).reduce((acc, handler) => Object.assign(acc, handler), {});

export default handlers;
