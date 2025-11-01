// src/pages/JobOffersPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../services/api';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import Navbar from '../components/common/Navbar.jsx';
import LeftSidebar from '../components/common/LeftSidebar.jsx';

// Simple function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

function JobOffersPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth(); // Get the logged-in user

  // Check if the user is an employer (description === '0')
  const isEmployer = currentUser && currentUser.description === '0';

  useEffect(() => {
    setLoading(true);
    getJobs()
      .then(res => {
        setJobs(res.data);
      })
      .catch(err => {
        console.error("Error fetching jobs:", err);
        setError("Could not load job offers.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <Navbar />
      <div className="page-layout">
        <LeftSidebar />
        <main className="feed-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Job Offers</h1>
            
            {/* --- THIS IS THE NEW RULE --- */}
            {isEmployer && (
              <Link to="/post-job" className="navbar-button" style={{ textDecoration: 'none' }}>
                Post a Job
              </Link>
            )}
          </div>

          <div className="job-list" style={{marginTop: '20px'}}>
            {loading && <div>Loading jobs...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            
            {!loading && !error && jobs.length === 0 && (
              <p>No job offers posted yet.</p>
            )}

            {!loading && !error && jobs.map(job => (
              // We can reuse the .post-container style
              <div key={job.job_id} className="post-container">
                <div className="post-header">
                  <div>
                    {/* --- UPDATED FIELDS --- */}
                    <h2 style={{ margin: '0 0 5px 0' }}>{job.title}</h2>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{job.company}</p>
                    <p style={{ margin: 0, color: '#555' }}>{job.location}</p>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div className="post-time">
                      Posted by {job.posted_by_name}
                    </div>
                    <div className="post-time" style={{marginTop: '5px'}}>
                      {formatDate(job.created_at)}
                    </div>
                  </div>
                </div>
                <div className="post-content" style={{whiteSpace: 'pre-wrap'}}>
                  {/* --- UPDATED FIELD --- */}
                  {job.description}
                </div>
              </div>
            ))}
          </div>
        </main>
        <aside className="right-sidebar">
          {/* Placeholder */}
        </aside>
      </div>
    </div>
  );
}

export default JobOffersPage;