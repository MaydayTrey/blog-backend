// Express, route handlers via Router
//Note: I'm doing this a bit backwards building this first, since I haven't built the blog schema yet.
const middleware = require('../utils/middleware')

const blogRouter = require('express').Router()
//So this creates an object via express then utilizes the Router method on it?
const Blog = require('../models/blog')
// This is saying blog is the export of the model blog

// ---- FETCH ALL BLOGS ---- //\
/*notesRouter.post('/', async (request, response) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  const savedNote = await note.save()
  response.status(201).json(savedNote)
})
*/

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.status(200).json(blogs)
})
//Finds all DB entries which match the schema established in 
//our blog.js models, and then returns them all in response.json

// ---- FINDING VIA ID A RESOURCE ---- //
blogRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if(blog){
        response.json(blog)
    } else {
        response.status(404).end()
    }
})
//This gets by id, with the :id after the slash, this specifies the param,
//meaning we can access it via request.params.NAME, we utilize the findById method,
//And then once we get the response, we need to check if it was found, or not, and if not found then
//We need to return 404, and end the connection, outside the .then we have an error thrower.




// ---- POSTING TO THE SERVER ---- //
blogRouter.post('/', middleware.userExtractor, async (request, response) => {
    const body = request.body
    const user = request.user

    //Gets the body from the request
    //The body is what is attempted to be posted
    const blog = new Blog({
        //Variables about the blog, what do we actually need here, considering that we have it defined within blogs.js?
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id
    })
    //Refresh, I believe this enforces a schema on the application side, meaning an attempted POST
    //Gets this enforced on the data? But isn't that handled in models/blog.js?
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)

        //This sends as a response the savedBlog
        //Really it should just send status code of success and some message
    //That panhandle error catch, not how does this relate to placement, it needs to be the bottom just like regular .then/.catch structure.
})

// ---- DELETE A RESOURCE ON THE SERVER ---- //
blogRouter.delete('/:id', middleware.userExtractor, async (request, response) => {

    const blog = await Blog.findById(request.params.id)
    if(!blog){
        return response.status(404).json({error: 'The blog you want to delete is not found'})
    }
    if(blog.user.toString() === request.user._id.toString()){
        await Blog.findByIdAndDelete(request.params.id)
        response.status(204).end()
    } else {
        return response.status(401).json({error: 'Only the creator can delete a blog.' })
    }
})
//I was going to do findById -- important to know that all the basic CRUD functions have dedicated methods.


// ---- UPDATING A SPECIFIC RESOURCE ON THE SERVER ---- //
blogRouter.put('/:id', async (request, response) => {
    const body = request.body
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, body, { new: true })
    response.status(200).json(updatedBlog)
})

//Issues with the PUT; 
//There was no .then, so the request would hang forever. 
/*
{ body } wraps the body in a field called body, 
 \giving Mongoose { body: { title, author, ... } } 
 instead of the fields themselves. 
 You want the body object directly, plus { new: true } 
 so you get the updated document back.

*/

module.exports = blogRouter