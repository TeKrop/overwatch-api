# Overwatch API
Unofficial Overwatch API made with Node.js (express, request, cheerio, SQLite)
![Mockup Overwatch API](https://www.tekrop.fr/img/portfolio/overwatch-api.jpg)

## What is it ?
It's a JSON API allowing you to retrieve data for players and heroes from the Overwatch game by Blizzard. All data is directly retrieved from Blizzard profile pages and heroes pages.

## Important details
In the API, all time values are returned in seconds (integer) thanks to some conversions. I built the API in order to always return an integer/float value when we are dealing with numbers (and not a string).

## Examples

Complete PC player profile (/player/<BattleTag>) : https://gist.github.com/TeKrop/9a09060a0701da68954936b7f963b6b8
Essential PC player infos (/player/<BattleTag>/info) : https://gist.github.com/TeKrop/5044b1629611c0e42b1e0a8614caf61b
List of Overwatch heroes (/heroes) : https://gist.github.com/TeKrop/ad793479d265b2c375eae3203488216e
Details about a specific Overwatch hero (/hero/wrecking-ball) : https://gist.github.com/TeKrop/8b212161b541727dcd35e05c7754644e

## Configuration
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

## Install and run

### Classic
You only need to have Node.js and eventually utilities in order to build sqlite package if not directly available for your platform (build-essential on debian for example). If you have any issue on a specific platform, don't hesitate to create an issue on this repository, I will try to solve it as quickly as possible.

```
npm install
node server.js
```
### Docker

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

## Live version
You can see and use a live version of the API here : https://overwatch-api.tekrop.fr/.
You can consult the official swagger as well, for details concerning routes : https://swagger-owapi.tekrop.fr/.

If you want to use the API, and you have the possibility to host your own instance, please do it (at least for production environment), in order to not overload the live version i'm hosting.

## Development details
I'm using **Node.js** along with **Express** as the main framework. In order to retrieve data from Blizzard profile pages, I'm using **request** along with **cheerio** to make request on the DOM. Finally, I made a simple cache system using **SQLite**, working with ETag returned by Blizzard profile pages headers.

## Bugs and feedback
If you find any bug, problem, or if you have any suggestion for improvements, don't hesitate to make a ticket or send me a mail (vporchet@gmail.com). As it's my first API made with Express, I probably made some mistakes and/or forgot to use some features provided by Express. If it's the case, don't hesitate to contact me as well :)

## ToDo List
- Improve caching system (with more features and customization)
- Unit testing
- Overwatch League data ?
- ...