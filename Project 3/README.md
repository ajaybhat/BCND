# Web Services with Private BlockChain

A RESTful API using a Node.js framework that will interface with the private blockchain in Project 2. This project uses the `Express` framework.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Running this application

From the source root, do:

`npm install` to install all project dependencies.

`node app.js` to start the API server 

The message "Blockchain API available on port 8000" should be seen.

## Endpoint Information

Add additional notes about how to deploy this on a live system

### POST /block

POST Block endpoint with payload in the body.

http://localhost:8000/block

#### Sample Request

POST : http://localhost:8000/block
Content-Type: application/json
Request body: {"body": {"1":"2"}}

#### Sample Response

`{"hash":"4f8ab501f915949f8ff6bf7c7849ff75349e3fee646377601309a677f8f3f0df","height":1,"body":{"1":"2"},"time":"1549706924","previousBlockHash":"ecb1153bc4d8b17d44bc64a275c77fdc44ef87f0deb369a1114d8c57b158f4cf"}`

### GET /block/{BLOCK_HEIGHT}

GET Block endpoint path with block height as URL path param.

http://localhost:8000/block/{BLOCK_HEIGHT}

#### Sample Request

GET : http://localhost:8000/2

#### Sample Response

`{"hash":"d2874d63bb83ea714bff608f3913f2133bbe9a088bd30e9142a09f37f734c33b","height":2,"body":"Blockchain","time":"1549706817","previousBlockHash":"35841ca8e537fa21f94e9987369558cf3319da2a7310429ed095848cd61ea99b"}`
