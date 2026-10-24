const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const User = require('../models/user')
const config = require('../utils/config')


const api = supertest(app) //What does this do? 


beforeEach(async () => {
  await User.deleteMany({}) // Delete Users
  const passwordHash = await bcrypt.hash('sekret', 10) //Create a password hash
  const user = new User({ username: 'BillyGoat123', passwordHash }) //Post the username/password hash
  await user.save() //Save to DB
})

/* 
fresh username succeeds, [x]
a duplicate fails with 400 and an error message, 
a too-short username fails, a too-short password fails, 
a missing password fails.
*/

test('Fresh username, successfully POSTs', async () => {
    const newUser = {
        username: "Tester1",
        name: "Test McTest",
        password: "TestPassword"
    }
    
    await api
        .post('/api/users')
        .send(newUser)
        .expect(201)

    
    const response = await api.get('/api/users')
    assert.strictEqual(response.body.length, 2)
})

test('Duplicate username fails with 400 and an error', async () => {
        const duplicateUser = {
        username: "BillyGoat123",
        name: "Test McTest",
        password: "Testing"
    }
    const result = await api
        .post('/api/users')
        .send(duplicateUser)
        .expect(400)

    assert(result.body.error.includes('unique'))
})

test('Too short of a password', async () => {
        const shortPasswordUser = {
        username: "Shorty",
        name: "Mac Jack",
        password: "12"
    }

    await api
        .post('/api/users')
        .send(shortPasswordUser)
        .expect(400)
})

test('Too short of a username', async () => {
        const shortUsernameUser = {
        username: "Sh",
        name: "Ma Ja",
        password: "1234"
    }

    await api
        .post('/api/users')
        .send(shortUsernameUser)
        .expect(400)
})

test('No password key!', async () => {
        const noPasswordUser = {
        username: "Sh",
        name: "Ma Ja"
    }

    await api
        .post('/api/users')
        .send(noPasswordUser)
        .expect(400)
})

after(async () => {
    await mongoose.connection.close()
})