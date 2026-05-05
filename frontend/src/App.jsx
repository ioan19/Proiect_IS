import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Configurator from './components/Configurator'
import History from './components/History'
import Analytics from './components/Analytics'
import Settings from './components/Settings'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout><Dashboard /></Layout>} path="/" />
        <Route element={<Layout><Configurator /></Layout>} path="/configurator" />
        <Route element={<Layout><History /></Layout>} path="/history" />
        <Route element={<Layout><Analytics /></Layout>} path="/analytics" />
        <Route element={<Layout><Settings /></Layout>} path="/settings" />
      </Routes>
    </Router>
  )
}