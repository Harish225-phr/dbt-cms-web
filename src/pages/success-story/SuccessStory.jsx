import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { bindPageClick } from "../../services/bindpageclick";

function SuccessStory() {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await bindPageClick('Success-Story');
        if (response?.data?.response?.sections) {
          setSections(response.data.response.sections);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load success stories');
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Function to truncate text to a specific number of words
  const truncateText = (text, wordCount = 20) => {
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  // Function to strip HTML tags for preview
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <h2 className="text-center mb-4">Success Stories</h2>
        
        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 g-4">
            {sections.map((story) => (
              <div key={story.sectionId} className="col">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-3 text-primary">{story.name}</h5>
                    <div className="card-text ">
                      <p>{truncateText(stripHtml(story.data?.subject || ''))}</p>
                    </div>
                    <a
                      className="mt-3 " style={{ textDecoration: 'none', fontSize: '15px', cursor: 'pointer' }}
                      onClick={() => navigate(`/success-story/${story.sectionId}`)}
                    >
                      Read More
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default SuccessStory;
