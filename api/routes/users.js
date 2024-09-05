const router = require('express').Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// get a single user
router.get('/', async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;

  try {
    const user = userId 
      ? await User.findById(userId) 
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get the users followed by a particular user
router.get('/followers/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    const followingUsers = await Promise.all(
      user.followings.map((following) => {
        return User.findById(following);
      })
    );

    let followingsList = [];
    followingUsers.map((following) => {
      const { _id, username, profilePicture } = following;
      followingsList.push({ _id, username, profilePicture });
    });

    res.status(200).json(followingsList);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get the users who follow a particular user
router.get('/followings/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    const followerUsers = await Promise.all(
      user.followers.map((follower) => {
        return User.findById(follower);
      })
    );

    let followersList = [];
    followerUsers.map((follower) => {
      const { _id, username, profilePicture } = follower;
      followersList.push({ _id, username, profilePicture });
    });

    res.status(200).json(followersList);
  } catch (err) {
    res.status(500).json(err);
  }
});

// follow a user
router.put('/:id/follow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });

        res.status(200).json('User has been followed and added to your following list');
      } else {
        res.status(403).json('You already follow this user');
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json('You can\'t follow yourself');
  }
});

// unfollow a user
router.put('/:id/unfollow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });

        res.status(200).json('User has been unfollowed and removed from your following list');
      } else {
        res.status(403).json('You do not follow this user');
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json('You can\'t unfollow yourself');
  }
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });

// Update user profile
router.put('/update/:id', upload.single('profilePicture'), async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      let updatedData = req.body;
      if (req.file) {
        updatedData.profilePicture = `/images/${req.file.filename}`;
      }
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updatedData },
        { new: true }
      );
      res.status(200).json(updatedUser);  // Return the updated user data
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json('You can update only your account!');
  }
});

module.exports = router;
