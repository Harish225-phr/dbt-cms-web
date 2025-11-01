import React, { useState, useEffect } from 'react'
import './Herosection.css'
import {Link} from 'react-router-dom'
import Heroimg from '../../assets/hero-img.png'
import Herobelow from '../../assets/hero-below.png'
import totalDirectBenefitTransfer from '../../assets/rupee.png'
import { getCumulativeSchemeDetails } from '../../services/cumulativeSchemeDetails'
import totalNumberOfTransaction from '../../assets/people-icon.png'
import noOfDepartments from '../../assets/cards.png'
import Departments from '../../assets/parliament-of-india-logo.png'
import gain from '../../assets/gain.png'

function Herosection() {
  const [data, setData] = useState({
    totalDirectBenefitTransferCumulative: '',
    totalDirectBenefitTransfer: '',
    totalNumberOfTransaction: '',
    noOfSchemes: 167,
    noOfDepartments: 20,
    estimatedGain: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCumulativeData = async () => {
      try {
        setLoading(true);
        const payload = {
          blockId: 31,
          departmentId: 30,
          districtId: 199,
          schemeId: 14
        };
          console.log('Sending payload:', payload);
        const response = await getCumulativeSchemeDetails(payload);
        console.log('API Response:', response);
        if (response?.success && response?.data) {
          console.log('Setting data:', response.data);
          setData(response.data);
        } else {
          console.error('API call failed:', response);
        }
      } catch (err) {
        console.error('Error fetching cumulative data:', err);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchCumulativeData();
  }, []);

  return (
    <div>
      <main id="main-content">
         <div className='primary-color text-white justify-content-space-even'>
        <h4 className="hero-title p-3">Total Direct Benefit Transfer (Cumulative) ₹ {data.totalDirectBenefitTransferCumulative} Cr</h4>
      <Link to="/report" style={{ textDecoration: 'none' }}>
  <h5 className='text-end p-2 text-white Links'>More Details</h5>
</Link>


        </div>
       <div className="hero-wrapper">
  <main id="main-content">
    <div className="hero-container">
      
      {/* Left side - Stats */}
      <section className="hero-left">
        <div className="stats-section">
          
          <div className="stat-card large gold">
            <div className="stat-info">
              <h3>Total Direct Benefit Transfer</h3>
              <p className="stat-period">(FY2025-26)</p>
              <p className="stat-value">₹ {data.totalDirectBenefitTransfer} Cr</p>
            </div>
            <div className="stat-icon"><img src={totalDirectBenefitTransfer} style={{ width: '75px', height: '60px' }} alt="Total Direct Benefit Transfer" /></div>
          </div>
          
          <div className="stat-card large brown">
            <div className="stat-info">
              <h3>Total No. of Beneficiaries</h3>
              <p className="stat-period">(FY2025-26)</p>
              <p className="stat-value">{data.totalNumberOfTransaction} Lakh</p>
            </div>
            <div className="stat-icon"><img src={totalNumberOfTransaction} style={{ width: '65px', height: '60px' }} alt="Total Number Of Transaction" /></div>
          </div>
          
          <div className="stat-row">
            <div className="stat-card small green">
              <h3>Schemes</h3>
              <p className="stat-value-small">{data.noOfSchemes}</p>
              <div className="stat-icon-small"><img src={noOfDepartments} style={{ width: '55px', height: '60px' }} alt="No Of Schemes" /></div>
            </div>
            
            <div className="stat-card small blue">
              <h3>Departments</h3>
              <p className="stat-value-small">{data.noOfDepartments}</p>
              <div className="stat-icon-small"><img src={Departments} style={{ width: '55px', height: '60px' }} alt="No Of Schemes" /></div>
            </div>
            
            <div className="stat-card small purple">
              <h3>Savings</h3>
              <p className="stat-value-small">₹ {data.estimatedGain} Lakh</p>
              <div className="stat-icon-small"><img src={gain} style={{ width: '55px', height: '60px' }} alt="Savings" /></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Right side - Image */}
      <section className="hero-right">
        <img src={Heroimg} className="hero-main-img" alt="Himachal Pradesh Map" />
      </section>
    </div>
    
    {/* Bottom image */}
    <div className="hero-bottom">
      <img src={Herobelow} className="hero-bottom-img" alt="Hero Bottom" />
    </div>
  </main>
</div>

      </main>
    </div>
  )
}

export default Herosection