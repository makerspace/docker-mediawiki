CURRENT_TIME=`date +%FT%T+%N`
FILEPATH=/tmp/makerspace-wiki_${CURRENT_TIME}.sql
EXPORT_PATH=backup/db

mkdir -p ${EXPORT_PATH}
docker exec mysql bash -c "mysqldump -p\${MYSQL_ROOT_PASSWORD}  --create-options --complete-insert --quote-names makerspace-wiki >> ${FILEPATH}"
echo docker cp mysql:${FILEPATH} ${EXPORT_PATH}
docker cp mysql:${FILEPATH} ${EXPORT_PATH}
docker exec mysql bash -c "rm ${FILEPATH}"
