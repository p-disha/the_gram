import './userSearch.css';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import DefaultProfilePic from '../../images/noPic.png';
import { followUser, unFollowUser } from '../../pages/userSlice';

export default function UserSearch() {
  const { user: currentUser } = useSelector((state) => state.user);
  const [followingsList, setFollowingsList] = useState([]);
  const [followersList, setFollowersList] = useState([]); // State for followers list
  const [searchUserName, setSearchUserName] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showFollowingsModal, setShowFollowingsModal] = useState(false); // State to control followings modal visibility
  const [showFollowersModal, setShowFollowersModal] = useState(false); // State to control followers modal visibility
  const dispatch = useDispatch();

  useEffect(() => {
    // Async function to fetch the followings and followers of a particular person
    const fetchFollowingsAndFollowers = async () => {
      try {
        // Get the followings from the database using axios
        const followingsRes = await axios.get("/users/followers/" + currentUser._id);
        setFollowingsList(followingsRes.data);

        // Get the followers from the database using axios
        const followersRes = await axios.get("/users/followings/" + currentUser._id);
        setFollowersList(followersRes.data); // Correctly set followersList
      } catch (error) {
        console.log(error);
      }
    };
    // Call the async function
    fetchFollowingsAndFollowers();
  }, [currentUser]);

  // Function to get profile picture or default image
  function getProfilePicture(profilePicture) {
    return profilePicture ? `data:image/jpeg;base64,${profilePicture.split(",")[1]}` : DefaultProfilePic;
  }

  // Handle user search submit
  function handleUserSearchSubmit(e) {
    e.preventDefault();

    // Check if the searchUserName is empty
    if (searchUserName === "") {
      setErrorMessage("Please enter a username!");
      setError(true);
      return;
    }

    // Async function to search for a user
    const searchUser = async () => {
      try {
        // Get the user from the database
        const res = await axios.get(`/users/?username=${searchUserName}`);
        setSearchedUser(res.data);
        setError(false);
      } catch (error) {
        // Set the error to true
        setSearchedUser(null);
        setError(true);
        setErrorMessage("No users found!");
        console.log(error);
      }
    };

    // Call the async function
    searchUser();
  }

  const handleFollowButtonClick = async (userId) => {
    try {
      const isFollowing = currentUser.followings.includes(userId);
      if (isFollowing) {
        await axios.put(`/users/${userId}/unfollow`, { userId: currentUser._id });
        dispatch(unFollowUser(userId));
      } else {
        await axios.put(`/users/${userId}/follow`, { userId: currentUser._id });
        dispatch(followUser(userId));
      }
      // Refresh followings list
      setFollowingsList(followingsList.map((user) =>
        user._id === userId
          ? { ...user, isFollowing: !isFollowing }
          : user
      ));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='searchContainer'>
      <form className="newPostBottom" onSubmit={handleUserSearchSubmit}>
        <div className='searchWrapper'>
          <input
            type="text"
            placeholder="Search for a user"
            className='userSearch'
            onChange={(event) => setSearchUserName(event.target.value)}
          />
          <button className="userSearchButton" type="submit">Search</button>
        </div>
      </form>
      
      {/* UI to display the user searched from the search bar, also display a heading to represent the searched user */}
      {searchedUser && (
        <div className='usersCard'>
          <div className="followingsList">
            <span className="subHeadingName">Searched Users</span>
            <div className="following">
              <img src={getProfilePicture(searchedUser.profilePicture)} alt="" className="followingImg" />
              <span className="followingName">{searchedUser.username}</span>
              {searchedUser._id !== currentUser._id && (
                <button
                  className="followButton"
                  onClick={() => handleFollowButtonClick(searchedUser._id)}
                >
                  {currentUser.followings.includes(searchedUser._id) ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UI to display the error message */}
      {error && (
        <div className="errorWrapper">
          <span className="errorMessage">{errorMessage}</span>
        </div>
      )}

      {/* Buttons to trigger the modals */}
      <div className="followButtonContainer">
        <button onClick={() => setShowFollowersModal(true)} className="toggleButton">
          Show Followers
        </button>
        <button onClick={() => setShowFollowingsModal(true)} className="toggleButton">
          Show Followings
        </button>
      </div>

      {/* Modal for followings */}
      {showFollowingsModal && (
        <div className="modal">
          <div className="modalContent">
            <span className="closeButton" onClick={() => setShowFollowingsModal(false)}>&times;</span>
            <h2>Followings</h2>
            <div className="modalBody">
              {followingsList.map((following) => (
                <div key={following._id} className="following">
                  <img src={getProfilePicture(following.profilePicture)} alt="" className="followingImg" />
                  <span className="followingName">{following.username}</span>
                  {following._id !== currentUser._id && (
                    <button
                      className="followButton"
                      onClick={() => handleFollowButtonClick(following._id)}
                    >
                      {currentUser.followings.includes(following._id) ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal for followers */}
      {showFollowersModal && (
        <div className="modal">
          <div className="modalContent">
            <span className="closeButton" onClick={() => setShowFollowersModal(false)}>&times;</span>
            <h2>Followers</h2>
            <div className="modalBody">
              {followersList.map((follower) => (
                <div key={follower._id} className="following">
                  <img src={getProfilePicture(follower.profilePicture)} alt="" className="followingImg" />
                  <span className="followingName">{follower.username}</span>
                  {follower._id !== currentUser._id && (
                    <button
                      className="followButton"
                      onClick={() => handleFollowButtonClick(follower._id)}
                    >
                      {currentUser.followings.includes(follower._id) ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
