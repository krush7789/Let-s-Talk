import React, { useEffect, useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '@/hooks/useGetUserProfile'
import useReels from '@/hooks/useReels'
import useGetAllPost from '@/hooks/useGetAllPost'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { AtSign, Heart, MessageCircle } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

const Profile = () => {
  useReels()
  useGetAllPost()

  const params = useParams()
  const userId = params.id
  const { refetch } = useGetUserProfile(userId)
  const [activeTab, setActiveTab] = useState('posts')

  useEffect(() => {
    setActiveTab('posts')
  }, [userId])

  const { userProfile, user, userProfileMeta } = useSelector(store => store.auth)
  const { reels } = useSelector(store => store.reel)
  const { posts: feedPosts } = useSelector(store => store.post)

  const isLoggedInUserProfile = user?._id === userProfile?._id
  const isFollowing = userProfileMeta?.isFollowing
  const hasPendingRequest = userProfileMeta?.hasPendingRequest
  const canViewProfile = userProfileMeta?.canViewFullProfile || isLoggedInUserProfile

  const profileId = userProfile?._id

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
      const res = await axios.post(`https://let-s-talk-lq7h.onrender.com/api/v1/user/followorunfollow/${userId}`, {}, { withCredentials: true });
      if(res.data.success){
        toast.success(res.data.message);
        await refetch();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || 'Something went wrong');
    }
  };

  const followButtonLabel = useMemo(() => {
    if(isLoggedInUserProfile) return null;
    if(isFollowing) return 'Unfollow';
    if(hasPendingRequest) return 'Requested';
    return 'Follow';
  }, [isFollowing, hasPendingRequest, isLoggedInUserProfile]);

  return (
    <div className='flex max-w-5xl justify-center mx-auto pl-10'>
      <div className='flex flex-col gap-20 p-8'>
        <div className='grid grid-cols-2'>
          <section className='flex items-center justify-center'>
            <Avatar className='h-32 w-32'>
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className='flex flex-col gap-5'>
              <div className='flex items-center gap-2'>
                <span>{userProfile?.username}</span>
                {
                  isLoggedInUserProfile ? (
                    <>
                      <Link to="/account/edit"><Button variant='secondary' className='hover:bg-gray-200 h-8'>Edit profile</Button></Link>
                      <Button variant='secondary' className='hover:bg-gray-200 h-8'>View archive</Button>
                      <Button variant='secondary' className='hover:bg-gray-200 h-8'>Ad tools</Button>
                    </>
                  ) : (
                    <>
                      {
                        followButtonLabel && (
                          <Button
                            disabled={followButtonLabel === 'Requested'}
                            onClick={followButtonLabel === 'Requested' ? undefined : handleFollowAction}
                            className={`h-8 ${followButtonLabel === 'Follow' ? 'bg-[#0095F6] hover:bg-[#3192d2]' : ''}`}
                            variant={followButtonLabel === 'Unfollow' ? 'secondary' : 'default'}
                          >
                            {followButtonLabel}
                          </Button>
                        )
                      }
                      {isFollowing && (
                        <Button variant='secondary' className='h-8'>Message</Button>
                      )}
                    </>
                  )
                }
              </div>
              <div className='flex items-center gap-4'>
                <p><span className='font-semibold'>{userProfile?.posts.length} </span>posts</p>
                <p><span className='font-semibold'>{userProfile?.followers.length} </span>followers</p>
                <p><span className='font-semibold'>{userProfile?.following.length} </span>following</p>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='font-semibold'>{userProfile?.bio || 'bio here...'}</span>
                <div className='flex items-center gap-2'>
                  <Badge className='w-fit' variant='secondary'><AtSign /> <span className='pl-1'>{userProfile?.username}</span> </Badge>
                  <Badge variant={userProfile?.accountType === 'private' ? 'destructive' : 'outline'}>
                    {userProfile?.accountType === 'private' ? 'Private account' : 'Public account'}
                  </Badge>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className='border-t border-t-gray-200/20'>
          <div className='flex flex-wrap items-center justify-center gap-6 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 sm:gap-10 sm:text-sm'>
            <button
              type='button'
              onClick={() => handleTabChange('posts')}
              className={`relative pb-4 pt-5 transition ${activeTab === 'posts' ? 'text-slate-100' : 'hover:text-slate-200'}`}
            >
              POSTS
              {activeTab === 'posts' && <span className='absolute bottom-0 left-0 right-0 mx-auto h-[2px] w-10 rounded-full bg-sky-400' />}
            </button>
            {isLoggedInUserProfile && (
              <button
                type='button'
                onClick={() => handleTabChange('saved')}
                className={`relative pb-4 pt-5 transition ${activeTab === 'saved' ? 'text-slate-100' : 'hover:text-slate-200'}`}
              >
                SAVED
                {activeTab === 'saved' && <span className='absolute bottom-0 left-0 right-0 mx-auto h-[2px] w-10 rounded-full bg-sky-400' />}
              </button>
            )}
            <button
              type='button'
              onClick={() => handleTabChange('reels')}
              className={`relative pb-4 pt-5 transition ${activeTab === 'reels' ? 'text-slate-100' : 'hover:text-slate-200'}`}
            >
              REELS
              {activeTab === 'reels' && <span className='absolute bottom-0 left-0 right-0 mx-auto h-[2px] w-10 rounded-full bg-sky-400' />}
            </button>
            <button
              type='button'
              onClick={() => handleTabChange('tagged')}
              className={`relative pb-4 pt-5 transition ${activeTab === 'tagged' ? 'text-slate-100' : 'hover:text-slate-200'}`}
            >
              TAGS
              {activeTab === 'tagged' && <span className='absolute bottom-0 left-0 right-0 mx-auto h-[2px] w-10 rounded-full bg-sky-400' />}
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
                        className='group relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/40 shadow-lg shadow-violet-500/10 transition hover:border-violet-400/40 hover:shadow-violet-500/30'
                      >
                        <video src={reel.videoUrl} muted loop playsInline className='aspect-[9/16] w-full object-cover' />
                        <div className='absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-4 opacity-0 transition group-hover:opacity-100'>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-9 w-9 border border-slate-900/80'>
                              <AvatarImage src={reel.author?.profilePicture} alt={reel.author?.username} />
                              <AvatarFallback>{reel.author?.username?.slice(0, 2)?.toUpperCase() || 'CN'}</AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col text-left'>
                              <span className='text-sm font-semibold text-slate-50'>{reel.caption || 'Shared a new reel'}</span>
                              <span className='text-xs text-slate-300'>{reel.views?.length || 0} views</span>
                            </div>
                          </div>
                          <div className='flex items-center gap-2 text-xs text-slate-100'>
                            <span className='inline-flex items-center gap-1 rounded-full bg-slate-900/60 px-3 py-1'>
                              <Heart className='h-3 w-3 text-rose-300' />
                              {reel.likes?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='rounded-3xl border border-slate-800/60 bg-slate-950/40 p-10 text-center text-sm text-slate-400'>
                    {getEmptyMessage()}
                  </div>
                )
              ) : (
                <div className='flex flex-col items-center gap-2 py-10 text-center text-sm text-gray-500'>
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
                      className='group relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/40 shadow-inner shadow-slate-950/60'
                    >
                      <img src={post.image} alt='postimage' className='aspect-square w-full object-cover transition duration-300 group-hover:scale-105' />
                      <div className='absolute inset-0 flex items-center justify-center bg-slate-950/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                        <div className='flex items-center gap-6 text-sm font-semibold text-slate-100'>
                          <span className='flex items-center gap-2'>
                            <Heart className='h-4 w-4 text-rose-300' />
                            {post?.likes?.length || 0}
                          </span>
                          <span className='flex items-center gap-2'>
                            <MessageCircle className='h-4 w-4 text-sky-300' />
                            {post?.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='rounded-3xl border border-slate-800/60 bg-slate-950/40 p-10 text-center text-sm text-slate-400'>
                  {getEmptyMessage()}
                </div>
              )
            ) : (
              <div className='flex flex-col items-center gap-2 py-10 text-center text-sm text-gray-500'>
                <p>This account is private.</p>
                <p>Send a follow request to see their posts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
