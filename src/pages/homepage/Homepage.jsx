import React from 'react'
import './Homepage.css'
import Navbar from '../../components/navbar/Navbar'
import Banner from '../../components/banner/Banner'
import Herosection from '../../components/herosection/Herosection'
import Footer from '../../components/footer/Footer'

function Homepage() {
  return (
    <div>
    <Navbar />
    <Banner />
    <Herosection />
    <Footer />
    </div>
  )
}

export default Homepage