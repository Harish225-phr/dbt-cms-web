// components/PageEditor.jsx
import React, { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useApi } from "../../../../hooks/useView";
import { viewPageClick } from "../../../../services/viewPageContent";
import { updatePageClick } from "../../../../services/updatePage";
import { useToast } from "../../../toast/Toast";
import { useLocation, Link, useNavigate } from "react-router-dom";

const PageEditor = ({ pageId, onNavigateBack }) => {
  const navigate = useNavigate();
  const { data: content, loading, error, execute } = useApi(viewPageClick);
  const [editorValue, setEditorValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const location = useLocation();

  const { showToaster } = useToast();
  const slug = location.state?.slug || sessionStorage.getItem('selectedPageSlug');


  // Fetch API
  useEffect(() => {
    const id = pageId || sessionStorage.getItem("selectedPageId");
    if (id) execute(id);
  }, [pageId, execute]);

  // Set data in editor after fetch
  useEffect(() => {
    if (content) {
      setEditorValue(content.richText || content);
      setPageTitle(content.title || "Page Preview");
    }
  }, [content]);

const handleSave = async () => {
  setSaving(true);
  try {
    const id = pageId || sessionStorage.getItem("selectedPageId");
    if (!id) {
      alert("No page selected!");
      return;
    }

    const payload = {
      pageId: id, // yahan ID bhejenge
      data: {
        richText: editorValue, // jo CKEditor me likha hai wo save hoga
      },
    };

    const response = await updatePageClick(payload);

    if (response.success) {
    } else {
    }
  } catch (err) {
    console.error("Save error:", err);

  } finally {
    setSaving(false);
      showToaster("Content saved successfully!", "success");

  }
};



  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
    <div className="container mt-4">
      {/* Back Arrow + Heading */}
      <div className="d-flex align-items-center gap-2 heading-shadow mb-3" style={{ cursor: 'pointer' }}>
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
        <h4 className="mb-0">{slug || 'Page'} Content</h4>
      </div>
      <CKEditor
        editor={ClassicEditor}
        data={editorValue}
        onChange={(event, editor) => {
          const data = editor.getData();
          setEditorValue(data);
        }}
      />

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
    </div>

    {/* Preview Modal */}
    {showModal && (
      <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{pageTitle}</h5>
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
    </>
  );
};

export default PageEditor;