FROM php:7-fpm-buster

# Change UID and GID of www-data user to match host privileges
RUN usermod -u 999 www-data && \
    groupmod -g 999 www-data

# Utilities
RUN apt-get update && \
    apt-get -y install apt-transport-https ca-certificates apt-utils gnupg dirmngr git curl nano --no-install-recommends && \
    rm -r /var/lib/apt/lists/*

# MySQL PHP extension
RUN docker-php-ext-install mysqli

# Imagick with PHP extension
RUN apt-get update && apt-get install -y imagemagick libmagickwand-dev --no-install-recommends && \
    pecl install imagick && \
    echo "extension=imagick.so" > /usr/local/etc/php/conf.d/ext-imagick.ini && \
    rm -rf /var/lib/apt/lists/*

# Intl PHP extension
RUN apt-get update && apt-get install -y libicu-dev g++ --no-install-recommends && \
    docker-php-ext-install intl && \
    apt-get install -y --auto-remove g++ && \
    rm -rf /var/lib/apt/lists/*

# APC PHP extension
RUN pecl install apcu && \
    pecl install apcu_bc && \
    docker-php-ext-enable apcu --ini-name 10-docker-php-ext-apcu.ini && \
    docker-php-ext-enable apc --ini-name 20-docker-php-ext-apc.ini

# Nginx
RUN apt-get update && \
    apt-get -y install nginx && \
    rm -r /var/lib/apt/lists/*
COPY config/nginx/* /etc/nginx/

# PHP-FPM
COPY config/php-fpm/php-fpm.conf /usr/local/etc/
COPY config/php-fpm/php.ini /usr/local/etc/php/
RUN mkdir -p /var/run/php7-fpm/ && \
    chown www-data:www-data /var/run/php7-fpm/

# Supervisor
RUN apt-get update && \
    apt-get install -y supervisor --no-install-recommends && \
    rm -r /var/lib/apt/lists/*
COPY config/supervisor/supervisord.conf /etc/supervisor/conf.d/
COPY config/supervisor/kill_supervisor.py /usr/bin/

# NodeJS
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install -y nodejs --no-install-recommends

# Parsoid
RUN useradd parsoid --no-create-home --home-dir /usr/lib/parsoid --shell /usr/sbin/nologin
RUN apt-key advanced --keyserver keyserver.ubuntu.com --recv-keys 0xAF380A3036A03444 && \
    echo "deb https://releases.wikimedia.org/debian jessie-mediawiki main" > /etc/apt/sources.list.d/parsoid.list && \
    apt-get update && \
    apt-get -y install parsoid --no-install-recommends
COPY config/parsoid/config.yaml /usr/lib/parsoid/src/config.yaml
ENV NODE_PATH /usr/lib/parsoid/node_modules:/usr/lib/parsoid/src

# MediaWiki
ARG MEDIAWIKI_VERSION_MAJOR=1
ARG MEDIAWIKI_VERSION_MINOR=30
ARG MEDIAWIKI_VERSION_BUGFIX=0

RUN curl -s -o /tmp/keys.txt https://www.mediawiki.org/keys/keys.txt && \
    curl -s -o /tmp/mediawiki.tar.gz https://releases.wikimedia.org/mediawiki/$MEDIAWIKI_VERSION_MAJOR.$MEDIAWIKI_VERSION_MINOR/mediawiki-$MEDIAWIKI_VERSION_MAJOR.$MEDIAWIKI_VERSION_MINOR.$MEDIAWIKI_VERSION_BUGFIX.tar.gz && \
    curl -s -o /tmp/mediawiki.tar.gz.sig https://releases.wikimedia.org/mediawiki/$MEDIAWIKI_VERSION_MAJOR.$MEDIAWIKI_VERSION_MINOR/mediawiki-$MEDIAWIKI_VERSION_MAJOR.$MEDIAWIKI_VERSION_MINOR.$MEDIAWIKI_VERSION_BUGFIX.tar.gz.sig && \
    gpg --import --batch /tmp/keys.txt && \
    gpg --list-keys --fingerprint --with-colons | sed -E -n -e 's/^fpr:::::::::([0-9A-F]+):$/\1:6:/p' | gpg --import-ownertrust && \
    gpg --verify /tmp/mediawiki.tar.gz.sig /tmp/mediawiki.tar.gz && \
    mkdir -p /var/www/mediawiki /data /images && \
    tar -xzf /tmp/mediawiki.tar.gz -C /tmp && \
    mv /tmp/mediawiki-$MEDIAWIKI_VERSION_MAJOR.$MEDIAWIKI_VERSION_MINOR.$MEDIAWIKI_VERSION_BUGFIX/* /var/www/mediawiki && \
    rm -rf /tmp/mediawiki.tar.gz /tmp/mediawiki-$MEDIAWIKI_VERSION_MAJOR.$MEDIAWIKI_VERSION_MINOR.$MEDIAWIKI_VERSION_BUGFIX/ /tmp/keys.txt && \
    rm -rf /var/www/mediawiki/images && \
    ln -s /images /var/www/mediawiki/images && \
    chown -R www-data:www-data /data /images /var/www/mediawiki/images
COPY config/mediawiki/* /var/www/mediawiki/

# VisualEditor extension
RUN curl -s -o /tmp/extension-visualeditor.tar.gz https://extdist.wmflabs.org/dist/extensions/VisualEditor-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-`curl -s -m 5 https://extdist.wmflabs.org/dist/extensions/ | grep -o -P "(?<=VisualEditor-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-)[0-9a-z]{7}(?=.tar.gz)" | head -1`.tar.gz && \
    tar -xzf /tmp/extension-visualeditor.tar.gz -C /var/www/mediawiki/extensions && \
    rm /tmp/extension-visualeditor.tar.gz

# User merge and delete extension
RUN curl -s -o /tmp/extension-usermerge.tar.gz https://extdist.wmflabs.org/dist/extensions/UserMerge-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-`curl -s -m 5 https://extdist.wmflabs.org/dist/extensions/ | grep -o -P "(?<=UserMerge-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-)[0-9a-z]{7}(?=.tar.gz)" | head -1`.tar.gz && \
    tar -xzf /tmp/extension-usermerge.tar.gz -C /var/www/mediawiki/extensions && \
    rm /tmp/extension-usermerge.tar.gz

# MobileFrontend extension
RUN curl -s -o /tmp/extension-mobilefrontend.tar.gz https://extdist.wmflabs.org/dist/extensions/MobileFrontend-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-`curl -s -m 5 https://extdist.wmflabs.org/dist/extensions/ | grep -o -P "(?<=MobileFrontend-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-)[0-9a-z]{7}(?=.tar.gz)" | head -1`.tar.gz && \
    tar -xzf /tmp/extension-mobilefrontend.tar.gz -C /var/www/mediawiki/extensions && \
    rm /tmp/extension-mobilefrontend.tar.gz

# ConfirmEdit extension
RUN curl -s -o /tmp/extension-confirmedit.tar.gz https://extdist.wmflabs.org/dist/extensions/ConfirmEdit-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-`curl -s -m 5 https://extdist.wmflabs.org/dist/extensions/ | grep -o -P "(?<=ConfirmEdit-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-)[0-9a-z]{7}(?=.tar.gz)" | head -1`.tar.gz && \
    tar -xzf /tmp/extension-confirmedit.tar.gz -C /var/www/mediawiki/extensions && \
    rm /tmp/extension-confirmedit.tar.gz

# NetworkAuth extension
RUN curl -s -o /tmp/extension-networkauth.tar.gz https://extdist.wmflabs.org/dist/extensions/NetworkAuth-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-`curl -s -m 5 https://extdist.wmflabs.org/dist/extensions/ | grep -o -P "(?<=NetworkAuth-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-)[0-9a-z]{7}(?=.tar.gz)" | head -1`.tar.gz && \
    tar -xzf /tmp/extension-networkauth.tar.gz -C /var/www/mediawiki/extensions && \
    rm /tmp/extension-networkauth.tar.gz

# MinervaNeue skin
RUN curl -s -o /tmp/skin-minervaneue.tar.gz https://extdist.wmflabs.org/dist/skins/MinervaNeue-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-`curl -s -m 5 https://extdist.wmflabs.org/dist/skins/ | grep -o -P "(?<=MinervaNeue-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-)[0-9a-z]{7}(?=.tar.gz)" | head -1`.tar.gz && \
    tar -xzf /tmp/skin-minervaneue.tar.gz -C /var/www/mediawiki/skins && \
    rm /tmp/skin-minervaneue.tar.gz

RUN apt-get update && \
    apt-get -y install iproute2 iputils-ping
    
# Set work dir
WORKDIR /var/www/mediawiki

# Copy docker entry point script
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Copy install and update script
RUN mkdir /script
COPY script/* /script/

# General setup
VOLUME ["/var/cache/nginx", "/data", "/images"]
EXPOSE 80 443
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD []
