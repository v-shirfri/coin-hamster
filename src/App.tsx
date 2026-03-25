
import { Route, Routes } from 'react-router-dom'

import Layout from './Components/layout/Layout'
import AboutPage from './pages/AboutPage'
import AiRecommendationPage from './pages/AiRecommendationPage'
import HomePage from './pages/HomePage'
import ReportsPage from './pages/ReportsPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />} path="/">
        <Route index element={<HomePage />} />
        <Route element={<ReportsPage />} path="reports" />
        <Route element={<AiRecommendationPage />} path="ai-recommendation" />
        <Route element={<AboutPage />} path="about" />
      </Route>
    </Routes>
  )
}

export default App
