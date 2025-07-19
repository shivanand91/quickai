import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import WriteArticle from './pages/WriteArticle'
import BlogTitle from './pages/BlogTitle'
import GeneratImages from './pages/GenerateImages'
import Community from './pages/Community'
import RemoveBackground from './pages/RemoveBackground'
import RemoveObject from './pages/RemoveObject'
import ReviewResume from './pages/ReviewResume'
import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'

const App = () => {

  const { getToken } = useAuth()

  useEffect(() => {
    getToken().then((token) => console.log(token));
}, [])

return (
  <div>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/ai' element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path='write-article' element={<WriteArticle />} />
        <Route path='blog-titles' element={<BlogTitle />} />
        <Route path='generate-images' element={<GeneratImages />} />
        <Route path='community' element={<Community />} />
        <Route path='remove-background' element={<RemoveBackground />} />
        <Route path='remove-object' element={<RemoveObject />} />
        <Route path='review-resume' element={<ReviewResume />} />

      </Route>
    </Routes>
  </div>
)
}

export default App
