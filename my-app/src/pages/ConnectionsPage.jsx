// src/pages/ConnectionsPage.jsx
// This page shows Invitations, Requests Sent, Your Network, and Suggestions
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getConnections, 
  getAllUsersWithStatus, 
  sendConnectionRequest, 
  acceptConnectionRequest
} from '../services/api.js';

// Import common components
import Navbar from '../components/common/Navbar.jsx';
import LeftSidebar from '../components/common/LeftSidebar.jsx';
import Modal from '../components/common/Modal.jsx';
import CreatePostForm from '../components/Post/CreatePostForm.jsx';

function ConnectionsPage() {
  const [invitations, setInvitations] = useState([]); // People who sent ME a request
  const [requestsSent, setRequestsSent] = useState([]); // People I have sent a request TO
  const [connections, setConnections] = useState([]); // My accepted connections
  const [suggestions, setSuggestions] = useState([]); // People I am not connected to
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to fetch all data for the page
  const fetchPageData = () => {
    setLoading(true);

    Promise.all([
      getConnections(),
      getAllUsersWithStatus()
    ])
    .then(([connectionsRes, allUsersRes]) => {
      // 1. Set the user's accepted connections (for "My Network")
      setConnections(connectionsRes.data);

      // 2. Filter the "all users" list to find INVITATIONS
      const pendingInvitations = allUsersRes.data.filter(
        user => user.status === 'pending_received'
      );
      setInvitations(pendingInvitations);

      // 3. Filter the "all users" list to find REQUESTS SENT
      const sentRequests = allUsersRes.data.filter(
        user => user.status === 'pending_sent'
      );
      setRequestsSent(sentRequests);

      // 4. Filter the "all users" list to find SUGGESTIONS
      const suggestedUsers = allUsersRes.data.filter(
        user => user.status === 'not_connected'
      );
      setSuggestions(suggestedUsers);
    })
    .catch(err => {
      console.error("Error fetching page data:", err);
      setError("Could not load your network. Please try again.");
    })
    .finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  // This function handles BOTH sending AND accepting
  const handleConnectionAction = async (targetUserId, status) => {
    try {
      if (status === 'not_connected') {
        await sendConnectionRequest(targetUserId);
      } else if (status === 'pending_received') {
        await acceptConnectionRequest(targetUserId);
      }
      
      // Refresh all page data
      fetchPageData(); 
    } catch (err) {
      // The 400 error will appear here, but we will ignore it in the UI
      console.error("Error in connection action:", err);
    }
  };

  // Renders the correct button for the Invitations and Suggestions lists
  const renderConnectionButton = (user) => {
    switch (user.status) {
      case 'not_connected':
        return <button className="connect-button not_connected" onClick={() => handleConnectionAction(user.user_id, 'not_connected')}>Connect</button>;
      case 'pending_sent':
        return <button className="connect-button pending_sent" disabled>Request Sent</button>;
      case 'pending_received':
        return <button className="connect-button pending_received" onClick={() => handleConnectionAction(user.user_id, 'pending_received')}>Accept</button>;
      default:
        return null;
    }
  };

  const handlePostCreated = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <Navbar />
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreatePostForm onPostCreated={handlePostCreated} />
      </Modal>

      <div className="page-layout">
        <LeftSidebar onOpenCreatePostModal={() => setIsModalOpen(true)} />
        
        <main className="connections-container">
          
          {loading && <div>Loading network...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}

          {/* --- SECTION 1: INVITATIONS --- */}
          {!loading && !error && invitations.length > 0 && (
            <div className="connection-section">
              <h2>Invitations</h2>
              <div className="connection-list">
                {invitations.map(user => (
                  <div key={`invite-${user.user_id}`} className="connection-card">
                    <Link to={`/profile/${user.user_id}`} className="connection-name">{user.name}</Link>
                    <p className="connection-headline">{user.headline || "No headline"}</p>
                    <div style={{ marginTop: '10px' }}>
                      {renderConnectionButton(user)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- SECTION 2: REQUESTS SENT --- */}
          {!loading && !error && requestsSent.length > 0 && (
            <div className="connection-section" style={{marginTop: '20px'}}>
              <h2>Requests Sent</h2>
              <div className="connection-list">
                {requestsSent.map(user => (
                  <div key={`sent-${user.user_id}`} className="connection-card">
                    <Link to={`/profile/${user.user_id}`} className="connection-name">{user.name}</Link>
                    <p className="connection-headline">{user.headline || "No headline"}</p>
                    <div style={{ marginTop: '10px' }}>
                      {renderConnectionButton(user)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- SECTION 3: MY NETWORK --- */}
          {!loading && !error && (
            <div className="connection-section" style={{marginTop: '20px'}}>
              <h2 style={{ marginTop: (invitations.length > 0 || requestsSent.length > 0) ? '40px' : '0' }}>My Network</h2>
              <div className="connection-list">
                {connections.length === 0 ? (
                  <p>You haven't made any connections yet.</p>
                ) : (
                  connections.map(user => (
                    <div key={`conn-${user.user_id}`} className="connection-card">
                      <Link to={`/profile/${user.user_id}`} className="connection-name">{user.name}</Link>
                      <p className="connection-headline">{user.headline || "No headline"}</p>
                      <div style={{ marginTop: '10px' }}>
                        <Link to={`/messages/${user.user_id}`} className="message-button">Message</Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* --- SECTION 4: PEOPLE YOU MAY KNOW --- */}
          {!loading && !error && (
            <div className="connection-section" style={{marginTop: '20px'}}>
              <h2 style={{ marginTop: '40px' }}>People You May Know</h2>
              <div className="connection-list">
                {suggestions.length === 0 ? (
                  <p>No new suggestions at this time.</p>
                ) : (
                  suggestions.map(user => (
                    <div key={`suggest-${user.user_id}`} className="connection-card">
                      <Link to={`/profile/${user.user_id}`} className="connection-name">{user.name}</Link>
                      <p className="connection-headline">{user.headline || "No headline"}</p>
                      <div style={{ marginTop: '10px' }}>
                        {renderConnectionButton(user)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>

        <aside className="right-sidebar">
          {/* Placeholder */}
        </aside>
      </div>
    </div>
  );
}

export default ConnectionsPage;

