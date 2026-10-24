const loginRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


loginRouter.post('/', async (request, response) => {
   const { username, password } = request.body
   const user = await User.findOne({ username })
   /*
   Check the password against the hash - so we need to pull the password, hash it and compare to the actual hash stored
   and ensure that the username isn't null
   */

   const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)
    if(!passwordCorrect){
        return response.status(401).json({error: "Improper password or username"})
    }
    //Build the payload:
    const userForToken = {
        username: user.username,
        id: user._id
    }

    const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*60 })
    response.status(200).send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter