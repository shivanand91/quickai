import { Hash, Sparkles } from 'lucide-react'
import React, { useState } from 'react'

const BlogTitle = () => {

  const blogCategories = [
    'General', 'Technology', 'Business', 'Health', 'LifeStyle', 'Education', 'Travel', 'Food'
  ]
  const [selectedCategory, setSelectedCategory] = useState(blogCategories[0])
  const [input, setInput] = useState('')

  const onSubmitHandler = async (e) => {
    e.preventDefault();
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#8E37EB]' />
          <h1 className='text-2xl font-semibold'>Ai title Generator</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Keyword</p>
        <input value={input} onChange={(e) => setInput(e.target.value)
        } type="text" placeholder='The future of artificial intelligence is...' className='w-full p-2 mt-2 outline-none text-sm rounded-md border border-gray-300' required />
        <p className='mt-4 text-sm font-medium'>Category</p>
        <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
          {
            blogCategories.map((item, index) => (
              <span onClick={() => setSelectedCategory(item)} className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedCategory === item ? 'bg-purple-50 text-purple-700' : 'text-gray-500 border-gray-300'}`} key={item}>{item}</span>
            ))
          }
        </div>
        <br />
        <button className='w-full flex justify-center items-center gap-2 text-sm text-white rounded-lg cursor-pointer bg-gradient-to-r from-[#C341F6] to-[#8E37EB] px-4 py-2 mt-6'>
          <Hash className='w-5' />
          Generate Title
        </button>
      </form>

      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3'>
          <Hash className='w-5 h-5 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>Generated titles</h1>
        </div>
        <div className='flex-1 flex justify-center items-center'>
          <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>

            <Hash className='w-9 h-9' />
            <p>Enter a topic and click "Generate title" to get started</p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default BlogTitle
