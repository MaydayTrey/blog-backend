const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const config = require('../utils/config')

const api = supertest(app)

const initialBlog = [
  {
    title: "Test Book 1",
    author: "Test Author 1",
    url: "URL 1",
    likes: 1
  },
  {
    title: "Test Book 2",
    author: "Test Author 2",
    url: "URL 2",
    likes: 2
  }
]

let token
let user

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('testpassword', 10)
  user = new User({ username: 'testuser', name: 'Test User', passwordHash })
  await user.save()

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'testpassword' })
  token = loginResponse.body.token

  const blogsWithOwner = initialBlog.map(b => ({ ...b, user: user._id }))
  await Blog.insertMany(blogsWithOwner)
})

test('runner works', () => {
  console.log('URI is', config.MONGODB_URI)
  assert.strictEqual(1, 1)
})

test('Successful fetch, of application json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('The initial state of the DB matches expectations', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialBlog.length)
})

test('blogs have an id property', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(typeof response.body[0].id, 'string')
})

test('blog successfully posted and adjusted DB', async () => {
  const newBlog = {
    title: "Test Book 3",
    author: "Test Author 3",
    url: "URL 3",
    likes: 3
  }
  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)

  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialBlog.length + 1)
  const titles = response.body.map(b => b.title)
  assert.ok(titles.includes('Test Book 3'))
})

test('POST without a token fails with 401', async () => {
  const newBlog = {
    title: "Unauthorized Book",
    author: "Nobody",
    url: "URL 401",
    likes: 0
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)

  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialBlog.length)
})

test('POST without likes', async () => {
  const unlikedBlog = {
    title: "Unliked Book",
    author: "Unliked Author",
    url: "URL 4",
  }
  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(unlikedBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  assert.strictEqual(response.body.likes, 0)
})

test('POST without title', async () => {
  const untitledBlog = {
    author: "Nameless book",
    url: "URL 4",
  }
  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(untitledBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)
})

test('POST without URL', async () => {
  const unlinkedBlog = {
    title: "A book, with no link!",
    author: "Nameless book",
  }
  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(unlinkedBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)
})

test('Deleted successfully', async () => {
  const blogsAtStart = await api.get('/api/blogs')
  const blogToDelete = blogsAtStart.body[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAfter = await api.get('/api/blogs')
  const blogAfterTitles = blogsAfter.body.map(t => t.title)
  assert.strictEqual(blogsAfter.body.length, initialBlog.length - 1)
  assert.strictEqual(blogAfterTitles.includes(blogToDelete.title), false)
})

test('Updated info successfully', async () => {
  const blogsAtStart = await api.get('/api/blogs')
  const blogToUpdate = blogsAtStart.body[0]

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send({ likes: 99 })
    .expect(200)

  const blogAfter = await api.get(`/api/blogs/${blogToUpdate.id}`)
  assert.strictEqual(blogAfter.body.likes, 99)
})

after(async () => {
  await mongoose.connection.close()
})