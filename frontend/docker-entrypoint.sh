#!/bin/sh

# Define um valor padrão para ambiente local
export VITE_BACKEND_URL="${VITE_BACKEND_URL:-http://localhost:8092}"

# Substitui a variável no template do nginx.conf
envsubst '${VITE_BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Inicia o Nginx
exec nginx -g 'daemon off;'
