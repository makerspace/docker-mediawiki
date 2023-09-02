
ARG MEDIAWIKI_VERSION_MAJOR
ARG MEDIAWIKI_VERSION_MINOR
ARG MEDIAWIKI_VERSION_BUGFIX
FROM mediawiki:${MEDIAWIKI_VERSION_MAJOR}.${MEDIAWIKI_VERSION_MINOR}.${MEDIAWIKI_VERSION_BUGFIX}

# We need to repeat the args here to make them available during the build process
ARG MEDIAWIKI_VERSION_MAJOR
ARG MEDIAWIKI_VERSION_MINOR
ARG MEDIAWIKI_VERSION_BUGFIX
ENV MEDIAWIKI_ROOT="/var/www/html"

# User merge and delete extension
RUN curl -s -o /tmp/extension-usermerge.tar.gz https://extdist.wmflabs.org/dist/extensions/UserMerge-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-`curl -s -m 5 https://extdist.wmflabs.org/dist/extensions/ | grep -o -P "(?<=UserMerge-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-)[0-9a-z]{7}(?=.tar.gz)" | head -1`.tar.gz && \
    tar -xzf /tmp/extension-usermerge.tar.gz -C "$MEDIAWIKI_ROOT/extensions" && \
    rm /tmp/extension-usermerge.tar.gz

# MobileFrontend extension
RUN curl -s -o /tmp/extension-mobilefrontend.tar.gz https://extdist.wmflabs.org/dist/extensions/MobileFrontend-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-`curl -s -m 5 https://extdist.wmflabs.org/dist/extensions/ | grep -o -P "(?<=MobileFrontend-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-)[0-9a-z]{7}(?=.tar.gz)" | head -1`.tar.gz && \
    tar -xzf /tmp/extension-mobilefrontend.tar.gz -C "$MEDIAWIKI_ROOT/extensions" && \
    rm /tmp/extension-mobilefrontend.tar.gz

# NetworkAuth extension
RUN curl -s -o /tmp/extension-networkauth.tar.gz https://extdist.wmflabs.org/dist/extensions/NetworkAuth-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-`curl -s -m 5 https://extdist.wmflabs.org/dist/extensions/ | grep -o -P "(?<=NetworkAuth-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-)[0-9a-z]{7}(?=.tar.gz)" | head -1`.tar.gz && \
    tar -xzf /tmp/extension-networkauth.tar.gz -C "$MEDIAWIKI_ROOT/extensions" && \
    rm /tmp/extension-networkauth.tar.gz

# StopForumSpam extension
RUN curl -s -o /tmp/extension-stopspam.tar.gz https://extdist.wmflabs.org/dist/extensions/StopForumSpam-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-`curl -s -m 5 https://extdist.wmflabs.org/dist/extensions/ | grep -o -P "(?<=StopForumSpam-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-)[0-9a-z]{7}(?=.tar.gz)" | head -1`.tar.gz && \
    tar -xzf /tmp/extension-stopspam.tar.gz -C "$MEDIAWIKI_ROOT/extensions" && \
    rm /tmp/extension-stopspam.tar.gz

# MinervaNeue skin
RUN curl -s -o /tmp/skin-minervaneue.tar.gz https://extdist.wmflabs.org/dist/skins/MinervaNeue-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-`curl -s -m 5 https://extdist.wmflabs.org/dist/skins/ | grep -o -P "(?<=MinervaNeue-REL${MEDIAWIKI_VERSION_MAJOR}_${MEDIAWIKI_VERSION_MINOR}-)[0-9a-z]{7}(?=.tar.gz)" | head -1`.tar.gz && \
    tar -xzf /tmp/skin-minervaneue.tar.gz -C "$MEDIAWIKI_ROOT/skins" && \
    rm /tmp/skin-minervaneue.tar.gz

# Set work dir
WORKDIR /var/www/html
