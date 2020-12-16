# 🎮 Overwatch API

![Version](https://img.shields.io/github/package-json/v/TeKrop/overwatch-api)
[![Docker Build](https://img.shields.io/docker/build/tekrop/overwatch-api)](https://hub.docker.com/r/tekrop/overwatch-api)
[![Issues](https://img.shields.io/github/issues/TeKrop/overwatch-api)](https://github.com/TeKrop/overwatch-api/issues)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://swagger-owapi.tekrop.fr)
[![License: MIT](https://img.shields.io/github/license/TeKrop/overwatch-api)](https://github.com/TeKrop/overwatch-api/blob/master/LICENSE)
![Mockup Overwatch API](https://files.tekrop.fr/overwatch-api.jpg)

> Unofficial Overwatch API made with Node.js (express, superargent, cheerio, SQLite)

## Table of contents
* [✨ Demo](#demo)
* [🛠️ Configuration](#configuration)
* [💽 Installation](#installation)
* [🐋 Docker](#docker)
* [👨‍💻 Technical details](#technical-details)
* [🤝 Contributing](#contributing)
* [📝 License](#license)

## ✨ [Demo](https://overwatch-api.tekrop.fr)

You can see and use a live version of the API here : https://overwatch-api.tekrop.fr/.
You can consult the official swagger as well, for details concerning routes : https://swagger-owapi.tekrop.fr/.

If you want to use the API, and you have the possibility to host your own instance, please do it (at least for production environment), in order to not overload the live version i'm hosting.

## 🛠️ Configuration
You can configure the application by modifying the `config/app-config.js` file. Here are the current available options :

### Basic server configuration
| Variable             | Default value                         | Description |
| -------------        | -------------                         | ----------- |
| **`SERVER_PORT`**    | `8081`                                | Server port to use |
| **`SWAGGER_URL`**    | `'https://swagger-owapi.tekrop.fr/'`  | URL of Swagger page for the API |

### Logs configuration
| Variable             | Default value                         | Description |
| -------------        | -------------                         | ----------- |
| **`ENABLE_LOGS`**    | `true`                                | Enable file logging. If you want to handle logs externally, put this value to false |
| **`LOG_LEVEL`**      | `'verbose'`                           | Log levels, corresponding to Node.js levels : error, warn, info, verbose, debug |
| **`LOG_PATH`**       | `'./logs'`                            | Logs storage location |
| **`LOG_FILENAME`**   | `'overwatch-api-%DATE%.log'`          | Logs filename pattern (daily logs) |
| **`ZIP_LOGS`**       | `true`                                | Whether or not the app should zip the logs when the day is over |

### External calls configuration
| Variable             | Default value                         | Description |
| -------------        | -------------                         | ----------- |
| **`BLIZZARD_HOST`**  | `'https://playoverwatch.com'`         | Blizzard Overwatch website hostname, base url for career and heroes path |
| **`CAREER_PATH`**    | `'/en-us/career/'`                    | Path for Overwatch players career profiles on Blizzard website |
| **`HEROES_PATH`**    | `'/en-us/heroes/'`                    | Path for Overwatch heroes pages on Blizzard website |

## 💽 Classic install

```sh
npm install
node server.js
```

## 🐋 Docker

First step : pull the official image from the Docker Hub, or build image yourself

```
docker pull tekrop/overwatch-api
```
OR
```
docker build . -t tekrop/overwatch-api:latest
```

You can set the application configuration on container launch using environment variables, with names like **`OW_API_<CONFIG_VARIABLE>`**. Example : **`OW_API_SERVER_PORT`**. If no environment variable is specified, the default values are used by the application. You can also create a volume in order to consult the application logs outside of the container. Here are some examples :

Simple launch (no logs volume, default config values)
```
docker run -d \
    --name overwatch-api \
    -p 80:8081 \
    tekrop/overwatch-api
```

Advanced launch (logs volume and override config, or just no log files)
```
docker run -d \
    --name overwatch-api \
    -p 80:8081 \
    --volume <local_path_to_logs>:/usr/src/app/logs \
    --env OW_API_LOG_LEVEL="info"\
    tekrop/overwatch-api
```
```
docker run -d \
    --name overwatch-api \
    -p 80:8081 \
    --env OW_API_ENABLE_LOGS="false" \
    tekrop/overwatch-api
```

## 👨‍💻 Technical details

**Important** : In the API, all time values are returned in seconds (integer) thanks to some conversions. I built the API in order to always return an integer/float value when we are dealing with numbers (and not a string).

For code syntax and style, I'm using **Airbnb JS Style Guide** (https://github.com/airbnb/javascript). I'm using **Node.js** along with **Express** as the main framework. In order to retrieve data from Blizzard profile pages, I'm using **superagent** along with **cheerio** to make request on the DOM. Finally, I made a simple cache system using **SQLite**, working with ETag returned by Blizzard profile pages headers. For code

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](https://github.com/TeKrop/overwatch-api/issues).

## 📝 License

Copyright © 2020 [Valentin PORCHET](https://github.com/TeKrop).

This project is [MIT](https://github.com/TeKrop/overwatch-api/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
