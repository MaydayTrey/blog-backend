//Mongoose code and schema goes here for a blog\
const mongoose = require('mongoose')

//This creates an object called mongoose, utilizing the mongoose library
mongoose.set('strictQuery', false)

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true },
  author: String,
  url: {
    type: String,
    required: true},
  likes: {
    type: Number,
    default: 0},
  user: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})
//Captures anything utilizing JSON conversion
//Grabbing the MongoDB object ID and converting it to string
//Then deleting the _id object and __v version object. Not really sure what that is, I'll learn it later.



module.exports = mongoose.model("Blog", blogSchema)