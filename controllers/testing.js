//Used in the advent of the testing router; what we need is really to ensure that the env is a testing env and connect this to the proper DB, correct? This should ONLY be accessible if we are in the test env to ensure we don't accidentally wipe our DB..
// What I am almost thinking is we need to import config, then within config we need some sort of flag to show we are in test mode? 
const testingRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')



testingRouter.post('/reset', async (request, response) => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    response.status(204).end()
} )

module.exports = testingRouter