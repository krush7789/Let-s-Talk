import React, { useEffect, useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '@/hooks/useGetUserProfile'
import useReels from '@/hooks/useReels'
import useGetAllPost from '@/hooks/useGetAllPost'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { AtSign, Heart, MessageCircle } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { computeUpdatedAuthUserAfterFollowAction, normaliseIdArray } from '@/lib/relationships'
import { setAuthUser } from '@/redux/authSlice'

const Profile = () => {
  useReels()
  useGetAllPost()

  const params = useParams()
  const userId = params.id
  const { refetch } = useGetUserProfile(userId)
  const [activeTab, setActiveTab] = useState('posts')
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false)
  const [connectionType, setConnectionType] = useState('followers')
  const [connections, setConnections] = useState([])
  const [isLoadingConnections, setIsLoadingConnections] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const [connectionBusyIds, setConnectionBusyIds] = useState(() => new Set())

  useEffect(() => {
    setActiveTab('posts')
  }, [userId])

  const dispatch = useDispatch()
  const { userProfile, user, userProfileMeta } = useSelector(store => store.auth)
  const { reels } = useSelector(store => store.reel)
  const { posts: feedPosts } = useSelector(store => store.post)

  const isLoggedInUserProfile = user?._id === userProfile?._id
  const isFollowing = userProfileMeta?.isFollowing
  const hasPendingRequest = userProfileMeta?.hasPendingRequest
  const canViewProfile = userProfileMeta?.canViewFullProfile || isLoggedInUserProfile

  const profileId = userProfile?._id
  const API_BASE_URL = 'https://let-s-talk-lq7h.onrender.com/api/v1/user'

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const profilePosts = canViewProfile ? userProfile?.posts || [] : []
  const savedPosts = isLoggedInUserProfile ? userProfile?.bookmarks || [] : []
  const profileReels = useMemo(() => {
    if (!canViewProfile) return []
    return reels.filter(reel => reel.author?._id === profileId)
  }, [canViewProfile, profileId, reels])

  const taggedPosts = useMemo(() => {
    if (!canViewProfile) return []
    const username = userProfile?.username?.toLowerCase()
    if (!username) return []
    const handle = `@${username}`
    return feedPosts.filter(post => (post?.caption || '').toLowerCase().includes(handle))
  }, [canViewProfile, feedPosts, userProfile?.username])

  const activeCollection = useMemo(() => {
    switch (activeTab) {
      case 'posts':
        return profilePosts
      case 'saved':
        return savedPosts
      case 'tagged':
        return taggedPosts
      default:
        return profilePosts
    }
  }, [activeTab, profilePosts, savedPosts, taggedPosts])

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'saved':
        return 'You have not saved any posts yet.'
      case 'reels':
        return 'No reels to show just yet.'
      case 'tagged':
        return 'No tagged posts yet. When friends tag you, they will appear here.'
      default:
        return 'No posts to display yet.'
    }
  }

  const handleFollowAction = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/followorunfollow/${userId}`, {}, { withCredentials: true })
      if (res.data.success) {
        toast.success(res.data.message)
        if (res.data.status) {
          const updatedAuthUser = computeUpdatedAuthUserAfterFollowAction(user, res.data.status, userId)
          if (updatedAuthUser) {
            dispatch(setAuthUser(updatedAuthUser))
          }
        }
        await refetch()
      }
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || 'Something went wrong')
    }
  }

  const followButtonLabel = useMemo(() => {
    if (isLoggedInUserProfile) return null
    if (isFollowing) return 'Unfollow'
    if (hasPendingRequest) return 'Requested'
    return 'Follow'
  }, [isFollowing, hasPendingRequest, isLoggedInUserProfile])

  const canViewConnections = useMemo(() => {
    if (isLoggedInUserProfile) return true
    if (userProfile?.accountType === 'public') return true
    return Boolean(isFollowing)
  }, [isFollowing, isLoggedInUserProfile, userProfile?.accountType])

  useEffect(() => {
    if (!isConnectionsOpen || !connectionType || !userId) return

    let isActive = true

    const fetchConnections = async () => {
      setIsLoadingConnections(true)
      setConnectionError(null)
      try {
        const res = await axios.get(`${API_BASE_URL}/${userId}/${connectionType}`, { withCredentials: true })
        if (!isActive) return
        if (res?.data?.success) {
          setConnections(res?.data?.users ?? [])
        } else {
          setConnections([])
          setConnectionError(res?.data?.message || 'Unable to load connections right now.')
        }
      } catch (error) {
        if (!isActive) return
        console.log(error)
        setConnections([])
        setConnectionError(error?.response?.data?.message || 'Unable to load connections right now.')
      } finally {
        if (isActive) {
          setIsLoadingConnections(false)
        }
      }
    }

    fetchConnections()

    return () => {
      isActive = false
    }
  }, [API_BASE_URL, connectionType, isConnectionsOpen, userId])

  const handleConnectionsDialogChange = (open) => {
    setIsConnectionsOpen(open)
    if (!open) {
      setConnections([])
      setConnectionError(null)
      setConnectionBusyIds(new Set())
    }
  }

  const openConnections = (type) => {
    if (!canViewConnections) {
      toast.info('Follow this account to see more details about their community.')
      return
    }
    setConnectionType(type)
    setIsConnectionsOpen(true)
  }

  const handleConnectionFollowToggle = async (connection) => {
    const targetId = connection?._id
    if (!targetId || !user?._id) return

    const idString = targetId.toString()
    setConnectionBusyIds(prev => {
      const next = new Set(prev)
      next.add(idString)
      return next
    })

    try {
      const res = await axios.post(`${API_BASE_URL}/followorunfollow/${idString}`, {}, { withCredentials: true })
      if (res?.data?.success && res?.data?.status) {
        const updatedAuthUser = computeUpdatedAuthUserAfterFollowAction(user, res.data.status, idString)
        if (updatedAuthUser) {
          dispatch(setAuthUser(updatedAuthUser))
        }

        setConnections(prev => prev.map(item => {
          const itemId = item?._id?.toString?.() ?? item?._id
          if (itemId?.toString() !== idString) return item

          switch (res.data.status) {
            case 'followed':
              return { ...item, isFollowing: true, hasPendingRequest: false }
            case 'unfollowed':
              return { ...item, isFollowing: false, hasPendingRequest: false }
            case 'requested':
              return { ...item, isFollowing: false, hasPendingRequest: true }
            case 'request_cancelled':
              return { ...item, isFollowing: false, hasPendingRequest: false }
            default:
              return item
          }
        }))

        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || 'Unable to update follow status')
    } finally {
      setConnectionBusyIds(prev => {
        const next = new Set(prev)
        next.delete(idString)
        return next
      })
    }
  }

  const viewerFollowingIds = useMemo(() => new Set(normaliseIdArray(user?.following)), [user?.following])
  const viewerPendingIds = useMemo(() => new Set(normaliseIdArray(user?.sentFollowRequests)), [user?.sentFollowRequests])

  return (
    <div className='mx-auto flex max-w-6xl justify-center px-4 py-6 text-[#4a4a4a]'>
      <div className='flex w-full flex-col gap-12 rounded-[2.5rem] border border-[rgba(0,0,0,0.05)] bg-white/85 p-8 shadow-[0_32px_80px_-58px_rgba(51,51,51,0.5)]'>
        <div className='grid gap-8 md:grid-cols-[240px_1fr]'>
          <section className='flex items-center justify-center'>
            <Avatar className='h-36 w-36 border border-[rgba(0,0,0,0.06)] bg-white shadow-[0_12px_30px_-24px_rgba(200,169,241,0.6)]'>
              <AvatarImage src={userProfile?.profilePicture} alt='profilephoto' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className='flex flex-col gap-5'>
              <div className='flex flex-wrap items-center gap-3'>
                <span className='text-xl font-semibold text-[#333333]'>{userProfile?.username}</span>
                {isLoggedInUserProfile ? (
                  <>
                    <Link to='/account/edit'>
                      <Button variant='secondary' className='h-8'>Edit profile</Button>
                    </Link>
                    <Button variant='secondary' className='h-8'>View archive</Button>
                    <Button variant='secondary' className='h-8'>Ad tools</Button>
                  </>
                ) : (
                  <>
                    {followButtonLabel && (
                      <Button
                        disabled={followButtonLabel === 'Requested'}
                        onClick={followButtonLabel === 'Requested' ? undefined : handleFollowAction}
                        className={`h-8 px-5 ${followButtonLabel === 'Requested' ? 'text-[#6f6f6f]' : ''}`}
                        variant={followButtonLabel === 'Unfollow' ? 'secondary' : followButtonLabel === 'Requested' ? 'outline' : 'default'}
                      >
                        {followButtonLabel}
                      </Button>
                    )}
                    {isFollowing && (
                      <Button variant='secondary' className='h-8'>Message</Button>
                    )}
                  </>
                )}
              </div>
              <div className='flex flex-wrap items-center gap-4 text-sm text-[#6f6f6f]'>
                <p><span className='font-semibold text-[#333333]'>{userProfile?.posts.length} </span>posts</p>
                <button
                  type='button'
                  onClick={() => openConnections('followers')}
                  className='transition hover:text-[#333333]'
                >
                  <span className='font-semibold text-[#333333]'>{userProfile?.followers.length} </span>followers
                </button>
                <button
                  type='button'
                  onClick={() => openConnections('following')}
                  className='transition hover:text-[#333333]'
                >
                  <span className='font-semibold text-[#333333]'>{userProfile?.following.length} </span>following
                </button>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='font-semibold text-[#333333]'>{userProfile?.bio || 'bio here...'}</span>
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge className='w-fit' variant='secondary'>
                    <AtSign className='h-3 w-3' />
                    <span className='pl-1'>{userProfile?.username}</span>
                  </Badge>
                  <Badge variant={userProfile?.accountType === 'private' ? 'destructive' : 'outline'}>
                    {userProfile?.accountType === 'private' ? 'Private account' : 'Public account'}
                  </Badge>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className='border-t border-[rgba(0,0,0,0.06)] pt-6'>
          <div className='flex flex-wrap items-center justify-center gap-6 text-xs font-semibold uppercase tracking-[0.35em] text-[#8c8c8c] sm:gap-10 sm:text-sm'>
            <button
              type='button'
              onClick={() => handleTabChange('posts')}
              className={`relative pb-4 pt-5 transition ${activeTab === 'posts' ? 'text-[#333333]' : 'hover:text-[#4a4a4a]'}`}
            >
              POSTS
              {activeTab === 'posts' && <span className='absolute bottom-0 left-0 right-0 mx-auto h-[2px] w-10 rounded-full bg-[#c8a9f1]' />}
            </button>
            {isLoggedInUserProfile && (
              <button
                type='button'
                onClick={() => handleTabChange('saved')}
                className={`relative pb-4 pt-5 transition ${activeTab === 'saved' ? 'text-[#333333]' : 'hover:text-[#4a4a4a]'}`}
              >
                SAVED
                {activeTab === 'saved' && <span className='absolute bottom-0 left-0 right-0 mx-auto h-[2px] w-10 rounded-full bg-[#c8a9f1]' />}
              </button>
            )}
            <button
              type='button'
              onClick={() => handleTabChange('reels')}
              className={`relative pb-4 pt-5 transition ${activeTab === 'reels' ? 'text-[#333333]' : 'hover:text-[#4a4a4a]'}`}
            >
              REELS
              {activeTab === 'reels' && <span className='absolute bottom-0 left-0 right-0 mx-auto h-[2px] w-10 rounded-full bg-[#c8a9f1]' />}
            </button>
            <button
              type='button'
              onClick={() => handleTabChange('tagged')}
              className={`relative pb-4 pt-5 transition ${activeTab === 'tagged' ? 'text-[#333333]' : 'hover:text-[#4a4a4a]'}`}
            >
              TAGS
              {activeTab === 'tagged' && <span className='absolute bottom-0 left-0 right-0 mx-auto h-[2px] w-10 rounded-full bg-[#c8a9f1]' />}
            </button>
          </div>
          <div className='py-6'>
            {activeTab === 'reels' ? (
              canViewProfile ? (
                profileReels.length ? (
                  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {profileReels.map(reel => (
                      <div
                        key={reel._id}
                        className='group relative overflow-hidden rounded-3xl border border-[rgba(200,169,241,0.35)] bg-white/80 shadow-[0_24px_60px_-48px_rgba(200,169,241,0.45)] transition hover:border-[#c8a9f1]/60 hover:shadow-[0_28px_72px_-50px_rgba(200,169,241,0.6)]'
                      >
                        <video src={reel.videoUrl} muted loop playsInline className='aspect-[9/16] w-full object-cover' />
                        <div className='absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/55 via-transparent to-transparent p-4 opacity-0 transition group-hover:opacity-100'>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-9 w-9 border border-[rgba(255,255,255,0.6)]'>
                              <AvatarImage src={reel.author?.profilePicture} alt={reel.author?.username} />
                              <AvatarFallback>{reel.author?.username?.slice(0, 2)?.toUpperCase() || 'CN'}</AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col text-left text-white'>
                              <span className='text-sm font-semibold'>{reel.caption || 'Shared a new reel'}</span>
                              <span className='text-xs text-white/80'>{reel.views?.length || 0} views</span>
                            </div>
                          </div>
                          <div className='flex items-center gap-2 text-xs text-white'>
                            <span className='inline-flex items-center gap-1 rounded-full bg-black/40 px-3 py-1'>
                              <Heart className='h-3 w-3 text-[#f4b9b9]' />
                              {reel.likes?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='rounded-3xl border border-[rgba(0,0,0,0.05)] bg-white/70 p-10 text-center text-sm text-[#6f6f6f]'>
                    {getEmptyMessage()}
                  </div>
                )
              ) : (
                <div className='flex flex-col items-center gap-2 py-10 text-center text-sm text-[#8c8c8c]'>
                  <p>This account is private.</p>
                  <p>Send a follow request to see their posts.</p>
                </div>
              )
            ) : canViewProfile || (activeTab === 'saved' && isLoggedInUserProfile) ? (
              activeCollection.length ? (
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4'>
                  {activeCollection.map(post => (
                    <div
                      key={post?._id}
                      className='group relative overflow-hidden rounded-3xl border border-[rgba(0,0,0,0.05)] bg-white/80 shadow-[0_24px_60px_-50px_rgba(51,51,51,0.35)]'
                    >
                      <img src={post.image} alt='postimage' className='aspect-square w-full object-cover transition duration-300 group-hover:scale-105' />
                      <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                        <div className='flex items-center gap-6 text-sm font-semibold text-white'>
                          <span className='flex items-center gap-2'>
                            <Heart className='h-4 w-4 text-[#f4b9b9]' />
                            {post?.likes?.length || 0}
                          </span>
                          <span className='flex items-center gap-2'>
                            <MessageCircle className='h-4 w-4 text-[#c8a9f1]' />
                            {post?.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='rounded-3xl border border-[rgba(0,0,0,0.05)] bg-white/70 p-10 text-center text-sm text-[#6f6f6f]'>
                  {getEmptyMessage()}
                </div>
              )
            ) : (
              <div className='flex flex-col items-center gap-2 py-10 text-center text-sm text-[#8c8c8c]'>
                <p>This account is private.</p>
                <p>Send a follow request to see their posts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Dialog open={isConnectionsOpen} onOpenChange={handleConnectionsDialogChange}>
        <DialogContent className='max-w-xl'>
          <DialogHeader>
            <DialogTitle className='text-center text-lg font-semibold text-[#333333] sm:text-left'>
              {connectionType === 'followers' ? 'Followers' : 'Following'}
            </DialogTitle>
            <DialogDescription className='text-center text-sm text-[#666666] sm:text-left'>
              {connectionType === 'followers'
                ? `People who follow ${userProfile?.username || 'this account'}`
                : `Accounts ${userProfile?.username || 'this account'} follows`}
            </DialogDescription>
          </DialogHeader>
          <div className='flex items-center justify-center gap-2 rounded-full bg-[#f6f6f6] p-1 text-xs font-semibold text-[#4a4a4a]'>
            <button
              type='button'
              onClick={() => setConnectionType('followers')}
              className={`w-full rounded-full px-4 py-2 transition ${connectionType === 'followers' ? 'bg-white text-[#333333] shadow-[0_8px_20px_-14px_rgba(0,0,0,0.45)]' : 'text-[#777777]'}`}
            >
              Followers
            </button>
            <button
              type='button'
              onClick={() => setConnectionType('following')}
              className={`w-full rounded-full px-4 py-2 transition ${connectionType === 'following' ? 'bg-white text-[#333333] shadow-[0_8px_20px_-14px_rgba(0,0,0,0.45)]' : 'text-[#777777]'}`}
            >
              Following
            </button>
          </div>
          <div className='mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1'>
            {isLoadingConnections && (
              <div className='flex items-center justify-center rounded-2xl border border-dashed border-[#d9d9d9] bg-white/60 py-10 text-sm text-[#666666]'>
                Loading {connectionType}…
              </div>
            )}
            {!isLoadingConnections && connectionError && (
              <div className='rounded-2xl border border-dashed border-[#d9d9d9] bg-white/65 p-6 text-center text-sm text-[#6f6f6f]'>
                {connectionError}
              </div>
            )}
            {!isLoadingConnections && !connectionError && !connections.length && (
              <div className='rounded-2xl border border-dashed border-[#d9d9d9] bg-white/65 p-6 text-center text-sm text-[#6f6f6f]'>
                {connectionType === 'followers' ? 'No followers to show yet.' : 'Not following anyone yet.'}
              </div>
            )}
            {!isLoadingConnections && !connectionError && connections.map(connection => {
              const connectionId = connection?._id?.toString?.() ?? connection?._id
              const isViewer = connectionId === (user?._id?.toString?.() ?? user?._id)
              const isBusy = connectionBusyIds.has(connectionId)
              const isFollowingConnection = connection?.isFollowing ?? viewerFollowingIds.has(connectionId)
              const hasPendingRequest = connection?.hasPendingRequest ?? viewerPendingIds.has(connectionId)
              const buttonLabel = isFollowingConnection ? 'Following' : hasPendingRequest ? 'Requested' : 'Follow'
              const buttonVariant = isFollowingConnection ? 'secondary' : hasPendingRequest ? 'secondary' : 'default'

              return (
                <div key={connectionId} className='flex items-center justify-between gap-3 rounded-2xl border border-[rgba(0,0,0,0.04)] bg-white/80 px-4 py-3 shadow-[0_16px_32px_-42px_rgba(51,51,51,0.45)]'>
                  <Link to={`/profile/${connectionId}`} className='flex flex-1 items-center gap-3'>
                    <Avatar className='h-11 w-11 border border-[rgba(0,0,0,0.05)] bg-white'>
                      <AvatarImage src={connection?.profilePicture} alt={`${connection?.username || 'user'}-avatar`} />
                      <AvatarFallback>LT</AvatarFallback>
                    </Avatar>
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-semibold text-[#333333]'>{connection?.username}</p>
                      {connection?.bio && <p className='truncate text-xs text-[#6f6f6f]'>{connection.bio}</p>}
                    </div>
                  </Link>
                  {isViewer ? (
                    <span className='rounded-full bg-[#f6f6f6] px-3 py-1 text-xs font-semibold text-[#777777]'>You</span>
                  ) : (
                    <Button
                      size='sm'
                      className='rounded-full px-4'
                      disabled={isBusy}
                      variant={buttonVariant}
                      onClick={() => handleConnectionFollowToggle(connection)}
                    >
                      {isBusy ? 'Please wait…' : buttonLabel}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Profile
