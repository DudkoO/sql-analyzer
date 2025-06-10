module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: {
		// Правильная конфигурация
		'^@/(.*)$': '<rootDir>/src/$1',
		'^@lib/(.*)$': '<rootDir>/src/lib/$1',
		'^@classes/(.*)$': '<rootDir>/src/classes/$1'
	},
	testMatch: [
		'<rootDir>/jest/**/*.test.ts'
	]
};