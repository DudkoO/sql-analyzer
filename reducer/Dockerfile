FROM node:22

WORKDIR /usr/src/app

# файлы конфигурации зависимостей в рабочую директорию
COPY package*.json ./
COPY .npmrc ./

# Установка зависимостей
RUN npm install
RUN npm install typescript sequelize-cli nodemon -g

# Удаляем .npmrc после установки зависимостей, если это необходимо для безопасности
RUN rm .npmrc

# Копирование остальных файлов проекта
COPY . .

# Команда, которая будет выполняться при запуске контейнера
CMD ["nodemon", "-e", "ts", "-w", "src", "-w", "typings", "--exec", "npm", "run", "up"]
