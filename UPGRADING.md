1. Do a backup first

2. Then run

docker pull php:7-fpm

3. Update the `./build` script with the new mediawiki version number
4. ./build
5. Update the docker-compose script with new mediawiki version number
5. docker-compose down
6. ./start
7. docker exec -it <container id here> bash
8.   cd maintenance
9.   php upgrade.php


