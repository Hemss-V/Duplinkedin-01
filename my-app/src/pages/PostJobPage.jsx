// src/pages/PostJobPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar.jsx';
import LeftSidebar from '../components/common/LeftSidebar.jsx';

function PostJobPage() {
  // Fields for your new 'jobs' table
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const isEmployer = currentUser && currentUser.description === '0';

  // If a non-employer tries to access this page, redirect them
  useEffect(() => {
    // We add a check for currentUser to prevent redirect before auth state is loaded
    if (currentUser && !isEmployer) {
      navigate('/jobs'); // or navigate('/')
    }
  }, [isEmployer, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Data for your new 'jobs' table
    const jobData = { title, company, location, description };

    try {
      await createJob(jobData);
      setLoading(false);
      navigate('/jobs'); // Redirect to job offers page on success
    } catch (err) {
      console.error("Error posting job:", err);
      setError(err.response?.data?.error || "Failed to post job.");
      setLoading(false);
    }
  };

  // Don't render the form if they aren't an employer
  // or if auth is still loading
  if (!currentUser || !isEmployer) {
    return (
      <div>
        <Navbar />
        <div className="page-layout">
          <LeftSidebar />
          <main>
            <p>You do not have permission to post jobs. Redirecting...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="page-layout">
        <LeftSidebar />
        <main className="feed-container">
          <h1>Post a New Job</h1>
          <p>Fill out the form below to post a job opening.</p>
          
          <div className="auth-form" style={{ maxWidth: '100%', padding: '2rem', marginTop: '20px' }}>
            <form onSubmit={handleSubmit}>
              {error && <p className="auth-error">{error}</p>}
              
              {/* --- UPDATED FORM FIELDS --- */}
              <div className="form-group">
                <label htmlFor="title">Job Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="company">Company Name</label>
                <input
                  type="text"
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location (e.g., "City, State" or "Remote")</label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Job Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="10"
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <button type="submit" disabled={loading} style={{width: 'auto', padding: '0.75rem 1.5rem'}}>
                {loading ? 'Posting...' : 'Post Job'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PostJobPage;