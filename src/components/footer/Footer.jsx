import React from 'react'
import { Link } from 'react-router-dom';
import './Footer.css'

function Footer() {
  return (
     <footer className="dbt-footer font-size">
      <div className="dbt-footer-links">
        <span><Link to= "/faq" className="Links">FAQ</Link></span>
        <span>|</span>
        <span><Link to= "/feedback" className="Links">Feedback</Link></span>
        <span>|</span>
        <span><Link to= "/terms" className="Links">Terms and Conditions</Link></span>
        <span>|</span>
        <span><Link to= "/website-policy" className="Links">Website Policy</Link></span>
        <span>|</span>
        <span><Link to= "/copyright" className="Links">Copyright Policy</Link></span>
        <span>|</span>
        <span><Link to= "/hyperlinks" className="Links">Hyperlinking Policy</Link></span>
        <span>|</span>
        <span><Link to= "/privacy" className="Links">Privacy Policy</Link></span>
      </div>
      <div className="dbt-footer-text">
        © 2025 Designed, Developed by Direct Benefit Transfer (DBT) Mission,
        Maintained and Enhanced by State Government.
      </div>
    </footer>
  )
}

export default Footer