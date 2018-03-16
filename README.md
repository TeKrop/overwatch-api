# Overwatch API
Unofficial Overwatch API made with Node.js (express, request, cheerio, SQLite)
![Mockup Overwatch API](https://www.tekrop.fr/img/portfolio/overwatch-api.jpg)

## What is it ?
It's a JSON API allowing you to retrieve data for players and heroes from the Overwatch game by Blizzard. All data is directly retrieved from Blizzard profile pages and heroes pages.

## Important details
In the API, all time values are returned in seconds (integer) thanks to some conversions. I built the API in order to always return an integer/float value when we are dealing with numbers (and not a string).

## Install and run

### Classic

```
npm install
node server.js
```
### Docker
Available soon...

## Live version
You can see and use a live version of the API here : https://overwatch-api.tekrop.fr/. You can consult the official swagger as well, for details concerning routes : https://swagger-owapi.tekrop.fr/.
If you want to use the API, and you have the possibility to host your own instance, please do it (at least for production environment), in order to not overload the live version i'm hosting.

## Development details
I'm using **Node.js** along with **Express** as the main framework. In order to retrieve data from Blizzard profile pages, I'm using **request** along with **cheerio** to make request on the DOM. Finally, I made a simple cache system using **SQLite**, working with ETag returned by Blizzard profile pages headers.

## Bugs and feedback
If you find any bug, problem, or if you have any suggestion for improvements, don't hesitate to make a ticket or send me a mail (vporchet@gmail.com). As it's my first API made with Express, I probably made some mistakes and/or forgot to use some features provided by Express. If it's the case, don't hesitate to contact me as well :)
