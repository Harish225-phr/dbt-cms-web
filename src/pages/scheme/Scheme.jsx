import React, { useState, useEffect } from 'react'
import Navbar from '../../components/navbar/Navbar'
import Footer from '../../components/footer/Footer'
import {getSchemeList} from '../../services/schemne'
import './Scheme.css'

function Scheme() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const response = await getSchemeList();
        setDepartments(response?.responseObject || []);
        console.log('Fetched schemes:', response);
      } catch (err) {
        setError('Failed to fetch schemes');
        console.error('Error fetching schemes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  const handleSchemeClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="schemes-container">
          <div className="loading">Loading schemes...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="schemes-container">
          <div className="error">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div className="schemes-container">
        <div className="container FontSize rich-text-container table">
          <h3 className="mb-3">Government Schemes</h3>
        </div>
        <div className="schemes-content">
          {departments.map((department, deptIndex) => (
            <div key={department.departmentId || deptIndex} className="department-section">
              <h2 className="department-title">
                {department.departmentName} 
                <span className="scheme-count">({department.noOfSchemes} schemes)</span>
              </h2>
              
              {department.masterSchemes && department.masterSchemes.length > 0 ? (
                <ul className="schemes-list">
                  {department.masterSchemes.map((scheme, schemeIndex) => (
                    <li key={scheme.id || schemeIndex} className="scheme-item">
                      <span className="scheme-number">{schemeIndex + 1}.</span>
                      {scheme.url ? (
                        <button
                          className="scheme-link"
                          onClick={() => handleSchemeClick(scheme.url)}
                          title={`Click to open ${scheme.name}`}
                        >
                          {scheme.name}
                        </button>
                      ) : (
                        <span className="scheme-name">{scheme.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-schemes">No schemes available for this department.</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Scheme