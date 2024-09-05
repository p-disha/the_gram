import { useEffect, useState } from 'react';
import axios from 'axios';
import DefaultProfilePic from '../../images/noPic.png';

export default function Conversation({ conversation, currentUser }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const friendId = conversation.participants.find((p) => p !== currentUser._id); // Change to `participants`

    const getUser = async () => {
      try {
        const res = await axios.get('/users?userId=' + friendId);
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [conversation, currentUser]);

  return (
    <div className="conversation">
      <img className="conversationImg" src={user?.profilePicture || DefaultProfilePic} alt="" />
      <span className="conversationName">{user?.username}</span>
    </div>
  );
}
