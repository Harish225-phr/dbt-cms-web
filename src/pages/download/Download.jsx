import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import { bindPageClick } from '../../services/bindpageclick';
import { viewMedia } from '../../services/viewMedia';

function Documents() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching Act-Rules data...");
        const res = await bindPageClick('Download');
        console.log("Response from bindPageClick:", res);
        const allSections = res?.data?.response?.sections || [];
        setSections(allSections);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch documents");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewMedia = async (documentId) => {
    try {
      console.log("Document ID:", documentId);
      if (!documentId) {
        alert("Document ID is missing");
        return;
      }

      const response = await viewMedia(documentId);
      console.log("Response:", response);
  
      if (response.success) {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else {
        alert("Media not found.");
      }
    } catch (error) {
      console.error("Error viewing media:", error);
      alert("Error viewing document. Please try again.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className='container-fluid font-size'>

        <div className="container mt-3 FontSize rich-text-container table">

          <h3 className="mb-4">Documents</h3>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>S.no</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((item, index) => (
                    <tr key={item.sectionId}>
                      <td>{index + 1}</td>
                      <td>
                        {item.name || '-'}
                        {item.data?.isNew && (
                          <span className="badge rounded-pill bg-danger text-white ms-2" style={{ fontSize: '0.6rem' }}>
                            NEW
                          </span>
                        )}
                      </td>
                      <td>{new Date(item.createdOn).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                          onClick={() => handleViewMedia(item.data?.mediaId || item.data?.documentId)}
                        >
                          <i className="fas fa-eye"></i> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sections.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center">No documents found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Documents;