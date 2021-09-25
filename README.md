# Polls (API)

This is the api for polls-frontend (pollsimply.com)

## Technology

* [Node.js](https://nodejs.org/en/) - Node.js is an open-source, cross-platform, back-end, JavaScript runtime environment 
* [Nest.js](https://nestjs.com/) - A progressive Node.js framework 
* [Digital Ocean](https://www.digitalocean.com/) - Cloud service to deploy applications
* [PM2](https://pm2.keymetrics.io/) - For running the apps on the Digital Ocean droplet

## Developing locally

Firstly install all dependencies

```
npm i
```

Then run

```
npm run start
```

## Digital Ocean

This is deployed on digital ocean under the domain api.pollsimply.com.


### Accessing the server from you machine

You will need to have a ssh key set up and have an authenticated user with admin privileges set up on the server. You can find information to set that up [here](https://www.digitalocean.com/community/questions/setting-up-a-new-user-using-ssh)

##### 1. ssh into the server with this command: 
```
ssh YOUR_USERNAME@209.97.133.120
```

##### 2. once in open the root console

```
sudo -i
``` 

##### 3. cd into the root directory

```
cd /root
```

#### Show running apps
```
pm2 status
```
This will display the running applications on the server

#### Displaying logs 
Make sure you are in the root dir and run this command:

```
pm2 logs
```

## Infomation

- Env files can be found in 1password
