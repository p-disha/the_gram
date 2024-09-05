import { useEffect, useState } from 'react';
import axios from 'axios';
import './messenger.css';

export default function Messenger({ currentUser }) {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [followings, setFollowings] = useState([]);
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    // Fetch conversations of the user
    const getConversations = async () => {
      try {
        const res = await axios.get('/conversations/' + currentUser._id);
        setConversations(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [currentUser._id]);

  useEffect(() => {
    // Fetch followings to show in chat list
    const getFollowings = async () => {
      try {
        const res = await axios.get('/users/followers/' + currentUser._id);
        setFollowings(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getFollowings();
    
    // Fetch followers to show in chat list
    const getFollowers = async () => {
      try {
        const res = await axios.get('/users/followings/' + currentUser._id);
        setFollowers(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getFollowers();
  }, [currentUser._id]);

  useEffect(() => {
    const getMessages = async () => {
      if (currentChat) {
        try {
          const res = await axios.get('/messages/' + currentChat._id);
          setMessages(res.data);
        } catch (err) {
          console.log(err);
        }
      }
    };
    getMessages();
  }, [currentChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = {
      senderId: currentUser._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    try {
      const res = await axios.post('/messages', message);
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="messenger">
      <div className="chatMenu">
        <div className="chatMenuWrapper">
          <h4>Followings</h4>
          {/* Display the list of followings to start a chat */}
          {followings.map((following) => (
            <div key={following._id} className="conversation" onClick={() => setCurrentChat(following)}>
              <img
                className="conversationImg"
                src={following.profilePicture || '/assets/noPic.png'}
                alt=""
              />
              <span className="conversationName">{following.username}</span>
            </div>
          ))}

          <h4>Followers</h4>
          {/* Display the list of followers to start a chat */}
          {followers.map((follower) => (
            <div key={follower._id} className="conversation" onClick={() => setCurrentChat(follower)}>
              <img
                className="conversationImg"
                src={follower.profilePicture || '/assets/noPic.png'}
                alt=""
              />
              <span className="conversationName">{follower.username}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="chatBox">
        <div className="chatBoxWrapper">
          {currentChat ? (
            <>
              <div className="chatBoxTop">
                {messages.map((m) => (
                  <div key={m._id} className={m.senderId === currentUser._id ? 'message own' : 'message'}>
                    <div className="messageTop">
                      <img
                        className="messageImg"
                        src={m.senderId === currentUser._id ? currentUser.profilePicture : currentChat.profilePicture}
                        alt=""
                      />
                      <p className="messageText">{m.text}</p>
                    </div>
                    <div className="messageBottom">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="chatBoxBottom">
                <textarea
                  className="chatMessageInput"
                  placeholder="Write something..."
                  onChange={(e) => setNewMessage(e.target.value)}
                  value={newMessage}
                ></textarea>
                <button className="chatSubmitButton" onClick={handleSubmit}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <span className="noConversationText">Open a conversation to start a chat.</span>
          )}
        </div>
      </div>
    </div>
  );
}
