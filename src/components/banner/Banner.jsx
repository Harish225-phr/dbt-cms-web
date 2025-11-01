import React, { useState, useEffect } from 'react'
import './Banner.css'
import { bindPageClick } from '../../../src/services/bindpageclick';
import { viewMedia } from '../../../src/services/viewMedia';
import 'bootstrap/dist/css/bootstrap.min.css';

function Banner() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchBanners = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bindPageClick("Banner");
      const sections = response?.data?.response?.sections;

      if (Array.isArray(sections) && sections.length > 0) {
        const activeSections = sections.filter(section => section?.data?.status === 'ACTIVE');
        
        if (activeSections.length === 0) {
          setError("No active banners found");
          setIsLoading(false);
          return;
        }
        
        const bannerPromises = activeSections.map(async (section) => {
          const mediaId = section?.data?.documentId?.mediaId || section?.data?.documentId;
          const title = section?.name || 'Banner';
          
          if (mediaId) {
            try {
              const mediaRes = await viewMedia(mediaId);
              if (mediaRes.success) {
                const blob = new Blob([mediaRes.data], { type: mediaRes.contentType || "image/jpeg" });
                const imageUrl = URL.createObjectURL(blob);
                return {
                  imageUrl,
                  title,
                  description: section?.data?.description || ''
                };
              }
            } catch (error) {
              console.error(`Error fetching banner with ID ${mediaId}:`, error);
            }
          }
          return null;
        });

        const bannerData = await Promise.all(bannerPromises);
        const filteredBanners = bannerData.filter(banner => banner !== null);
        
        if (filteredBanners.length === 0) {
          setError("Could not load any banner images");
        } else {
          setBanners(filteredBanners);
          console.log(`Successfully loaded ${filteredBanners.length} banners`);
        }
      } else {
        setError("No banners found");
      }
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError(err.message || "Error fetching banners");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex(current => (current + 1) % banners.length);
    }, 5000); // Change banner every 5 seconds
    
    return () => clearInterval(interval);
  }, [banners.length]);

  // Handle manual navigation
  const goToPrevious = () => {
    setActiveIndex(current => 
      current === 0 ? banners.length - 1 : current - 1
    );
  };
  
  const goToNext = () => {
    setActiveIndex(current => 
      (current + 1) % banners.length
    );
  };
  
  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  if (isLoading) {
    return (
      <div className="dbt-banner d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || banners.length === 0) {
    return (
      <div className="dbt-banner d-flex justify-content-center align-items-center">
        <div className="text-center">
          <p className="text-danger">{error || "No banners available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div id="bannerCarousel" className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-indicators">
        {banners.map((_, index) => (
          <button
            key={`indicator-${index}`}
            type="button"
            data-bs-target="#bannerCarousel"
            data-bs-slide-to={index}
            className={activeIndex === index ? "active" : ""}
            aria-current={activeIndex === index ? "true" : "false"}
            aria-label={`Slide ${index + 1}`}
            onClick={() => goToSlide(index)}
          ></button>
        ))}
      </div>
      
      <div className="carousel-inner">
        {banners.map((banner, index) => (
          <div 
            key={`banner-${index}`}
            className={`carousel-item ${activeIndex === index ? "active" : ""}`}
          >
            <img 
              src={banner.imageUrl} 
              className="d-block w-100" 
              alt={banner.title || `Banner ${index + 1}`}
              style={{ height: "400px", objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
      
      {banners.length > 1 && (
        <>
          <button 
            className="carousel-control-prev" 
            type="button" 
            onClick={goToPrevious}
            aria-label="Previous"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          </button>
          <button 
            className="carousel-control-next" 
            type="button"
            onClick={goToNext}
            aria-label="Next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
          </button>
        </>
      )}
    </div>
  )
}

export default Banner