//Need to figure out how this works, I believe this takes all 
//The parts of the pipeline assembles them, then hands it to index.js
const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const blogRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const testingRouter = require('./controllers/testing')

const app = express()


logger.info('connecting')

mongoose
    .connect(config.MONGODB_URI, { family: 4})
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error("Error connecting to MongoDB,", error.message)
    })


app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)
app.use('/api/blogs', blogRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

//Guarded router initialization; only if the NODE_ENV is 'test' do we give access to the testing endpoint. 
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)




module.exports = app