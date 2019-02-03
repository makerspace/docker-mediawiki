MediaWiki installation used by Stockholm Makerspace <https://www.makerspace.se>

Maintained by Christian Antila & Björn Allvin

<https://wiki.makerspace.se>

--

The docker file is an almost exact duplicate of <https://store.docker.com/community/images/kristophjunge/mediawiki> 

The only change is an argument added to the curl commands which otherwise would get a timeout and cause the build process to fail.


Requirements
============
* A docker environment
* A running mysql server container named "mysql"
* A docker network called "mysql"

This container is meant to run behind a proxy server. Therefore the docker-compose.yml does not define any ports. If you want to run it without a proxy you need to uncomment the "ports:" section in the file docker-compose.yml.


Build instructions
==================

Clone the GIT repository

```
git clone https://github.com/makerspace/docker-mediawiki .
```


**Build a new image**

```
cd docker-mediawiki
```
```
./build
```

This will create an image tagged makerspace/makerspace-mediawiki:1.32.0


**Setup environment**

```
cp .env.default .env
```
Edit the .env file and fill in all relevant information

**Optional**

Copy existing images to '/data/images/'


**Start the container**

```
./start
```
This will start a container called "wiki.makerspace.se"

**Upgrade database**

If needed then upgrade the database by running

```
docker exec -it wiki.makerspace.se /script/update.sh
```


