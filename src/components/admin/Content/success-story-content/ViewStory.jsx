import React, { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useToast } from "../../../toast/Toast";
import { sectionUpdate } from "../../../../services/sectionUpdate";
import { useLocation, Link, useNavigate } from "react-router-dom";

function ViewStory({ section, onNavigateBack }) {
  const navigate = useNavigate();
  const [editorValue, setEditorValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { showToaster } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (section?.data?.subject) {
      setEditorValue(section.data.subject);
    }
  }, [section]);

  if (!section) {
    return (
      <div className="alert alert-danger">
        Story not found
        <button className="btn btn-primary ms-3" onClick={onNavigateBack}>Go Back</button>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        pageId: sessionStorage.getItem("selectedPageId"),
        section: {
          sectionId: section.sectionId,
          name: section.name,
          data: {
            ...section.data,
            subject: editorValue,
            status: 'ACTIVE'
          },
          status: 'ACTIVE',
          priority: section.priority || 0.8,
        }
      };

      const response = await sectionUpdate(payload);

      if (response.success) {
        showToaster("Content saved successfully!", "success");
      } else {
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
        showToaster("Content saved successfully!", "success");

    }
  };

  return (
    <div className="container mt-4">
      {/* Back Arrow + Heading */}
      <div className="d-flex align-items-center gap-2 heading-shadow mb-4" style={{ cursor: 'pointer' }}>
        {onNavigateBack ? (
          <i 
            className="fas fa-arrow-left fs-3 text-primary fw-bold me-2"
            onClick={onNavigateBack}
          ></i>
        ) : (
          <Link to="#" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left fs-3 text-primary fw-bold me-2"></i>
          </Link>
        )}
        <h4 className="mb-0">{section.name}</h4>
      </div>

      {/* Rich Text Editor */}
      <CKEditor
        editor={ClassicEditor}
        data={editorValue}
        onChange={(event, editor) => {
          const data = editor.getData();
          setEditorValue(data);
        }}
      />

      {/* Action Buttons */}
      <div className="d-flex gap-2 mt-3">
        <button
          className="btn btn-success"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowModal(true)}
        >
          Preview
        </button>
      </div>

      {/* Preview Modal */}
      {showModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{section.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body rich-text-container">
                <div dangerouslySetInnerHTML={{ __html: editorValue }}></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewStory;