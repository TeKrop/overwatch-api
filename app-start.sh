#!/bin/bash

# main environment variables
OW_API_CONFIG_FILE="./config/app-config.js"
OW_API_VOLUME="."

OW_API_SERVER_PORT=${OW_API_SERVER_PORT:=8081}
OW_API_SWAGGER_URL=${OW_API_SWAGGER_URL:="https://swagger-owapi.tekrop.fr/"}

OW_API_ENABLE_LOGS=${OW_API_ENABLE_LOGS:="true"}
OW_API_LOG_LEVEL=${OW_API_LOG_LEVEL:="verbose"}
OW_API_LOG_PATH=${OW_API_LOG_PATH:="./logs"}
OW_API_LOG_FILENAME=${OW_API_LOG_FILENAME:="overwatch-api-%DATE%.log"}
OW_API_ZIP_LOGS=${OW_API_ZIP_LOGS:="true"}

OW_API_BLIZZARD_HOST=${OW_API_BLIZZARD_HOST:="https://playoverwatch.com"}
OW_API_CAREER_PATH=${OW_API_CAREER_PATH:="/en-us/career/"}
OW_API_HEROES_PATH=${OW_API_HEROES_PATH:="/en-us/heroes/"}

# apply configuration

# basic server configuration
sed -i 's#SERVER_PORT:.*#SERVER_PORT:'$OW_API_SERVER_PORT',#' $OW_API_CONFIG_FILE
sed -i 's#SWAGGER_URL:.*#SWAGGER_URL:"'$OW_API_SWAGGER_URL'",#' $OW_API_CONFIG_FILE

# logs configuration
sed -i 's#ENABLE_LOGS:.*#ENABLE_LOGS:'$OW_API_ENABLE_LOGS',#' $OW_API_CONFIG_FILE
sed -i 's#LOG_LEVEL:.*#LOG_LEVEL:"'$OW_API_LOG_LEVEL'",#' $OW_API_CONFIG_FILE
sed -i 's#LOG_PATH:.*#LOG_PATH:"'$OW_API_LOG_PATH'",#' $OW_API_CONFIG_FILE
sed -i 's#LOG_FILENAME:.*#LOG_FILENAME:"'$OW_API_LOG_FILENAME'",#' $OW_API_CONFIG_FILE
sed -i 's#ZIP_LOGS:.*#ZIP_LOGS:'$OW_API_ZIP_LOGS',#' $OW_API_CONFIG_FILE

# external call configuration (endpoint), modify only if you know what you're doing
sed -i 's#BLIZZARD_HOST:.*#BLIZZARD_HOST:"'$OW_API_BLIZZARD_HOST'",#' $OW_API_CONFIG_FILE
sed -i 's#CAREER_PATH:.*#CAREER_PATH:"'$OW_API_CAREER_PATH'",#' $OW_API_CONFIG_FILE
sed -i 's#HEROES_PATH:.*#HEROES_PATH:"'$OW_API_HEROES_PATH'",#' $OW_API_CONFIG_FILE

(
    bash -c "node $OW_API_VOLUME/server.js"
)

# Keep alive
tail -f $LOG_PATH/$LOG_FILENAME