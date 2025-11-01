import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { bindPageClick } from "../../services/bindpageclick";

function StoryDetail() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await bindPageClick('Success-Story');
        if (response?.data?.response?.sections) {
          const foundStory = response.data.response.sections.find(
            section => section.sectionId === sectionId
          );
          if (foundStory) {
            setStory(foundStory);
          } else {
            setError('Story not found');
          }
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load story');
        setLoading(false);
      }
    };

    fetchStory();
  }, [sectionId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container my-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container my-5">
          <div className="alert alert-danger">
            {error}
            <button className="btn btn-primary ms-3" onClick={() => navigate('/success-story')}>
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <div className="d-flex align-items-center mb-4">
          <button 
            className="btn btn-link text-decoration-none"
            onClick={() => navigate('/success-story')}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Stories
          </button>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-4">{story?.name}</h2>
            <div className="rich-text-content">
              <div dangerouslySetInnerHTML={{ __html: story?.data?.subject }} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default StoryDetail;