import { useUser } from '@clerk/clerk-react'
import React, { useEffect, useState, useCallback } from 'react'
import { Heart } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const Community = () => {
  const [creations, setCreations] = useState([])
  const { user } = useUser()
  const [loading, setLoading] = useState(true)

  const { getToken } = useAuth()

  const fetchCreations = useCallback(async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/user/get-published-creations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (data.success) {
        setCreations(data.creations || [])
      } else {
        toast.error(data.message || 'Failed to fetch creations.')
      }
    } catch (error) {
      console.error('Fetch error:', error?.response?.data || error.message)
      toast.error('An error occurred while fetching creations.')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  const handleLike = async (creationId) => {
    try {
      const token = await getToken()
      const { data } = await axios.post(
        '/api/user/toggle-like-creations',
        { creationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (data.success) {
        toast.success(data.message || 'Toggled like!')
        fetchCreations()
      } else {
        toast.error(data.message || 'Failed to like creation.')
      }
    } catch (error) {
      console.error('Like error:', error?.response?.data || error.message)
      toast.error('An error occurred while liking the creation.')
    }
  }

  const isValidImage = (url) => {
    return typeof url === 'string' && (url.startsWith('http') || url.startsWith('data:image'))
  }

  useEffect(() => {
    if (user) {
      fetchCreations()
    }
  }, [user, fetchCreations])

  if (loading) {
    return (
      <div className='flex-1 h-full flex items-center justify-center'>
        <span className='w-10 h-10 my-1 rounded-full border-4 border-primary border-t-transparent animate-spin'></span>
      </div>
    )
  }

  return (
    <div className='flex-1 h-full flex flex-col gap-4 p-6'>
      <h1 className='text-xl font-semibold text-slate-800'>Creations</h1>
      <div className='bg-white h-full w-full rounded-xl overflow-y-scroll grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
        {creations.map((creation, index) => {
          const likes = creation.likes || []
          return (
            <div key={index} className='relative group'>
              {isValidImage(creation.content) ? (
                <img
                  src={creation.content}
                  alt={`creation-${index}`}
                  className='w-full h-64 object-cover rounded-lg'
                />
              ) : (
                <div className='w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg text-gray-500 text-sm p-4'>
                  Invalid or missing image
                </div>
              )}

              <div className='absolute inset-0 flex flex-col justify-end group-hover:justify-between p-3 bg-gradient-to-b from-transparent to-black/80 text-white rounded-lg transition-all'>
                <p className='text-sm hidden group-hover:block'>{creation.prompt}</p>
                <div className='flex justify-between items-center'>
                  <p>{likes.length}</p>
                  <Heart
                    onClick={() => handleLike(creation.id)}
                    className={`w-5 h-5 hover:scale-110 cursor-pointer transition-transform ${likes.includes(user?.id)
                      ? 'fill-red-500 text-red-600'
                      : 'text-white'
                      }`}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Community
