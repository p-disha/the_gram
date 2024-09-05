import { useEffect, useState } from 'react';
import axios from 'axios';
import './post.css';
import { Link } from 'react-router-dom';
import DefaultProfilePic from '../../images/noPic.png';
import { useSelector } from 'react-redux';

function Post({ post }) {
  const [user, setUser] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.likes?.length || 0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post?.comments || []);
  const currentUser = useSelector((state) => state.user.user); // Get the current logged-in user
  const [canComment, setCanComment] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/users/?userId=${post.userId}`);
        setUser(res.data);

        // Check if the current user can comment on the post
        const isFollowing = currentUser.followings.includes(post.userId);
        if (isFollowing || post.userId === currentUser._id) {
          setCanComment(true);
        }

        // Set the initial like state
        setIsLiked(post.likes.includes(currentUser._id));
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    if (post.userId) {
      fetchUser();
    }
  }, [post.userId, currentUser, post.likes]);

  // Ensure post data is available
  if (!post) {
    return null; // or you can display a loading spinner or a placeholder
  }

  // Get the base64 image safely
  let base64String = post.img ? post.img.split(",")[1] : '';

  // Handle like/unlike functionality
  const handleLikeClick = async () => {
    try {
      await axios.put(`/posts/${post._id}/like`, { userId: currentUser._id });
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Failed to like/unlike post:', err);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const newComment = {
        userId: currentUser._id,
        text: commentText,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
      };
      await axios.post(`/posts/${post._id}/comment`, newComment);
      setComments([...comments, newComment]);
      setCommentText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  // Handle delete post
  const handleDeleteClick = async () => {
    try {
      await axios.delete(`/posts/${post._id}`, { data: { userId: currentUser._id } });
      window.location.reload(); // Refresh the page after deletion
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  return (
    <div className="postContainer">
      <div className="postWrapper">
        <div className="postTop">
          <Link to={`profile/${user.username}`}>
            <img className="userProfileImg" src={user.profilePicture || DefaultProfilePic} alt="Profile" />
          </Link>
          <span className="postUsername">{user.username}</span>
          {currentUser._id === post.userId && (
            <button className="deleteButton" onClick={handleDeleteClick}>
              Delete
            </button>
          )}
        </div>
        <hr className="postHr" />
        <div className="postCenter">
          <img className="postImg" src={`data:image/jpeg;base64,${base64String}`} alt="Post" />
        </div>
        <div className="postBottom">
          <div className="postActions">
            <button className={`likeButton ${isLiked ? 'liked' : ''}`} onClick={handleLikeClick}>
              {isLiked ? 'Unlike' : 'Like'}
            </button>
            <span className="postLikeCounter">{likesCount} likes</span>
          </div>
          <div className="postDescription">{post.desc}</div>
          {post.location && <span className="postLocation">Location: {post.location}</span>}
          {post.tags && (
            <div className="postTags">
              {post.tags.map((tag, index) => (
                <span key={index} className="postTag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div className="commentsSection">
          {comments.map((comment, index) => (
            <div key={index} className="comment">
              <img
                className="commentProfileImg"
                src={comment.profilePicture || DefaultProfilePic}
                alt="Profile"
              />
              <span className="commentUsername">{comment.username}:</span>
              <span className="commentText">{comment.text}</span>
            </div>
          ))}
          {canComment && (
            <form className="commentForm" onSubmit={handleCommentSubmit}>
              <input
                type="text"
                className="commentInput"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button className="commentButton" type="submit">Comment</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Post;
