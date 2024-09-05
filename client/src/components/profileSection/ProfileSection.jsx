import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import DefaultProfilePic from '../../images/noPic.png';
import { followUser, unFollowUser, loginSuccess } from '../../pages/userSlice';
import './profileSection.css';

export default function ProfileSection({ user, onClose }) {
  const { user: currentUser } = useSelector((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [newBio, setNewBio] = useState(user.desc || '');
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    setNewBio(user.desc || '');
    setIsFollowing(currentUser.followings.includes(user._id));
  }, [user, currentUser]);

  const handleFileChange = (e) => {
    setNewProfilePicture(e.target.files[0]);
  };

  const handleBioChange = (e) => {
    setNewBio(e.target.value);
  };

  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append('userId', currentUser._id);
    formData.append('desc', newBio);
    if (newProfilePicture) {
      const fileName = Date.now() + '__' + newProfilePicture.name;
      formData.append('name', fileName);
      formData.append('profilePicture', newProfilePicture);
    }

    try {
      const res = await axios.put(`/users/update/${currentUser._id}`, formData);
      const updatedUser = res.data;

      // Update the local storage and Redux store with the updated user data
      dispatch(loginSuccess(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setIsEditing(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleFollowButtonClick = async () => {
    try {
      if (isFollowing) {
        await axios.put(`/users/${user._id}/unfollow`, { userId: currentUser._id });
        dispatch(unFollowUser(user._id));
      } else {
        await axios.put(`/users/${user._id}/follow`, { userId: currentUser._id });
        dispatch(followUser(user._id));
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="profileTop">
        <button className="closeProfileButton" onClick={onClose}>×</button>
        <div className="profileTopLeft">
          <img
            src={user.profilePicture ? user.profilePicture : DefaultProfilePic}
            alt="Profile"
            className="profileUserImg"
          />
        </div>
        <div className="profileTopRight">
          <div className="profileTopRightTop">
            <span className="profileUserName">{user.username}</span>
            {user.username === currentUser.username ? (
              <button
                className="profileEditBtn"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            ) : (
              <button
                className="profileFollowBtn"
                onClick={handleFollowButtonClick}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
          <div className="profileTopRightCenter">
            <div className="postsCount">{user.postsCount || 0} posts</div>
            <div className="followersCount">
              {user.followers ? user.followers.length : 0} followers
            </div>
            <div className="followingsCount">
              {user.followings ? user.followings.length : 0} following
            </div>
          </div>
          <div className="profileTopRightBottom">
            {!isEditing ? (
              <p>{user.desc}</p>
            ) : (
              <textarea
                value={newBio}
                onChange={handleBioChange}
                className="bioEditInput"
              />
            )}
          </div>
          {isEditing && (
            <div className="profileUpdateSection">
              <input
                type="file"
                id="file"
                accept=".png,.jpeg,.jpg"
                onChange={handleFileChange}
                className="profilePicInput"
              />
              <button
                className="profileUpdateBtn"
                onClick={handleUpdateProfile}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
