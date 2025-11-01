import React, { useState } from "react";
import { addPage } from '../../../services/addPageService';

function AddPageModal({ show, onClose, onSave }) {
  const [formData, setFormData] = useState({
    slug: "",
    description: "",
    type: ""
  });

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // prepare payload according to API contract
    const payload = {
      slug: formData.slug,
      description: formData.description,
      type: formData.type,
    };

    try {
      const response = await addPage(payload);

      // api wrapper may return either data object or { error: true, message }
      if (response?.error) {
        setError(response.message || 'Failed to add page');
        setLoading(false);
        return;
      }

      // try common response shapes to find created resource
      const created = response?.data || response?.response || response;

      // fallback to client-side generated object if server didn't return created resource
      const createdPage = created && created.id ? created : { id: Date.now(), ...payload };

      onSave(createdPage);
      setFormData({ slug: "", description: "", type: "" });
      onClose();
    } catch (err) {
      console.error('Error calling addPage API:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Add New Page</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Slug</label>
                <input
                  type="text"
                  className="form-control"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
               <div className="mb-3">
                <label className="form-label">Type</label>
              <select
                className="form-select"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="text">List</option>
                <option value="image">Object</option>
              </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                Save Page
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddPageModal;
