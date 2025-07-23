import { Image, Scissors, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const RemoveObject = () => {
  const [input, setInput] = useState(null)
  const [object, setObject] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (!input) return toast.error('Please upload an image.')
    if (!object.trim()) return toast.error('Please enter an object to remove.')

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('image', input)
      formData.append('object', object.trim())

      const { data } = await axios.post('/api/ai/remove-image-object', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (data.success) {
        toast.success('Image processed successfully!')
        setContent(data.content)
      } else {
        toast.error(data.message || 'Failed to process image.')
      }
    } catch (error) {
      toast.error('An error occurred while processing the image.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      {/* Form */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#417DF6]' />
          <h1 className='text-2xl font-semibold'>Object Removal</h1>
        </div>

        {/* Upload */}
        <p className='mt-6 text-sm font-medium'>Upload Image</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setInput(e.target.files[0])}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600'
        />

        {/* Prompt */}
        <p className='mt-6 text-sm font-medium'>Object to Remove</p>
        <textarea
          value={object}
          onChange={(e) => setObject(e.target.value)}
          rows={3}
          placeholder='e.g. dog, car, tree, person...'
          className='w-full p-2 mt-2 outline-none text-sm rounded-md border border-gray-300'
        />
        <p className='text-sm font-light text-gray-400'>Be specific and use one object (e.g., "dog" not "a big dog in background")</p>

        {/* Submit */}
        <button
          disabled={loading}
          className='w-full flex justify-center items-center gap-2 text-sm text-white rounded-lg cursor-pointer bg-gradient-to-r from-[#417DF6] to-[#8E37EB] px-4 py-2 mt-6'
        >
          {loading ? (
            <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
          ) : (
            <Image className='w-5' />
          )}
          Remove Object
        </button>
      </form>

      {/* Output */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3'>
          <Scissors className='w-5 h-5 text-[#417DF6]' />
          <h1 className='text-xl font-semibold'>Processed Image</h1>
        </div>

        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Scissors className='w-9 h-9' />
              <p>Upload an image and click "Remove Object" to get started</p>
            </div>
          </div>
        ) : (
          <img
            src={content}
            alt="Processed image"
            className='mt-4 w-full max-h-[500px] object-contain rounded-lg'
          />
        )}
      </div>
    </div>
  )
}

export default RemoveObject
