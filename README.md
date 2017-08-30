# armoire-prototype

## Server & Dependencies

### Server

#### Heroku

https://dashboard.heroku.com/apps/armoire-app

### Dependencies

- Amazon S3
- Stripe.com

## Stack

- NodeJS
- MongoDb & Mongoose
- Express
- Angular
- Gulp

# Debugging

~~~
heroku logs -a armoire-app-staging --tail
heroku logs -a armoire-app --tail
~~~

# Developing

Build assets, start watcher and start node server
~~~
gulp
~~~

Build production assets
~~~
gulp build
~~~
