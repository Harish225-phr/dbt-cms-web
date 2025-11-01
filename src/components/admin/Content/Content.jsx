import React,{useState, useEffect} from 'react'
import { viewPagesList } from '../../../services/viewListPageService';
import AddPageModal from './addPage'
 

function Content({ onNavigate }) {
  const [content, setContent] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleAddPage = (newPage) => {
    setContent((prev) => [newPage, ...prev]);
  };
  
  const handleViewPage = (pageId, description, slug) => {
    console.log("handleViewPage called with pageId:", pageId, "slug:", slug);
    // Check if description contains specific keywords to determine page type
    const isNotification = description && description.toLowerCase().includes('notification');
    const isMedia = description && description.toLowerCase().includes('media');
    const isSuccessStory = description && description.toLowerCase().includes('success-story');

    let pageType = 'regular';
    if (isNotification) {
      pageType = 'Notification';
    } else if (isMedia) {
      pageType = 'Media';
    } else if (isSuccessStory) {
      pageType = 'Success-Story';
    }
    
    // Pass the selected pageId, pageType, and slug as state when navigating
    if (onNavigate) {
      console.log(`Calling onNavigate with 'view', pageId: ${pageId}, pageType: ${pageType}, slug: ${slug}`);
      onNavigate('view', { pageId: pageId, pageType: pageType, slug: slug });
    } else {
      console.error("onNavigate function is not available");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await viewPagesList();
        console.log("viewPagesList result:", result);

        if (result?.error) {
          console.error('API error fetching pages:', result.message);
          setContent([]);
          return;
        }

        const payload = result?.response;

        if (Array.isArray(payload)) {
          setContent(payload);
        } else if (Array.isArray(payload?.data)) {
          setContent(payload.data);
        } else {
          setContent([]);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };

    fetchData();
  }, []);

  return (
   <div className="container">
    <div className="d-flex justify-content-between align-items-center">
         <h2 className="mb-4 text-center">Pages List </h2>
      <button className="btn btn-primary mb-3 ms-auto" onClick={() => setShowModal(true)}>Add New Page</button>
    </div>
      <div className="table-responsive shadow-sm rounded">
        <table className="table table-striped table-hover align-middle">
          <thead className="text-center">
            <tr className='text-dark'>
              <th scope="col">S.N.</th>
              <th scope="col">Page Name</th>
              <th scope="col">Description</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {content.length > 0 ? (
              content.map((item, index) => (
                <tr key={item.id}>
                  
                  <td>{index + 1}</td>
                  <td>{item.slug}</td>
                  <td>
                    {item.description && item.description.toLowerCase().includes('notification') ? (
                      <span>{item.description}</span>
                    ) : (
                      item.description || "N/A"
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => {
                        console.log("View button clicked for page ID:", item.pageId, "Description:", item.description, "Slug:", item.slug);
                        // Store in sessionStorage as fallback
                        sessionStorage.setItem('selectedPageId', item.pageId);
                        sessionStorage.setItem('selectedPageSlug', item.slug);
                        handleViewPage(item.pageId, item.description, item.slug);
                      }}
                    >
                      <i className="fa fa-eye"></i> View
                    </button>
                   
                   
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
       {showModal && (
        <AddPageModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleAddPage}
        />
      )}
    </div>
  );
}

export default Content