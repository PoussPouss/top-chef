# Explication how to launch the project #
----

## Structure project ##

The project is split in two parts:  
- **the first part is the back end** all back end scripts are saved in [this folder](docs/js/back)
- **the second part is the front back** all front scrips are saved in [this folder](find-the-best-deal/src)

It's a project front/back-end service, for communicating between this services, we created an API (back side) allowing to send and receive request.

## Getting started ##
For running this project, you have to already installed `NodeJS`. If isn't the case you can download it at [download nodejs](https://nodejs.org/en/download/)
For the front service, we use the `React` library, more explication how add the library to your project [react getting started](https://reactjs.org/docs/try-react.html)

:point_up: Note: this project use mongodb, but you **didn't** to install mongodb and create a database. Because the database is already host on a external server

## Start the project ##
1. **Start the API** the api is coded in node js you need to execute this command :
```
node docs/js/back/api.js
```
:warning: you need to stay this program until you want to shutdown the project

2. **Start the front part** Now the back-end service is launched, we need to launch the front by this command :
```
npm start find-the-best-deal/src/index.js
```
Theoretically, when the front is launched, a web site page should be opened with the front service project

:point_up: Note: the deals can change with the time. You can refresh the database of deals, just in loading the script **update-discount-fork** like this:
```
node docs/js/back/update-discount-fork.js
```

## Results ##
This is a few screenshots :

![Alt text](/img/screen01.jpeg?raw=true "Screen home page")

![Alt text](/img/screen02.jpeg?raw=true "Screen restaurants with discounts")

![Alt text](/img/screen03.jpeg?raw=true "Screen result of filtering")
