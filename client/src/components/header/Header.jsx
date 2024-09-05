import React, { useState } from 'react';
import './header.css';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import DefaultProfilePic from '../../images/noPic.png';
import { resetState } from '../../pages/userSlice';
import Messenger from '../messenger/Messenger';  
import ProfileSection from '../profileSection/ProfileSection'; // Import the ProfileSection

export default function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);  
  const [isProfileVisible, setIsProfileVisible] = useState(false); // State for profile visibility

  let navigate = useNavigate();

  // Function to handle logout
  function handleLogout() {
    // Remove the user from the local storage
    localStorage.removeItem("user");

    // Reset the state
    dispatch(resetState());

    navigate("/register");
  }

  // Function to toggle Messenger pop-up
  const toggleMessenger = () => {
    setIsMessengerOpen(!isMessengerOpen);
  };

  // Function to toggle profile section
  const toggleProfileSection = () => {
    setIsProfileVisible(!isProfileVisible);
  };

  return (
    <>
      <div className="headerContainer">
        <div className="headerLeft">
          <Link to="/" style={{ textDecoration: "none" }}>
            <span style={{ color: "whitesmoke" }}>The Gram</span>
          </Link>
        </div>
        <div className="headerRight">
          <div onClick={toggleProfileSection} style={{ cursor: "pointer" }}>
            <img
              className="profileImg"
              src={user.profilePicture || DefaultProfilePic}
              alt="Profile Icon"
            />
          </div>
          <button className="headerLogoutButton" onClick={handleLogout}>Logout</button>
          <button className="headerMessengerButton" onClick={toggleMessenger}>Messenger</button>
        </div>
      </div>
      
      {/* Messenger pop-up */}
      {isMessengerOpen && (
        <div className="messengerPopup">
          <Messenger currentUser={user} onClose={toggleMessenger} />
        </div>
      )}

      {/* Profile Section */}
      {isProfileVisible && (
        <ProfileSection user={user} />
      )}
    </>
  );
}
