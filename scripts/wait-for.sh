#!/bin/sh

# wait until RabbitMQ is reachable
host="$1"
shift
cmd="$@"

until nc -z "$host" 5672; do
  >&2 echo "RabbitMQ is unavailable - sleeping"
  sleep 2
done

>&2 echo "RabbitMQ is up - executing command"
exec $cmd
