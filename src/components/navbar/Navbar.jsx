import React from 'react'
import HPLOGO from '../../assets/dbtlogo.png';
import Satmav from '../../assets/satya.png';
import headerlogo from '../../assets/logo2.png';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css'

function Navbar() {
  const location = useLocation();
    const scrollToMainContent = () => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: "smooth" });
    }
  };

  
  return (
    <div className="dbt-container font-size">
      {/* Header */}
      <div className="dbt-header">
        <div className="dbt-header-left">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
            alt="India Flag"
            className="dbt-flag" style={{ width: '50px', height: '26px' }}
          />
            <img
            src={headerlogo}
            alt="India Flag"
            className="dbt-flag" style={{ width: '50px', height: '40px' }}
          />
          <div>
            <div className="dbt-title-small">DBT Bharat</div>
            <div className="dbt-subtitle">Government of India</div>
          </div>
        </div>
        {/* <div className="dbt-skip" ><a
  className="dbt-skip-link Links"
  onClick={scrollToMainContent} style={{ cursor: 'pointer' }}
>
  Skip to Main Content
</a> | Screen Reader</div> */}
        <div className="dbt-font-toggle">
           <div className="dbt-skip" ><a
  className="dbt-skip-link Links"
  onClick={scrollToMainContent} style={{ cursor: 'pointer' }}
>
  Skip to Main Content
</a></div>
          {/* <button>A</button>
          <button className="active">A</button>
          <button>A</button> */}
        </div>
      </div>

      {/* Title */}
      <div className="dbt-title-section">
        <div className="dbt-title-left">
          <img
            src={HPLOGO}
            alt="HP Logo"
            className="Logo-img"
          />
          <div>
            <div className="dbt-main-title">Direct Benefit Transfer</div>
            <div className="dbt-govt-name">Government of Himachal Pradesh</div>
          </div>
        </div>
        <img
          src={Satmav}
          style={{ width: '65px', height: '75px' }}
          alt="India Emblem"
          className="dbt-emblem"
        />
      </div>

      {/* Navigation */}
      <div className="dbt-nav primary-color">
        <div className="dbt-nav-links">
          <span className={location.pathname === "/" ? "active" : ""}><Link to ="/" className='Links'>HOME</Link></span>
          <span className={location.pathname === "/about" ? "active" : ""}><Link to ="/about" className='Links'>ABOUT US</Link></span>
          <span className={location.pathname === "/multimedia" ? "active" : ""}><Link to ="/multimedia" className='Links'>MULTI-MEDIA</Link></span>
          <span className={location.pathname === "/dbt-cell" ? "active" : ""}><Link to ="/dbt-cell" className='Links'>DBT CELL</Link></span>
          <span className={location.pathname === "/documents" ? "active" : ""}><Link to ="/documents" className='Links'>DOCUMENTS</Link></span>
          <span className={location.pathname === "/scheme" ? "active" : ""}><Link to ="/scheme" className='Links'>SCHEMES</Link></span>
          <span className={location.pathname === "/success-story" ? "active" : ""}><Link to ="/success-story" className='Links'>SUCCESS-STORY</Link></span>
          <span className={location.pathname === "/download" ? "active" : ""}><Link to ="/download" className='Links'>DOWNLOAD</Link></span>
          <span className={location.pathname === "/rti" ? "active" : ""}><Link to ="/rti" className='Links'>RTI</Link></span>
        </div>
        {/* <div className="dbt-login"><Link to="/login" className='Links'>LOGIN</Link></div> */}
        <div className="dbt-login"><a href='https://dbt.techembryo.com/login/#/Login' className='Links' target='_blank'>LOGIN</a></div>

      </div>

   
    </div>
  )
}

export default Navbar