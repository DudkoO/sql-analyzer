FROM rabbitmq:3.12.7-management-alpine

# Копируем кастомный скрипт
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Меняем точку входа на наш скрипт, который в конце вызывает
# стандартный docker-entrypoint.sh, и тот уже запускает rabbitmq-server
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["rabbitmq-server"]
