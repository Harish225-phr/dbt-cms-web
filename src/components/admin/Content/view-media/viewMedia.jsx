import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { viewPageClick } from '../../../../services/viewPageContent';
import { addMedia } from '../../../../services/addMedia';
import { addNotification } from '../../../../services/addSection';
import { viewMedia } from '../../../../services/viewMedia';
import { sectionUpdate } from '../../../../services/sectionUpdate';
import 'bootstrap/dist/js/bootstrap.bundle.min'; 
import { Link } from 'react-router-dom';

// Loading component
const Loading = () => (
  <div className="d-flex justify-content-center align-items-center">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function ViewMedia({ pageId, onNavigateBack }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const slug = location.state?.slug || sessionStorage.getItem('selectedPageSlug');
  console.log('Component loaded with slug:', slug);
  const pageIdFromLocation = location.state?.pageId;
  
  // Component initialization and logging
  useEffect(() => {
    console.log('=== viewMedia component mounted ===');
    console.log('Page loaded with pageId from route:', pageId);
    const storedPageId = sessionStorage.getItem("selectedPageId");
    console.log('PageId in session storage:', storedPageId);
    
    if (!pageId && !storedPageId) {
      console.warn('⚠️ No pageId available from route or session storage. Media data cannot be fetched.');
    } else {
      console.log(`✅ Will use pageId: ${pageId || storedPageId}`);
    }
  }, [pageId]);

  const [mediaResponse, setMediaResponse] = useState();
  const [formData, setFormData] = useState({
    name: '',
    file: '',
    isNew: false,
    mediaType: 'image', // 'image' or 'video'
    youtubeLink: ''
  });
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaData, setMediaData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editSectionId, setEditSectionId] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState('');

  const addModalRef = useRef(null);
  const updateModalRef = useRef(null);
  const modalRef = useRef(null);

  // To track latest fetch request
  const latestFetchId = useRef(0);

  const fetchMedia = useCallback(async () => {
    // Use pageId from props or from session storage
    const idToUse = pageId || sessionStorage.getItem("selectedPageId");
    if (!idToUse) {
      console.warn("No pageId available to fetch media");
      return;
    }

    console.log(`Fetching media content for pageId: ${idToUse}`);
    setLoading(true);
    const currentFetchId = ++latestFetchId.current;
    try {
      const result = await viewPageClick(idToUse);
      // Only update if this is the latest fetch
      if (currentFetchId === latestFetchId.current) {
        console.log("API result:", result);
        const sections = result?.data?.response?.sections || [];
        setMediaData(sections);
      }
    } catch (error) {
      if (currentFetchId === latestFetchId.current) {
        console.error("Error fetching media content:", error);
        setMediaData([]);
      }
    } finally {
      if (currentFetchId === latestFetchId.current) {
        setLoading(false);
      }
    }
  }, [pageId]);

  useEffect(() => {
    // Reset media data when pageId changes to avoid showing stale data
    setMediaData([]);
    
    // If pageId isn't available from location state, check if it's in session storage
    const storedPageId = sessionStorage.getItem("selectedPageId");
    
    if (!pageId && storedPageId) {
      console.log("Using pageId from sessionStorage:", storedPageId);
      // Call the API with the pageId from session storage
      const fetchWithStoredId = async () => {
        setLoading(true);
        try {
          const result = await viewPageClick(storedPageId);
          console.log("API result with stored pageId:", result);
          const sections = result?.data?.response?.sections || [];
          setMediaData(sections);
        } catch (error) {
          console.error("Error fetching with stored pageId:", error);
          setMediaData([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchWithStoredId();
    } else {
      // Use the pageId from location state
      fetchMedia();
    }
  }, [fetchMedia, pageId]);

  const handleFileUpload = async (file) => {
    // Only allow image and video files
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    
    if (!allowedImageTypes.includes(file.type) && !allowedVideoTypes.includes(file.type)) {
      alert('Invalid file type. Please select an image (JPG, PNG, GIF) or video (MP4, WebM, OGG) file');
      return;
    }
    
    // Set media type for preview
    let isValidSize = true;
    if (allowedImageTypes.includes(file.type)) {
      setMediaType('image');
      
      // Check image dimensions before upload (1250x400 pixels only)
      isValidSize = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;
          console.log(`Image dimensions: ${width}x${height}`);
          
          if (width === 1200 && height === 450) {
            resolve(true);
          } else {
            alert(`Image must be exactly 1200×450 pixels. Your image is ${width}×${height} pixels.`);
            resolve(false);
          }
        };
        img.src = URL.createObjectURL(file);
      });
      
      if (!isValidSize) {
        return;
      }
    } else {
      setMediaType('video');
    }
    
    // Create file preview
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      setMediaPreview(e.target.result);
    };
    fileReader.readAsDataURL(file);
    
    setLoading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('category', 'HPDBT');

      console.log('Uploading file:', file.name);
      const result = await addMedia(uploadFormData);
      console.log('Response structure:', JSON.stringify(result));
      console.log('Upload result:', result);
      
      if (result.success) {
        setMediaResponse(result.data.response);
        setUploadedFileName(file.name);
        setFormData(prev => ({
          ...prev,
          file: file.name
        }));
      } else {
        console.error('Upload failed:', result.message);
      }
    } catch (error) {
      console.error('Error during file upload:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMedia = async (section) => {
    setLoading(true);
    try {
      const documentId = section.data?.documentId;
      const mediaType = section.data?.mediaType;
      
      // If it's a YouTube video, open the YouTube link directly
      if (mediaType === 'video' || (typeof documentId === 'string' && documentId.includes('youtube.com'))) {
        window.open(documentId, '_blank');
        setLoading(false);
        return;
      }
      
      // For uploaded images, use the existing logic
      const mediaId = typeof documentId === 'object' ? documentId.mediaId : documentId;
      
      const response = await viewMedia(mediaId);
      console.log("Response:", response);

      if (response.success) {
        // Create an object URL for the blob
        const objectUrl = URL.createObjectURL(response.data);
        
        // Open the media in a new tab
        window.open(objectUrl, '_blank');
      } else {
        console.error("Failed to view media:", response.message);
      }
    } catch (error) {
      console.error("Error viewing media:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to validate YouTube URL
  const isValidYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+(&.*)?$/;
    return youtubeRegex.test(url);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === 'file' && files.length > 0) {
      handleFileUpload(files[0]);
    } else if (name === 'mediaType') {
      // Reset form fields when media type changes
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        file: '',
        youtubeLink: '',
      }));
      setUploadedFileName('');
      setMediaResponse(null);
      setMediaPreview(null);
      setMediaType('');
      
      // Clear file input
      const fileInput = document.querySelector('input[name="file"]');
      if (fileInput) fileInput.value = '';
    } else if (name === 'youtubeLink') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      
      // Set mediaResponse for YouTube links (we'll use the URL as the identifier)
      if (value && isValidYouTubeUrl(value)) {
        setMediaResponse(value);
      } else {
        setMediaResponse(null);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const openEditModal = (section) => {
    // Determine if it's a YouTube video or uploaded file
    const isYouTubeVideo = section.data?.subject && section.data?.subject.includes('youtube.com');
    
    setFormData({
      name: section.name || '',
      file: isYouTubeVideo ? '' : section.data?.subject || '',
      isNew: section.data?.isNew || false,
      mediaType: isYouTubeVideo ? 'video' : 'image',
      youtubeLink: isYouTubeVideo ? section.data?.subject || '' : ''
    });
    setUploadedFileName(isYouTubeVideo ? '' : section.data?.subject || '');
    setMediaResponse(section.data?.documentId || null);
    setIsEditing(true);
    setEditSectionId(section.sectionId);
    
    // Reset media preview
    setMediaPreview(null);
    setMediaType('');
    
    if (updateModalRef.current && window.bootstrap) {
      const modalInstance = window.bootstrap.Modal.getOrCreateInstance(updateModalRef.current);
      modalInstance.show();
    }
  };

  // Utility to fully close and reset add modal
  const closeAddModal = () => {
    setFormData({ name: '', file: '', isNew: false, mediaType: 'image', youtubeLink: '' });
    setUploadedFileName('');
    setMediaResponse(null);
    setMediaPreview(null);
    setMediaType('');
    
    const fileInput = document.querySelector('#addMediaModal input[name="file"]');
    if (fileInput) fileInput.value = '';
    
    if (addModalRef.current && window.bootstrap) {
      const modalInstance = window.bootstrap.Modal.getOrCreateInstance(addModalRef.current);
      modalInstance.hide();
    }
    
    setTimeout(() => {
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style = '';
    }, 300);
  };

  // Utility to fully close and reset update modal
  const closeUpdateModal = () => {
    setFormData({ name: '', file: '', isNew: false, mediaType: 'image', youtubeLink: '' });
    setUploadedFileName('');
    setIsEditing(false);
    setEditSectionId(null);
    setMediaResponse(null);
    setMediaPreview(null);
    setMediaType('');
    
    const fileInput = document.querySelector('#updateMediaModal input[name="file"]');
    if (fileInput) fileInput.value = '';
    
    if (updateModalRef.current && window.bootstrap) {
      const modalInstance = window.bootstrap.Modal.getOrCreateInstance(updateModalRef.current);
      modalInstance.hide();
    }
    
    setTimeout(() => {
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style = '';
    }, 300);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    // Validation (keep as before)
    const effectiveMediaType = slug === 'Banner' ? 'image' : formData.mediaType;
    if (effectiveMediaType === 'image') {
      if (!mediaResponse) {
        return;
      }
    } else if (formData.mediaType === 'video') {
      if (!formData.youtubeLink) {
        return;
      }
      if (!isValidYouTubeUrl(formData.youtubeLink)) {
        return;
      }
    }

    setLoading(true);
    try {
      // Construct the payload exactly as requested
      // Extract extension and contentType from uploaded file if available
      let extension = "";
      let contentType = "";
      if (formData.mediaType === 'image' && formData.file) {
        const fileNameParts = formData.file.split('.');
        extension = fileNameParts.length > 1 ? fileNameParts.pop() : "";
        // Try to get contentType from mediaResponse if available
        if (mediaResponse && mediaResponse.contentType) {
          contentType = mediaResponse.contentType;
        } else if (extension) {
          // Fallback: guess contentType from extension
          if (extension === 'jpg' || extension === 'jpeg') contentType = 'image/jpeg';
          else if (extension === 'png') contentType = 'image/png';
          else if (extension === 'gif') contentType = 'image/gif';
          else if (extension === 'webp') contentType = 'image/webp';
          else if (extension === 'svg') contentType = 'image/svg+xml';
          else contentType = 'image/' + extension;
        }
      }
      // Always send status: "Active" and priority: "1"
      // For Banner, force status ACTIVE in all places
      const payload = {
        pageId: sessionStorage.getItem("selectedPageId") || "",
        section: {
          name: formData.name || "",
          data: {
            subject: formData.mediaType === 'image' ? formData.file : formData.youtubeLink || "",
            description: "",
            documentId: {
              createdOn: null,
              mediaId: effectiveMediaType === 'image' ? (mediaResponse.mediaId || mediaResponse || "") : "",
              extension: extension,
              fileName: formData.mediaType === 'image' ? formData.file : "",
              status: "ACTIVE",
              contentType: contentType
            },
            status: "ACTIVE"
          },
          priority: "1",
          status: "ACTIVE"
        }
      };

      console.log('Sending payload to addNotification:', payload);

      const result = await addNotification(payload);

      console.log('Add media result:', result);

      // Always fetch latest media after add (for instant UI update)
      await fetchMedia();
    } catch (error) {
      console.error('Error adding media:', error);
    } finally {
      setLoading(false);
      closeAddModal();
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    // Force image type for Banner pages
    const effectiveMediaType = slug === 'Banner' ? 'image' : formData.mediaType;
    
    // Validation based on media type
    if (effectiveMediaType === 'image') {
      if (!mediaResponse && !uploadedFileName) {
        return;
      }
    } else if (formData.mediaType === 'video') {
      if (!formData.youtubeLink) {
        return;
      }
      if (!isValidYouTubeUrl(formData.youtubeLink)) {
        return;
      }
    }
    
    setLoading(true);
    try {
      // For image uploads, use the uploaded file info or existing data
      // For YouTube videos, use the URL directly
      const documentId = effectiveMediaType === 'image' 
        ? (mediaResponse?.mediaId || mediaResponse)
        : formData.youtubeLink;
      
      const subjectData = effectiveMediaType === 'image' 
        ? formData.file 
        : formData.youtubeLink;
      
      const updatedSection = {
        sectionId: editSectionId,
        name: formData.name,
        data: {
          subject: subjectData,
          documentId: documentId,
          status: 'ACTIVE',
          isNew: formData.isNew,
          mediaType: effectiveMediaType
        },
        status: 'ACTIVE',
        priority: 0.8,
      };
      
      const payload = {
        pageId: pageId || sessionStorage.getItem("selectedPageId"),
        section: updatedSection
      };
      
      console.log('Sending payload to sectionUpdate:', payload);
      
      const result = await sectionUpdate(payload);
      
      console.log('Update media result:', result);
      
      if (result.success) {
        // Update the UI immediately
        setMediaData(prevData => {
          return prevData.map(item => {
            if (item.sectionId === editSectionId) {
              // Return the updated section
              return updatedSection;
            }
            return item;
          });
        });
        
        closeUpdateModal();
      } else {
        console.error('Error updating media:', result.message);
      }
    } catch (error) {
      console.error('Error updating media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (section) => {
    // Temporarily set loading state for better UI feedback
    setLoading(true);
    
    try {
      // Calculate new status
      const updatedStatus = section.data.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      
      // Get the page ID to use
      const idToUse = pageId || sessionStorage.getItem("selectedPageId");
      if (!idToUse) {
        console.error("No pageId available for status update");
        setLoading(false);
        return;
      }
      
      // Create the API payload
      const payload = {
        pageId: idToUse,
        section: {
          sectionId: section.sectionId,
          name: section.name,
          data: {
            ...section.data,
            status: updatedStatus,
          },
          status: updatedStatus,
          priority: section.priority || 0.8,
        },
      };
      
      console.log('Sending payload to sectionUpdate for status change:', payload);
      
      // Call the API to update the status
      const result = await sectionUpdate(payload);
      console.log('Status update result:', result);
      
      if (result.success) {
        // Update the UI immediately without refetching
        setMediaData(prevData => {
          return prevData.map(item => {
            if (item.sectionId === section.sectionId) {
              // Create a new object with updated status
              return {
                ...item,
                data: {
                  ...item.data,
                  status: updatedStatus
                },
                status: updatedStatus
              };
            }
            return item;
          });
        });
        console.log('UI updated with new status');
      } else {
        console.error("Status update failed:", result.message);
        // Refresh the data to ensure UI matches backend state
        await fetchMedia();
      }
    } catch (error) {
      console.error("Error updating media status:", error);
      // Re-fetch to ensure UI matches backend state
      await fetchMedia();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container FontSize">
      {/* Add Media Modal */}
      <div
        className="modal fade"
        id="addMediaModal"
        tabIndex="-1"
        ref={addModalRef}
        aria-labelledby="addMediaModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <form onSubmit={handleAddSubmit}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="addMediaModalLabel">
                  Add {slug} Media
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={closeAddModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Media Name</label>
                  <input
                    type="text"
                    className="form-control fontsize"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder='Enter Media Name'
                    required
                  />
                  <div className="mt-4 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isNewAdd"
                      name="isNew"
                      checked={formData.isNew || false}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="isNewAdd">
                      Mark as New / Featured
                    </label>
                  </div>
                </div>
                
                {slug !== 'Banner' && (
                  <div className="mb-3">
                    <label className="form-label">Media Type</label>
                    <select
                      className="form-select fontsize"
                      name="mediaType"
                      value={formData.mediaType}
                      onChange={handleChange}
                      required
                    >
                      <option value="image">Image Upload</option>
                      <option value="video">YouTube Video</option>
                    </select>
                    <small className="form-text text-muted">
                      Choose whether to upload an image or add a YouTube video link
                    </small>
                  </div>
                )}

                {formData.mediaType === 'image' ? (
                  <div className="mb-3">
                    <label className="form-label">Choose Image File</label>
                    <input
                      type="file"
                      className="form-control fontsize"
                      name="file"
                      accept="image/*"
                      onChange={handleChange}
                      required
                    />
                    <small className="form-text text-muted">
                      Supported formats: JPG, PNG, GIF, WebP, SVG
                    </small>
                    {slug !== 'Multi-Media' && (
                      <div className="alert alert-warning mt-2">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>Note:</strong> Images must be exactly 1200×450 pixels. Other sizes will be rejected.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-3">
                    <label className="form-label">YouTube Video Link</label>
                    <input
                      type="url"
                      className="form-control fontsize"
                      name="youtubeLink"
                      value={formData.youtubeLink}
                      onChange={handleChange}
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                    />
                    <small className="form-text text-muted">
                      Enter a valid YouTube video URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                    </small>
                    {formData.youtubeLink && !isValidYouTubeUrl(formData.youtubeLink) && (
                      <div className="alert alert-danger mt-2">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        Please enter a valid YouTube URL
                      </div>
                    )}
                  </div>
                )}
                
                {mediaPreview && (
                  <div className="mt-3 text-center">
                    <p className="mb-2">Preview:</p>
                    {mediaType === 'image' ? (
                      <img 
                        src={mediaPreview} 
                        alt="Media preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                        className="img-thumbnail"
                      />
                    ) : (
                      <video 
                        src={mediaPreview} 
                        controls 
                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                        className="img-thumbnail"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                )}
                
                {loading && (
                  <div className="alert alert-info mt-2">
                    <div className="d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <span>Uploading file, please wait...</span>
                    </div>
                  </div>
                )}
                
                {uploadedFileName && !loading && (
                  <div className="alert alert-success mt-2">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-check-circle me-2"></i>
                      <div>
                        <strong>File uploaded successfully!</strong>
                        <div>File: {uploadedFileName}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary px-5 shadow-sm me-2 fontsize"
                  data-bs-dismiss="modal"
                  onClick={closeAddModal}
                  disabled={loading}
                >
                  Close
                </button>
                <button 
                  type="submit" 
                  className="btn shadow-sm btn-primary px-5 fontsize"
                  disabled={loading || (formData.mediaType === 'image' && !mediaResponse) || (formData.mediaType === 'video' && !formData.youtubeLink)}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Update Media Modal */}
      <div
        className="modal fade"
        id="updateMediaModal"
        tabIndex="-1"
        ref={updateModalRef}
        aria-labelledby="updateMediaModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <form onSubmit={handleUpdateSubmit}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="updateMediaModalLabel">
                  Update {slug} Media
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={closeUpdateModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Media Name</label>
                  <input
                    type="text"
                    className="form-control fontsize"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder='Enter Media Name'
                    required
                  />
                  <div className="mt-4 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isNewUpdate"
                      name="isNew"
                      checked={formData.isNew || false}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="isNewUpdate">
                      Mark as New / Featured
                    </label>
                  </div>
                </div>
                
                {slug !== 'Banner' && (
                  <div className="mb-3">
                    <label className="form-label">Media Type</label>
                    <select
                      className="form-select fontsize"
                      name="mediaType"
                      value={formData.mediaType}
                      onChange={handleChange}
                      required
                    >
                      <option value="image">Image Upload</option>
                      <option value="video">YouTube Video</option>
                    </select>
                    <small className="form-text text-muted">
                      Choose whether to upload an image or add a YouTube video link
                    </small>
                  </div>
                )}

                {formData.mediaType === 'image' ? (
                  <div className="mb-3">
                    <label className="form-label">Choose Image File</label>
                    <input
                      type="file"
                      className="form-control fontsize"
                      name="file"
                      accept="image/*"
                      onChange={handleChange}
                    />
                    <small className="form-text text-muted">
                      Supported formats: JPG, PNG, GIF, WebP, SVG
                    </small>
                    {slug !== 'Multi-Media' && (
                      <div className="alert alert-warning mt-2">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>Note:</strong> Images must be exactly 1200×450 pixels. Other sizes will be rejected.
                      </div>
                    )}
                    {uploadedFileName && (
                      <div className="alert alert-info mt-2">
                        <i className="fas fa-info-circle me-2"></i>
                        Current file: {uploadedFileName}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-3">
                    <label className="form-label">YouTube Video Link</label>
                    <input
                      type="url"
                      className="form-control fontsize"
                      name="youtubeLink"
                      value={formData.youtubeLink}
                      onChange={handleChange}
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                    />
                    <small className="form-text text-muted">
                      Enter a valid YouTube video URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                    </small>
                    {formData.youtubeLink && !isValidYouTubeUrl(formData.youtubeLink) && (
                      <div className="alert alert-danger mt-2">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        Please enter a valid YouTube URL
                      </div>
                    )}
                  </div>
                )}
                
                {mediaPreview && (
                  <div className="mt-3 text-center">
                    <p className="mb-2">Preview:</p>
                    {mediaType === 'image' ? (
                      <img 
                        src={mediaPreview} 
                        alt="Media preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                        className="img-thumbnail"
                      />
                    ) : (
                      <video 
                        src={mediaPreview} 
                        controls 
                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                        className="img-thumbnail"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                )}
                
                {loading && (
                  <div className="alert alert-info mt-2">
                    <div className="d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <span>Uploading file, please wait...</span>
                    </div>
                  </div>
                )}
                
                {uploadedFileName && !loading && (
                  <div className="alert alert-success mt-2">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-check-circle me-2"></i>
                      <div>
                        <strong>File uploaded successfully!</strong>
                        <div>File: {uploadedFileName}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary px-5 shadow-sm me-2 fontsize"
                  data-bs-dismiss="modal"
                  onClick={closeUpdateModal}
                  disabled={loading}
                >
                  Close
                </button>
                <button 
                  type="submit" 
                  className="btn shadow-sm btn-primary px-5 fontsize"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Updating...
                    </>
                  ) : 'Update'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Media Data Table */}
      <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-0">
            {/* Back Arrow + Heading */}
            <div className="d-flex align-items-center gap-2 heading-shadow mb-0" style={{ cursor: 'pointer' }}>
              {onNavigateBack ? (
                <i 
                  className="fas fa-arrow-left fs-3 text-primary fw-bold me-2 "
                  onClick={onNavigateBack}
                ></i>
              ) : (
                <Link to="#" onClick={() => navigate(-1)}>
                  <i className="fas fa-arrow-left fs-3 text-primary fw-bold me-2"></i>
                </Link>
              )}
              <h4 className="mb-0">{slug || 'Media'} Gallery</h4>
            </div>

            {/* Add Button */}
            <button
              className="btn btn-primary fontsize px-4 py-2 shadow-sm"
              type="button"
              onClick={() => {
                setFormData({ name: '', file: '', isNew: false, mediaType: 'image', youtubeLink: '' });
                setUploadedFileName('');
                setMediaResponse(null);
                setMediaPreview(null);
                setMediaType('');
                const fileInput = document.querySelector('#addMediaModal input[name="file"]');
                if (fileInput) fileInput.value = '';
                if (addModalRef.current && window.bootstrap) {
                  const modalInstance = window.bootstrap.Modal.getOrCreateInstance(addModalRef.current);
                  modalInstance.show();
                }
              }}
            >
              Add Media
            </button>
          </div>
          
        {loading ? (
          <Loading />
        ) : mediaData.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-bordered mt-0">
              <thead className='table-primary'>
                <tr>
                  <th>Sr</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[...mediaData]
                  .sort((a, b) => {
                    // Sort active items first, inactive last
                    if (a.data?.status === 'ACTIVE' && b.data?.status !== 'ACTIVE') return -1;
                    if (a.data?.status !== 'ACTIVE' && b.data?.status === 'ACTIVE') return 1;
                    return 0;
                  })
                  .map((section, index) => {
                    const isYouTubeVideo = section.data?.mediaType === 'video' || 
                      (section.data?.subject && section.data?.subject.includes('youtube.com'));
                    
                    return (
                      <tr key={section.sectionId || index} className={section.data?.status === 'ACTIVE' ? '' : 'table-light'}>
                        <td>{index + 1}</td>
                        <td>
                          <div>
                            {section.name}
                            {section.data?.isNew && (
                              <span className="badge bg-warning text-dark ms-2">NEW</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${isYouTubeVideo ? 'bg-danger' : 'bg-success'}`}>
                            {isYouTubeVideo ? (
                              <>
                                <i className="fab fa-youtube me-1"></i>
                                Video
                              </>
                            ) : (
                              <>
                                <i className="fas fa-image me-1"></i>
                                Image
                              </>
                            )}
                          </span>
                        </td>
                        <td>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id={`switch-${section.sectionId}`}
                              checked={section.data?.status === 'ACTIVE'}
                              onChange={() => handleStatusToggle(section)}
                              disabled={loading}
                              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                            />
                            <label 
                              htmlFor={`switch-${section.sectionId}`} 
                              className={`form-check-label small ms-2 ${section.data?.status === 'ACTIVE' ? 'text-success' : 'text-danger'}`} 
                              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                            >
                              {section.data?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                            </label>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            {loading ? (
                              <button className="btn btn-primary btn-sm" disabled>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span className="visually-hidden">Loading...</span>
                              </button>
                            ) : (
                              <>
                                <button 
                                  className="btn btn-success btn-sm d-flex align-items-center gap-1"
                                  onClick={() => handleViewMedia(section)}
                                  title={isYouTubeVideo ? "Open YouTube video" : "View image in new tab"}
                                >
                                  <i className={`fas ${isYouTubeVideo ? 'fa-play' : 'fa-eye'}`}></i> 
                                  {isYouTubeVideo ? 'Play' : 'View'}
                                </button>
                                <button
                                  className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                                  onClick={() => openEditModal(section)}
                                  title="Edit media details"
                                >
                                  <i className="fas fa-edit"></i> Update
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="alert alert-info mt-4">
            <i className="fas fa-info-circle me-2"></i>
            No media content available. Use the "Add Media" button to upload images or videos.
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewMedia;