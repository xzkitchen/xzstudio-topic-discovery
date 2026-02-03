import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { WorkflowPage } from './pages/WorkflowPage'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen relative">
        {/* 路由 */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/workflow/:topicId" element={<WorkflowPage />} />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App
