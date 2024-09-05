const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');
const fs = require('fs');

// Create an image post
router.post('/', async (req, res) => {
  // Check if the image is a URL or a file
  let checkUrl = req.body.img.split("https");
  let isUrl = false;

  // If the image is a URL, set isUrl to true
  if (checkUrl[0].length < 1) {
    isUrl = true;
  }

  // Encode image to base64
  function base64_encode(file) {
    return "data:image/jpeg;base64," + fs.readFileSync(file, 'base64');
  }

  // Get the base64 string
  var base64str = req.body.img;

  // If the image is a file, encode it to base64
  if (!isUrl) {
    base64str = base64_encode(`/usercode/image_sharing_app/api/public/images/${req.body.img}`);
  }

  // Create a new post
  const newPost = new Post({
    userId: req.body.userId,
    desc: req.body.desc,
    img: base64str,
    location: req.body.location, // Include location
    tags: req.body.tags, // Include tags
    likes: [], // Initialize likes as an empty array
    comments: [], // Initialize comments as an empty array
  });

  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get a single image post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all posts of a user
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get timeline posts
router.get('/timeline/:userId', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);

    const userPosts = await Post.find({ userId: currentUser._id });

    const followedUserPosts = await Promise.all(
      currentUser.followings.map((followingId) => {
        return Post.find({ userId: followingId });
      })
    );

    res.status(200).json(userPosts.concat(...followedUserPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

// Like/Unlike a post
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json('The post has been liked');
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json('The post has been unliked');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Add a comment to a post
router.post('/:id/comment', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const newComment = {
      userId: req.body.userId,
      username: req.body.username,
      profilePicture: req.body.profilePicture,
      text: req.body.text,
    };
    post.comments.push(newComment); // Push the new comment into the comments array
    await post.save(); // Save the post with the new comment
    res.status(200).json("The comment has been added");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json('The post has been deleted');
    } else {
      res.status(403).json('You can only delete your own posts');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
