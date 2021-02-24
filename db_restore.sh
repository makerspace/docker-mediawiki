#!/bin/bash
FILEPATH="$1"

set -e

if ! test -f "$FILEPATH"; then
    echo "'$FILEPATH' does not exist exists."
    exit 1
fi

read -p "This will delete the original wiki database. Are you sure you want to continue? [y/N]" -n 1 -r
echo    # (optional) move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1 # handle exits from shell or function but don't exit interactive shell
fi


echo "Restoring from $FILEPATH"
# The db dumps contain colons (:). This confuses `docker cp`. So copy the file to a temporary file first.
cp "$FILEPATH" /tmp/temp_import.sql
docker cp "/tmp/temp_import.sql" "mysql:temp_import.sql"
rm /tmp/temp_import.sql
docker exec mysql bash -c "mysql -p\${MYSQL_ROOT_PASSWORD} makerspace-wiki < temp_import.sql"
docker exec mysql bash -c "rm temp_import.sql"
