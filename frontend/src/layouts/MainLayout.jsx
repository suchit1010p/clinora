import { Outlet } from 'react-router-dom'
import './MainLayout.css'

function MainLayout() {
  return (
    <div className="home-page">
        <div className="sidebar">
            <a href="/appointments">appointments</a>
            <a href="/patients">patients</a>
            <a href="/audio-files">audio files</a>
            <a href="ai-summaries">ai summaries</a>
        </div>
        <div className="page">
            <Outlet/>
        </div>
    </div>
    
  )
}

export default MainLayout
