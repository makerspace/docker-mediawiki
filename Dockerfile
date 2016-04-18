FROM nginx
MAINTAINER Christian Antila "tagged-github.com@chille.se"

ENV MEDIAWIKI_VERSION_MAJOR 1.26
ENV MEDIAWIKI_VERSION_MINOR 2

# Install PHP5 and a few extensions
RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends php5-fpm php5-intl php-apc php5-gd php5-intl php5-mysqlnd php5-curl php-pear php5-cli imagemagick php-pear\
	&& rm -rf /var/lib/apt/lists/*

# Change default user in nginx
RUN sed -i 's/user  nginx/user  www-data/g' /etc/nginx/nginx.conf

# Redirect worker stdout and stderr into main error log.
RUN echo "catch_workers_output = yes" >> /etc/php5/fpm/php-fpm.conf

# Receive the GPG keys specified in https://www.mediawiki.org/keys/keys.txt 2016-01-20
RUN gpg --keyserver pool.sks-keyservers.net --recv-keys \
      D7D6767D135A514BEB86E9BA75682B08E8A3FEC4 \
      441276E9CCD15F44F6D97D18C119E1A64D70938E \
      F7F780D82EBFB8A56556E7EE82403E59F9F8CD79 \
      1D98867E82982C8FE0ABC25F9B69B3109D3BB7B0 \
      162432D9E81C1C618B301EECEE1F663462D84F01 \
      3CEF8262806D3F0B6BA1DBDD7956EE477F901A30 \
      280DB7845A1DCAC92BB5A00A946B02565DC00AA7 \
      41B2ABE817ADD3E52BDA946F72BC1C5D23107F8A

# Install cURL
RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends curl \
	&& rm -r /var/lib/apt/lists/*

# Download, verify and extract MediaWiki
RUN MEDIAWIKI_DOWNLOAD_URL="https://releases.wikimedia.org/mediawiki/${MEDIAWIKI_VERSION_MAJOR}/mediawiki-${MEDIAWIKI_VERSION_MAJOR}.${MEDIAWIKI_VERSION_MINOR}.tar.gz"; \
	set -x; \
	mkdir -p /usr/src/mediawiki \
	&& curl -fSL "$MEDIAWIKI_DOWNLOAD_URL" -o mediawiki.tar.gz \
	&& curl -fSL "${MEDIAWIKI_DOWNLOAD_URL}.sig" -o mediawiki.tar.gz.sig \
	&& gpg --verify mediawiki.tar.gz.sig \
	&& tar -xf mediawiki.tar.gz -C /usr/src/mediawiki --strip-components=1 \
        && rm mediawiki.tar.gz mediawiki.tar.gz.sig

# Install MediaWiki VisualEditor addon
RUN curl -fSL https://extdist.wmflabs.org/dist/extensions/VisualEditor-REL1_26-34a21d8.tar.gz -o VisualEditor-REL1_26-34a21d8.tar.gz \
	&& tar -xzf VisualEditor-REL1_26-34a21d8.tar.gz -C /usr/src/mediawiki/extensions \
	&& rm VisualEditor-REL1_26-34a21d8.tar.gz

# Install Parsoid
RUN apt-key advanced --keyserver keys.gnupg.net --recv-keys 664C383A3566A3481B942F007A322AC6E84AFDD2 \
	&& apt-get update -y \
	&& apt-get install -y --no-install-recommends apt-transport-https \
	&& echo "deb http://releases.wikimedia.org/debian jessie-mediawiki main" > /etc/apt/sources.list.d/parsoid.list \
	&& apt-get update -y \
	&& apt-get install -y --no-install-recommends parsoid \
	&& rm -r /var/lib/apt/lists/*

# Configuration files for everything
ADD parsoid-settings.js /etc/mediawiki/parsoid/settings.js
ADD nginx-default.conf /etc/nginx/conf.d/default.conf
ADD php5-fpm-www.conf /etc/php5/fpm/pool.d/www.conf

# Start the container
CMD service php5-fpm start \
	&& service parsoid start \
	&& nginx -g "daemon off;"

