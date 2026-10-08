#!/usr/bin/env bash
set -euo pipefail
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set=server_user="$SERVER_DATABASE_USER" --set=server_password="$SERVER_DATABASE_PASSWORD" \
  --set=server_database="$SERVER_DATABASE" --set=admin_user="$ADMIN_DATABASE_USER" \
  --set=admin_password="$ADMIN_DATABASE_PASSWORD" --set=admin_database="$ADMIN_DATABASE" \
  --set=ON_ERROR_STOP=1 <<'SQL'
CREATE ROLE :"server_user" LOGIN PASSWORD :'server_password';
CREATE DATABASE :"server_database" OWNER :"server_user";
REVOKE ALL ON DATABASE :"server_database" FROM PUBLIC;
CREATE ROLE :"admin_user" LOGIN PASSWORD :'admin_password';
CREATE DATABASE :"admin_database" OWNER :"admin_user";
REVOKE ALL ON DATABASE :"admin_database" FROM PUBLIC;
SQL
