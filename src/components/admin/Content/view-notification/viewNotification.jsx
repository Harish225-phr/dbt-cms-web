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


function Notification() {
  const location = useLocation();
  const navigate = useNavigate();

  const slug = location.state?.slug || sessionStorage.getItem('selectedPageSlug');
  
  const pageId = location.state?.pageId;
  
  // Component initialization and logging
  useEffect(() => {
    console.log('=== viewNotification component mounted ===');
    console.log('Page loaded with pageId from route:', pageId);
    const storedPageId = sessionStorage.getItem("selectedPageId");
    console.log('PageId in session storage:', storedPageId);
    
    if (!pageId && !storedPageId) {
      console.warn('⚠️ No pageId available from route or session storage. Notification data cannot be fetched.');
    } else {
      console.log(`✅ Will use pageId: ${pageId || storedPageId}`);
    }
  }, [pageId]);


  const [mediaResponse, setMediaResponse] = useState();

  const [formData, setFormData] = useState({
    name: '',
    file: '',
    isNew: false
  });

  const [uploadedFileName, setUploadedFileName] = useState('');

  const [loading, setLoading] = useState(false);

  const [notificationData, setNotificationData] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editSectionId, setEditSectionId] = useState(null);

  const addModalRef = useRef(null);
  const updateModalRef = useRef(null);
  const modalRef = useRef(null);

  // To track latest fetch request
  const latestFetchId = useRef(0);

  const fetchNotification = useCallback(async () => {
    // Use pageId from props or from session storage
    const idToUse = pageId || sessionStorage.getItem("selectedPageId");
    if (!idToUse) {
      console.warn("No pageId available to fetch notifications");
      return;
    }

    console.log(`Fetching notifications for pageId: ${idToUse}`);
    setLoading(true);
    const currentFetchId = ++latestFetchId.current;
    try {
      const result = await viewPageClick(idToUse);
      // Only update if this is the latest fetch
      if (currentFetchId === latestFetchId.current) {
        console.log("API result:", result);
        const sections = result?.data?.response?.sections || [];
        console.log(`Found ${sections.length} notifications`);
        setNotificationData(sections);
      }
    } catch (error) {
      if (currentFetchId === latestFetchId.current) {
        console.error('Error fetching notification:', error);
      }
    } finally {
      if (currentFetchId === latestFetchId.current) {
        setLoading(false);
      }
    }
  }, [pageId]);

  useEffect(() => {
    // Reset notification data when pageId changes to avoid showing stale data
    setNotificationData([]);
    
    // If pageId isn't available from location state, check if it's in session storage
    const storedPageId = sessionStorage.getItem("selectedPageId");
    
    if (!pageId && storedPageId) {
      console.log("Using pageId from sessionStorage:", storedPageId);
      // Call the API with the pageId from session storage
      const fetchWithStoredId = async () => {
        setLoading(true);
        try {
          const result = await viewPageClick(storedPageId);
          const sections = result?.data?.response?.sections || [];
          setNotificationData(sections);
        } catch (error) {
          console.error('Error fetching notification with stored ID:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchWithStoredId();
    } else {
      // Use the pageId from location state
      fetchNotification();
    }
  }, [fetchNotification, pageId]);

  const handleFileUpload = async (file) => {
    // Only allow PDF files
    if (file.type !== 'application/pdf') {
      console.error('Invalid file type. Please select a PDF file');
      return;
    }
    
    setLoading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('category', 'HPDBT');

      console.log('Uploading file:', file.name);
      const result = await addMedia(uploadFormData);
      
      console.log('Upload result:', result);
      
      if (result.success) {
        // Check where the response data is in the result
        const responseData = result.data?.response || result.data;
        
        if (responseData) {
          setMediaResponse(responseData);
          // Use the file name from response, or fallback to the original file name
          const fileName = responseData.fileName || responseData.originalFileName || file.name;
          setFormData((prev) => ({ ...prev, file: fileName }));
          setUploadedFileName(fileName);
          
          // Log success instead of alert
          console.log('File uploaded successfully');
        } else {
          console.error('Invalid response format:', result);
        }
      } else {
        console.error('File upload failed:', result.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error during file upload:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMedia = async (documentId) => {
    setLoading(true);
    try {
      // Check if documentId is an object or a simple value
      const mediaId = typeof documentId === 'object' ? documentId.mediaId : documentId;
      
      const response = await viewMedia(mediaId);
      console.log("Response:", response);

      if (response.success) {
        const blob = new Blob([response.data], { type: response.contentType || "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else {
        console.error("Media not found");
      }
    } catch (error) {
      console.error("Error viewing media:", error);
    } finally {
      setLoading(false);
    }
  };

 const handleChange = (e) => {
  const { name, value, type, checked, files } = e.target;

  if (name === 'file' && files.length > 0) {
    handleFileUpload(files[0]);
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }
};


  const openEditModal = (section) => {
    setFormData({
      name: section.name || '',
      file: section.data?.subject || '',
      isNew: section.data?.isNew || false
    });
    setUploadedFileName(section.data?.subject || '');
    setMediaResponse(section.data?.documentId || null);
    setIsEditing(true);
    setEditSectionId(section.sectionId);
    if (updateModalRef.current && window.bootstrap) {
      const modalInstance = window.bootstrap.Modal.getOrCreateInstance(updateModalRef.current);
      modalInstance.show();
    }
  };

  // Utility to fully close and reset add modal
  const closeAddModal = () => {
    setFormData({ name: '', file: '', isNew: false });
    setUploadedFileName('');
    setMediaResponse(null);
    const fileInput = document.querySelector('#addNotificationModal input[name="file"]');
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
    // Reset mediaResponse to ensure next add works cleanly
    setMediaResponse(null);
  };

  // Utility to fully close and reset update modal
  const closeUpdateModal = () => {
    setFormData({ name: '', file: '', isNew: false });
    setUploadedFileName('');
    setIsEditing(false);
    setEditSectionId(null);
    setMediaResponse(null);
    const fileInput = document.querySelector('#updateNotificationModal input[name="file"]');
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
    
    // Start loading immediately when save button is clicked
    setLoading(true);
    
    // Close modal immediately on save button click
    closeAddModal();
    
    // Check if file was uploaded and mediaResponse is available
    if (!mediaResponse) {
      console.error('Please upload a file first');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Submitting notification with documentId:', mediaResponse);
      // Extract mediaId from response object if needed
      const documentId = mediaResponse.mediaId || mediaResponse;
      const payload = {
        pageId: sessionStorage.getItem("selectedPageId"),
        section: {
          name: formData.name,
          data: {
            subject: formData.file,
            documentId: documentId,
            status: 'ACTIVE',
            isNew: formData.isNew
          },
          status: 'ACTIVE',
          priority: 0.8,
        },
      };
      console.log('Sending payload to addNotification:', payload);
      const result = await addNotification(payload);
      console.log('Add notification result:', result);
      
      // Always call viewPageClick API regardless of success/failure to refresh data
      const idToUse = pageId || sessionStorage.getItem("selectedPageId");
      console.log('🔄 Force calling viewPageClick API with pageId:', idToUse);
      if (idToUse) {
        try {
          const refreshResult = await viewPageClick(idToUse);
          console.log('✅ viewPageClick API response:', refreshResult);
          if (refreshResult?.data?.response?.sections) {
            const sections = refreshResult.data.response.sections;
            console.log('📊 Setting new sections data:', sections.length, 'items');
            setNotificationData([...sections]); // Force new array to trigger re-render
          }
        } catch (refreshError) {
          console.error('❌ Error calling viewPageClick API:', refreshError);
        }
      }
      
      if (result.success) {
        console.log('✅ Notification added successfully!');
      } else {
        console.error('Failed to add notification:', result.message);
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    // Start loading immediately when save button is clicked
    setLoading(true);
    
    // Close modal immediately on save button click
    closeUpdateModal();
    
    try {
      // Extract mediaId from response object if needed
      const documentId = mediaResponse?.mediaId || mediaResponse;
      
      const payload = {
        pageId,
        section: {
          sectionId: editSectionId,
          name: formData.name,
          data: {
            subject: formData.file,
            documentId: documentId,
            status: 'ACTIVE',
            isNew: formData.isNew
          },
          status: 'ACTIVE',
          priority: 0.8,
        },
      };
      
      console.log('Sending payload to sectionUpdate:', payload);
      
      const result = await sectionUpdate(payload);
      
      console.log('Update notification result:', result);
      
      // Always call viewPageClick API regardless of success/failure to refresh data
      const idToUse = pageId || sessionStorage.getItem("selectedPageId");
      console.log('🔄 Force calling viewPageClick API with pageId:', idToUse);
      if (idToUse) {
        try {
          const refreshResult = await viewPageClick(idToUse);
          console.log('✅ viewPageClick API response:', refreshResult);
          if (refreshResult?.data?.response?.sections) {
            const sections = refreshResult.data.response.sections;
            console.log('📊 Setting new sections data:', sections.length, 'items');
            setNotificationData([...sections]); // Force new array to trigger re-render
          }
        } catch (refreshError) {
          console.error('❌ Error calling viewPageClick API:', refreshError);
        }
      }
      
      if (result.success) {
        console.log('✅ Notification updated successfully!');
      } else {
        console.error('Failed to update notification:', result.message);
      }
    } catch (error) {
      console.error('Error updating notification:', error);
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
      console.error("No page ID available. Cannot update status.");
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
      console.log('Status updated successfully in backend');
      
      // Explicitly re-fetch all notifications to ensure UI is in sync with backend
      await fetchNotification();
      
      // Force a re-render by creating a new array
      setNotificationData(prevData => [...prevData]);
    } else {
      console.error("Failed to update status:", result.message);
      // Re-fetch to ensure UI matches backend state
      await fetchNotification();
    }
  } catch (error) {
    console.error("Error updating notification status:", error);
    // Re-fetch to ensure UI matches backend state
    await fetchNotification();
  } finally {
    setLoading(false);
  }
};


  

  return (
    <div className="container FontSize">
      {/* Add Notification Modal */}
      <div
        className="modal fade"
        id="addNotificationModal"
        tabIndex="-1"
        ref={addModalRef}
        aria-labelledby="addNotificationModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <form onSubmit={handleAddSubmit}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="addNotificationModalLabel">
                  Add {slug} Notification
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
                  <label className="form-label">Notification Name</label>
                  <input
                    type="text"
                    className="form-control fontsize"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder='Enter Notification Name'
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
                      Mark as New / Important
                    </label>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Choose File</label>
                  <input
                    type="file"
                    className="form-control fontsize"
                    name="file"
                    accept="application/pdf"
                    onChange={handleChange}
                    required
                  />
                </div>
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
                  disabled={loading || !mediaResponse}
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

      {/* Update Notification Modal */}
      <div
        className="modal fade"
        id="updateNotificationModal"
        tabIndex="-1"
        ref={updateModalRef}
        aria-labelledby="updateNotificationModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <form onSubmit={handleUpdateSubmit}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="updateNotificationModalLabel">
                  Update {slug} Notification
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
                  <label className="form-label">Notification Name</label>
                  <input
                    type="text"
                    className="form-control fontsize"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder='Enter Notification Name'
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
                      Mark as New / Important
                    </label>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Choose File</label>
                  <input
                    type="file"
                    className="form-control fontsize"
                    name="file"
                    accept="application/pdf"
                    onChange={handleChange}
                  />
                </div>
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

      {/* Notification Data Table */}
      <div className="mt-4">
    <div className="d-flex justify-content-between align-items-center mb-3">
  {/* Back Arrow + Heading */}
  <div className="d-flex align-items-center gap-2 heading-shadow mb-1" style={{ cursor: 'pointer' }}>
    <Link to="#" onClick={() => navigate(-1)}><i className="fas fa-arrow-left fs-3 text-primary fw-bold me-2"></i></Link>
    <h4 className="mb-0">{slug} Details</h4>
  </div>

  {/* Add Button */}
  <button
    className="btn btn-primary fontsize px-4 py-2 shadow-sm"
    type="button"
    onClick={() => {
      setFormData({ name: '', file: '', isNew: false });
      setUploadedFileName('');
      setMediaResponse(null);
      const fileInput = document.querySelector('#addNotificationModal input[name="file"]');
      if (fileInput) fileInput.value = '';
      if (addModalRef.current && window.bootstrap) {
        const modalInstance = window.bootstrap.Modal.getOrCreateInstance(addModalRef.current);
        modalInstance.show();
      }
    }}
  >
    Add Notification
  </button>
</div>

        {loading ? (
          <Loading />
        ) : notificationData.length > 0 ? (
          <table className="table table-bordered mt-0">
            <thead className='table'>
              <tr>
                <th>Sr</th>
                <th>Name</th>
                 <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[...notificationData]
                .sort((a, b) => {
                  // Sort active items first, inactive last
                  if (a.data?.status === 'ACTIVE' && b.data?.status !== 'ACTIVE') return -1;
                  if (a.data?.status !== 'ACTIVE' && b.data?.status === 'ACTIVE') return 1;
                  return 0;
                })
                .map((section, index) => (
                <tr key={section.sectionId || index} className={section.data?.status === 'ACTIVE' ? '' : 'table-light'}>
                  <td>{index + 1}</td>
                  <td>{section.name}</td>
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
                            onClick={() => handleViewMedia(section.data?.documentId)}
                            title="View notification in new tab"
                          >
                            <i className="fas fa-eye"></i> View
                          </button>
                          <button
                            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                            onClick={() => openEditModal(section)}
                            title="Edit notification details"
                          >
                            <i className="fas fa-edit"></i> Update
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-4">No notifications available.</p>
        )}
      </div>
    </div>
  );
}

export default Notification;
