import React, { useState, useEffect, useRef } from 'react';
import { viewPageClick } from '../../../../services/viewPageContent';
import { addNotification } from '../../../../services/addSection';
import { sectionUpdate } from '../../../../services/sectionUpdate';
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const Loading = () => (
  <div className="d-flex justify-content-center align-items-center">
    <span>Loading...</span>
  </div>
);

function SuccessStory({ pageId, onNavigateBack }) {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sections, setSections] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  // Check if form is valid
  const isFormValid = formData.name.trim() !== '' && formData.description.trim() !== '';

  // Function to refresh data
  const refreshStoryData = async () => {
    try {
      const response = await viewPageClick(pageId);
      if (response.data?.response?.sections) {
        setSections(response.data.response.sections);
      }
      if (response.data) {
        setStory(response.data);
      }
    } catch (err) {
      console.error('Error refreshing story data:', err);
    }
  };

  // Handle modal close
  const handleModalClose = async () => {
    setShowModal(false);
    setFormData({ name: '', description: '' }); // Reset form
    await refreshStoryData(); // Refresh data when modal closes
  };

  // Fetch story data
  useEffect(() => {
    const fetchStory = async () => {
      try {
        console.log('Fetching story data for pageId:', pageId);
        const response = await viewPageClick(pageId);
        console.log('Fetched story data:', response);
        setStory(response.data);
        if (response.data?.response?.sections) {
          setSections(response.data.response.sections);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching story:', err);
        // setError(err.message || 'Failed to load success story');
        setLoading(false);
      }
    };

    if (pageId) {
      fetchStory();
    }
  }, [pageId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditorChange = (content) => {
    setFormData(prev => ({
      ...prev,
      description: content
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        pageId: pageId,
        section: {
          name: formData.name,
          data: {
            subject: formData.description,
            status: 'ACTIVE',
            isNew: false
          },
          status: 'ACTIVE',
          priority: 0.8,
        }
      };

      const response = await addNotification(payload);
      
      if (response.success) {
        // Refresh the story data to get updated sections
        const updatedStoryResponse = await viewPageClick(pageId);
        if (updatedStoryResponse.data?.response?.sections) {
          setSections(updatedStoryResponse.data.response.sections);
        }
        setError(null); // Clear any previous errors
      } else {
        throw new Error(response.message || 'Failed to add section');
      }
    } catch (err) {
      // console.error('Error adding section:', err);
      // setError(err.message || 'Error adding section');
    } finally {
      setLoading(false);
      // Always close modal and reset form in finally block
      await handleModalClose();
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
        // Refresh data after successful update
        await refreshStoryData();
      } else {
        console.error("Failed to update status:", result.message);
        // Re-fetch to ensure UI matches backend state
        await refreshStoryData();
      }
    } catch (error) {
      console.error("Error updating story status:", error);
      // Re-fetch to ensure UI matches backend state
      await refreshStoryData();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        <button className="btn btn-primary ms-3" onClick={onNavigateBack}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="success-story-container p-4">
      <div className="d-flex justify-content-between align-items-center mb-0">
        {/* Back Arrow + Heading */}
        <div className="d-flex align-items-center gap-2 heading-shadow" style={{ cursor: 'pointer' }}>
          {onNavigateBack ? (
            <i 
              className="fas fa-arrow-left fs-3 text-primary fw-bold me-2"
              onClick={() => onNavigateBack('content')}
            ></i>
          ) : (
            <Link to="#" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left fs-3 text-primary fw-bold me-2"></i>
            </Link>
          )}
          <h4 className="mb-0">{story?.title || 'Success Story'}</h4>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Section
        </button>
      </div>

      {/* Sections List */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {[...sections]
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
                <td> <div className="form-check form-switch">
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
  </div></td>
                <td>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => onNavigateBack('view-story', { section, pageId })}
                  >
                    <i className="fas fa-eye"></i> View
                  </button>
                </td>
              </tr>
            ))}
            {sections.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center">No success stories found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Section Modal */}
      {showModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Section</h5>
                <button type="button" className="btn-close" onClick={handleModalClose}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Section Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.description}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData(prev => ({
                          ...prev,
                          description: data
                        }));
                      }}
                    />
                  </div>
                  <div className="mt-5 d-flex justify-content-end">
                    <button type="button" className="btn btn-secondary me-2" onClick={handleModalClose}>
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={!isFormValid || loading}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuccessStory;