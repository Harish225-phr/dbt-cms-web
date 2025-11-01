import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Homepage from '../pages/homepage/Homepage'
import Multimedia from '../pages/multimedia/Multimedia'
import About from '../pages/about/About'
import Dbtcll from '../pages/dbt-cell/Dbt-cell'
import Documents from '../pages/documents/documents'
import Rti from '../pages/rti/Rti'
import Feedback from '../pages/feedback/Feedback'
import SuccessStory from '../pages/success-story/SuccessStory'
import StoryDetail from '../pages/success-story/StoryDetail'
import Download from '../pages/download/Download'
import Hyperlinks from '../pages/footer-links/Hyperlinks'
import Privacy from '../pages/footer-links/Privacy'
import Copyright from '../pages/footer-links/Copyright'
import Faq from '../pages/footer-links/Faq'
import Terms from '../pages/footer-links/Tearms-and-condition'
import WebsitePolicy from '../pages/footer-links/Website'
import Scheme from '../pages/scheme/Scheme'
import Report from '../pages/report/transactionReport'

// admin routes
import Login from '../pages/admin/login/Login'
import Admin from '../pages/admin/Admin'
import ProtectedRoute from '../components/ProtectedRoute'

function route() {
  return (
    <div>
        <Routes>
             {/* website routes */}
            <Route path="*" element={<Homepage />} />

            <Route path="/" element={<Homepage />} />
            <Route path="/about" element={<About />} />
            <Route path="/multimedia" element={<Multimedia />} />
            <Route path="/dbt-cell" element={<Dbtcll />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/rti" element={<Rti />} />
            <Route path="/success-story" element={<SuccessStory />} />
            <Route path="/success-story/:sectionId" element={<StoryDetail />} />
            <Route path="/download" element={<Download />} />
            <Route path="/scheme" element={<Scheme />} />

            {/* Footer links */}
            <Route path="/hyperlinks" element={<Hyperlinks />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/copyright" element={<Copyright />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/terms" element={<Terms />} /> 
            <Route path="/website-policy" element={<WebsitePolicy />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/report" element={<Report />} />

            {/* Admin routes */}
            {/* <Route path="/login" element={<Login />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute> */}
            {/* } /> */}
        </Routes>
    </div>
  )
}

export default route