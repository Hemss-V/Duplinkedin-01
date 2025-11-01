// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getUserProfile, 
  getConnectionCount, 
  sendConnectionRequest, 
  acceptConnectionRequest 
} from '../services/api';

// Import common components
import Navbar from '../components/common/Navbar.jsx';
import LeftSidebar from '../components/common/LeftSidebar.jsx';
import Modal from '../components/common/Modal.jsx'; // For future "Edit Profile"
import CreatePostForm from '../components/Post/CreatePostForm.jsx'; // For sidebar modal

function ProfilePage() {
  const { userId } = useParams(); // Get the user ID from the URL
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [connectionCount, setConnectionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // For sidebar "Create Post"

  // Check if the user is viewing their own profile
  const isSelf = currentUser && currentUser.userId === parseInt(userId);

  // Function to fetch all profile data
  const fetchProfileData = useCallback(() => {
    setLoading(true);
    
    // Fetch profile and connection count at the same time
    const profilePromise = getUserProfile(userId);
    const countPromise = getConnectionCount(userId);

    Promise.all([profilePromise, countPromise])
      .then(([profileRes, countRes]) => {
        setProfile(profileRes.data);
        setConnectionCount(countRes.data.count);
      })
      .catch(err => {
        console.error("Error fetching profile data:", err);
        setError("Could not load profile. The user may not exist.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]); // Re-fetch if the userId in the URL changes

  // Fetch data on component mount
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Handler for connection actions on this page
  const handleConnectionAction = async () => {
    if (!profile) return;
    
    const status = profile.connectionStatus;
    try {
      if (status === 'not_connected') {
        await sendConnectionRequest(userId);
      } else if (status === 'pending_received') {
        await acceptConnectionRequest(userId);
      }
      // Refresh the profile data to show the new status
      fetchProfileData(); 
    } catch (err) {
      console.error("Error in connection action:", err);
      setError("An error occurred. Please try again.");
    }
  };

  // Renders the correct button based on connection status
  const renderActionButtons = () => {
    if (isSelf) {
      // You can wire this to a modal later
      return <button className="connect-button connected" onClick={() => alert('Edit Profile modal coming soon!')}>Edit Profile</button>;
    }

    if (!profile) return null;

    switch (profile.connectionStatus) {
      case 'not_connected':
        return <button className="connect-button not_connected" onClick={handleConnectionAction}>Connect</button>;
      case 'pending_sent':
        return <button className="connect-button pending_sent" disabled>Request Sent</button>;
      case 'pending_received':
        return <button className="connect-button pending_received" onClick={handleConnectionAction}>Accept</button>;
      case 'connected':
        // If connected, show a "Message" button that links to the chat
        return <button className="message-button" onClick={() => navigate(`/messages/${userId}`)}>Message</button>;
      default:
        return null;
    }
  };

  // Handler for the sidebar "Create Post" modal
  const handlePostCreated = () => {
    setIsModalOpen(false);
    // No need to refresh profile, but you could refresh feed if you wanted
  };

  // Show loading state
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="page-layout">
          <LeftSidebar onOpenCreatePostModal={() => setIsModalOpen(true)} />
          <main className="profile-container"><div>Loading profile...</div></main>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div>
        <Navbar />
        <div className="page-layout">
          <LeftSidebar onOpenCreatePostModal={() => setIsModalOpen(true)} />
          <main className="profile-container"><div style={{ color: 'red' }}>{error}</div></main>
        </div>
      </div>
    );
  }

  // Show main content
  return (
    <div>
      <Navbar />
      
      {/* Sidebar Create Post Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreatePostForm onPostCreated={handlePostCreated} />
      </Modal>

      <div className="page-layout">
        <LeftSidebar onOpenCreatePostModal={() => setIsModalOpen(true)} />
        
        <main className="profile-container">
          {/* This uses the .profile-card style from index.css */}
          <div className="profile-card">
            <h1>{profile.name}</h1>
            <p className="profile-headline">{profile.headline || "No headline provided"}</p>
            
            {/* Clickable link to see YOUR connections (per our last discussion) */}
            <Link to="/connections" className="profile-connections">
              {connectionCount} {connectionCount === 1 ? 'Connection' : 'Connections'}
            </Link>

            {/* Renders the correct Connect/Pending/Message button */}
            <div className="profile-actions">
              {renderActionButtons()}
            </div>
            
            <div className="profile-summary">
              <h2>About</h2>
              <p>{profile.description || "No description provided."}</p>
            </div>
          </div>
          
          {/* You can add sections for Experience, Education, etc. here later */}
          
        </main>
        
        <aside className="right-sidebar">
          {/* Placeholder */}
        </aside>
      </div>
    </div>
  );
}

export default ProfilePage;
