// src/pages/MessagingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import ChatSidebar from '../components/Chat/ChatSidebar.jsx';
import ChatWindow from '../components/Chat/ChatWindow.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function MessagingPage() {
  const { userId } = useParams(); // Get user ID from URL (e.g., /messages/5)
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // selectedUserId state determines which chat to show
  const [selectedUserId, setSelectedUserId] = useState(null);

  // When the component loads, check if a user ID was passed in the URL
  useEffect(() => {
    if (userId) {
      // Don't allow chatting with self
      if (currentUser && parseInt(userId) !== currentUser.userId) {
        setSelectedUserId(parseInt(userId));
      }
    }
  }, [userId, currentUser]);

  // Handle when a user is clicked in the sidebar
  const handleSelectConversation = (id) => {
    setSelectedUserId(id);
    // Update the URL without a full page reload
    navigate(`/messages/${id}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar />
      <div className="messaging-layout">
        {/* --- Left Panel --- */}
        <ChatSidebar 
          onSelectConversation={handleSelectConversation}
          selectedUserId={selectedUserId}
        />

        {/* --- Right Panel --- */}
        {selectedUserId ? (
          <ChatWindow 
            key={selectedUserId} // Force re-render when user ID changes
            selectedUserId={selectedUserId} 
          />
        ) : (
          <div className="chat-window-placeholder">
            <h2>Select a conversation to start chatting</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessagingPage;

