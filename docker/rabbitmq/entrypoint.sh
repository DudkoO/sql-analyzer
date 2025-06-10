#!/usr/bin/env sh
set -e

echo "1) Starting RabbitMQ in the background..."
docker-entrypoint.sh rabbitmq-server -detached

echo "2) Waiting for node rabbit@$(hostname) to fully start..."
rabbitmqctl wait /var/lib/rabbitmq/mnesia/rabbit@$(hostname).pid

# Проверяем, если это наш "мастер" (hostname= rabbit1)
if [ "$(hostname)" = "rabbit1" ]; then
  echo "[$(hostname)] I'm the master node. No cluster join needed."

  # -- Здесь можно создавать пользователя --
  # Проверим, нет ли уже такого пользователя:
  if rabbitmqctl list_users | grep -q "^${RABBITMQ_USER}\b"; then
    echo "User '${RABBITMQ_USER}' already exists, skipping creation."
  else
    echo "Creating user '${RABBITMQ_USER}'..."
    rabbitmqctl add_user "${RABBITMQ_USER}" "${RABBITMQ_PASS}"
    rabbitmqctl set_permissions -p / "${RABBITMQ_USER}" ".*" ".*" ".*"
    rabbitmqctl set_user_tags "${RABBITMQ_USER}" administrator
    echo "User '${RABBITMQ_USER}' created with full permissions."
  fi
else
  # Если не мастер — присоединяемся к кластеру:
  echo "[$(hostname)] Joining cluster: rabbit@rabbit1"
  rabbitmqctl stop_app
  rabbitmqctl join_cluster rabbit@rabbit1
  rabbitmqctl start_app
fi

echo "Startup complete. Container will now remain alive..."
exec tail -f /dev/null
