import React from "react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import useFetchPage from "../../hooks/useSlug";

function Hyperlinks() {
  const { content,  error } = useFetchPage("Hyperlinks-Policy");

  return (
    <>
      <Navbar />
      <div className="container mt-4" style={{ minHeight: '70vh' }} >
        {error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div className="rich-text-container">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Hyperlinks;
