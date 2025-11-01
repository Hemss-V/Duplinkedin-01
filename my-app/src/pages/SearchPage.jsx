// src/pages/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchUsers } from '../services/api';
import Navbar from '../components/common/Navbar';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q'); // Gets the 'q' from /search?q=sam

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // This effect runs every time the 'query' in the URL changes
    if (!query) {
      setResults([]); // Clear results if query is empty
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await searchUsers(query);
        setResults(response.data);
      } catch (err) {
        console.error('Search failed:', err);
        setError(err.response?.data?.error || 'Failed to fetch search results.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]); // Re-run the search when the query parameter changes

  // Helper function to render the results
  const renderResults = () => {
    if (loading) {
      return <div className="search-status">Loading results...</div>;
    }

    if (error) {
      return <div className="search-status error">{error}</div>;
    }

    if (results.length === 0 && query) {
      return <div className="search-status">No users found matching "{query}".</div>;
    }
    
    if (results.length === 0 && !query) {
        return <div className="search-status">Please enter a name to search.</div>;
    }

    return (
      <div className="search-results-list">
        {results.map((user) => (
          <div key={user.user_id} className="search-result-item">
            {/* You could add: <img src={user.profile_image_url || 'default-avatar.png'} alt={user.name} /> */}
            <div className="search-result-info">
              <Link to={`/profile/${user.user_id}`} className="search-result-name">
                {user.name}
              </Link>
              <p className="search-result-headline">{user.headline || 'No headline'}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="search-page-wrapper">
      <Navbar /> 
      <div className="page-layout">
        {/* Column 1: Left Sidebar (empty for now) */}
        {/* You can copy/paste your LeftSidebar component here if you have one */}
        <aside className="left-sidebar">
          {/* <LeftSidebar /> */}
        </aside>

        {/* Column 2: Main Content */}
        <main>
          {query && <h2>Search Results for "{query}"</h2>}
          {renderResults()}
        </main>

        {/* Column 3: Right (empty) */}
        <aside>
          {/* This is the empty 3rd column from your layout */}
        </aside>
      </div>
    </div>
  );
};

export default SearchPage;