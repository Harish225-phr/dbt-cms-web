import React, { useState, useEffect } from 'react'
import Navbar from '../../components/navbar/Navbar'
import Footer from '../../components/footer/Footer'
import { bindPageClick } from '../../../src/services/bindpageclick';
import { viewMedia } from '../../../src/services/viewMedia';
import 'bootstrap/dist/css/bootstrap.min.css';

// Loading component
const Loading = () => (
  <div className="d-flex justify-content-center align-items-center my-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function Multimedia() {
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  // Function to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url) => {
    const youtubeRegex = /(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const match = url.match(youtubeRegex);
    if (match && match[3]) {
      return `https://www.youtube.com/embed/${match[3]}?autoplay=1&mute=1`;
    }
    return url;
  };

  const fetchMedia = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await bindPageClick("Multi-Media");
      const sections = res?.data?.response?.sections;

      if (Array.isArray(sections) && sections.length > 0) {
        const mediaPromises = sections.map(async (section) => {
          // Skip inactive sections
          if (section?.data?.status === 'INACTIVE') {
            return null;
          }
          
          const mediaId = section?.data?.documentId?.mediaId || section?.data?.documentId;
          const description = section?.data?.description || 'No description available';
          const heading = section?.name || 'No Title';
          const isNew = section?.data?.isNew || false;
          const mediaType = section?.data?.mediaType;
          const subject = section?.data?.subject;

          let mediaUrl = null;
          let contentType = null;
          let isYouTubeVideo = false;
          
          // Check if it's a YouTube video
          if (mediaType === 'video' || (subject && subject.includes('youtube.com'))) {
            isYouTubeVideo = true;
            mediaUrl = getYouTubeEmbedUrl(subject || mediaId);
            contentType = 'video/youtube';
          } else if (mediaId) {
            // Handle uploaded files (images/videos)
            try {
              const mediaRes = await viewMedia(mediaId);
              if (mediaRes.success) {
                contentType = mediaRes.contentType;
                const blob = new Blob([mediaRes.data], { type: contentType });
                mediaUrl = URL.createObjectURL(blob);
              }
            } catch (err) {
              console.error(`Error fetching media ID ${mediaId}:`, err);
            }
          }

          return {
            mediaUrl,
            heading,
            description,
            isNew,
            contentType,
            mediaId,
            isYouTubeVideo,
            originalUrl: subject || mediaId
          };
        });

        const mediaList = await Promise.all(mediaPromises);
        // Filter out null entries and items without mediaUrl
        const filteredMedia = mediaList.filter(item => item && item.mediaUrl);
        setMedia(filteredMedia);
        
        if (filteredMedia.length === 0 && mediaList.length > 0) {
          setError("Media files were found but could not be displayed properly.");
        }
      } else {
        setError("No media content found.");
      }
    } catch (err) {
      console.error("Error fetching media:", err);
      setError("Error loading media content");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div>
      <Navbar />
      
      <style>
        {`
          .hover-shadow {
            transition: all 0.3s ease;
          }
          .hover-shadow:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
          }
          .card-img-top {
            transition: transform 0.3s ease;
          }
          .card:hover .card-img-top {
            transform: scale(1.02);
          }
          .section-divider {
            background: linear-gradient(90deg, transparent, #007bff, transparent);
          }
        `}
      </style>

      <div className='container py-1'>

        <div className="row mb-4">

          <div className="col-12">
          </div>
        </div>
        
        {isLoading ? (
          <Loading />
        ) : error ? (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        ) : media.length === 0 ? (
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            No media content available.
          </div>
        ) : (
          <>
            {/* Images Section */}
            {media.filter(item => !item.isYouTubeVideo && !item.contentType?.startsWith('video/')).length > 0 && (
              <div className="mb-5">
                <div className="row mb-4">
                  <div className="col-12">
                    <h2 className="text-center mb-4 fw-bold text-color-primary">
                      <i className="fas fa-images me-2"></i>
                      Images Gallery
                    </h2>
                    <hr className="mx-auto section-divider" style={{ width: '100px', height: '3px', border: 'none', background: 'linear-gradient(90deg, transparent, #007bff, transparent)' }} />
                  </div>
                </div>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                  {media
                    .filter(item => !item.isYouTubeVideo && !item.contentType?.startsWith('video/'))
                    .map((item, index) => (
                      <div className="col" key={`image-${index}`}>
                        <div className="card h-100 shadow-sm hover-shadow">
                          <div className="position-relative">
                            <img 
                              src={item.mediaUrl} 
                              className="card-img-top" 
                              alt={item.heading}
                              style={{ height: '220px', objectFit: 'cover' }}
                            />
                            {item.isNew && (
                              <div className="position-absolute top-0 start-0 p-2">
                                <span className="badge bg-danger">
                                  <i className="fas fa-star me-1"></i>New
                                </span>
                              </div>
                            )}
                            <div className="position-absolute top-0 end-0 p-2">
                              <span className="badge bg-success">
                                <i className="fas fa-image me-1"></i> Image
                              </span>
                            </div>
                          </div>
                          <div className="card-body">
                            <h5 className="card-title">{item.heading}</h5>
                            <p className="card-text text-muted">{item.description}</p>
                          </div>
                          <div className="card-footer bg-white border-0">
                            <button 
                              className="btn btn-primary w-100"
                              onClick={() => {
                                window.open(item.mediaUrl, '_blank');
                              }}
                            >
                              <i className="fas fa-eye me-2"></i>
                              View Image
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Videos Section */}
            {media.filter(item => item.isYouTubeVideo || item.contentType?.startsWith('video/')).length > 0 && (
              <div className="mb-5">
                <div className="row mb-4">
                  <div className="col-12">
                    <h2 className="text-center mb-4 fw-bold text-danger">
                      <i className="fab fa-youtube me-2"></i>
                      Videos Gallery
                    </h2>
                    <hr className="mx-auto section-divider" style={{ width: '100px', height: '3px', border: 'none', background: 'linear-gradient(90deg, transparent, #dc3545, transparent)' }} />
                  </div>
                </div>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-2 g-4">
                  {media
                    .filter(item => item.isYouTubeVideo || item.contentType?.startsWith('video/'))
                    .map((item, index) => (
                      <div className="col" key={`video-${index}`}>
                        <div className="card h-100 shadow-sm hover-shadow">
                          <div className="position-relative">
                            {item.isYouTubeVideo ? (
                              <div style={{ height: '280px' }}>
                                <iframe
                                  width="100%"
                                  height="100%"
                                  src={item.mediaUrl}
                                  title={item.heading}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  style={{ borderRadius: '8px 8px 0 0' }}
                                ></iframe>
                              </div>
                            ) : (
                              <video 
                                className="card-img-top" 
                                style={{ height: '280px', objectFit: 'cover' }}
                                src={item.mediaUrl}
                                controls
                                autoPlay
                                muted
                              />
                            )}
                            {item.isNew && (
                              <div className="position-absolute top-0 start-0 p-2">
                                <span className="badge bg-danger">
                                  <i className="fas fa-star me-1"></i>New
                                </span>
                              </div>
                            )}
                            <div className="position-absolute top-0 end-0 p-2">
                              <span className="badge bg-danger">
                                <i className={`${item.isYouTubeVideo ? 'fab fa-youtube' : 'fas fa-video'} me-1`}></i>
                                {item.isYouTubeVideo ? 'YouTube' : 'Video'}
                              </span>
                            </div>
                          </div>
                          <div className="card-body">
                            <h5 className="card-title">{item.heading}</h5>
                            <p className="card-text text-muted">{item.description}</p>
                          </div>
                          <div className="card-footer bg-white border-0">
                            <button 
                              className="btn btn-danger w-100"
                              onClick={() => {
                                if (item.isYouTubeVideo) {
                                  // Convert embed URL back to watch URL for opening in new tab
                                  const videoId = item.mediaUrl.match(/embed\/([a-zA-Z0-9_-]+)/)?.[1];
                                  const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : item.originalUrl;
                                  window.open(watchUrl, '_blank');
                                } else {
                                  window.open(item.mediaUrl, '_blank');
                                }
                              }}
                            >
                              <i className="fas fa-play me-2"></i>
                              {item.isYouTubeVideo ? 'Watch on YouTube' : 'Play Video'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Multimedia