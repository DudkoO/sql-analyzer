import importer from '@alohateam/importer';
import path from 'path';
import { ModelCtor, Model } from 'sequelize-typescript';

type ModelsType = {
	[key: string]: ModelCtor<Model<any, any>>;
};

// Загружаем модули
const rawModules = importer({
	dirname: path.resolve(__dirname),
	filter: /[^index](.+)\.(t|j)s$/,
	recursive: false,
	resolve: (module) => module.content
});

// Теперь вытаскиваем значения из всех { ModelName: ModelClass } объектов
const models = rawModules
	.map((mod) => Object.values(mod)) // получаем массив моделей из каждого объекта
	.flat()
	.filter(Boolean); // убираем undefined, если вдруг что-то не экспортировалось

const modelsAsObject: ModelsType = models.reduce((accumulator, currentModule) => {
	return { ...accumulator, [currentModule.name]: currentModule };
}, {});

export { models, modelsAsObject };
export default models;
