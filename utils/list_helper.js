const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((acc, blog) => acc + blog.likes, 0);
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((best, blog) => {
  return blog.likes > best.likes ? blog : best})
}
/*
when you are comparing objects, the deepStrictEqual method is probably what you want to use, as it ensures that the objects have the same attributes.

*/
module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}