import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import axios from 'axios'
import { toast } from 'sonner'
import { setAuthUser, setSuggestedUsers } from '@/redux/authSlice'
import { computeUpdatedAuthUserAfterFollowAction, normaliseIdArray } from '@/lib/relationships'

const SuggestedUsers = () => {
  const dispatch = useDispatch()
  const { suggestedUsers, user: authUser } = useSelector(store => store.auth)
  const [processingIds, setProcessingIds] = useState(() => new Set())
  const [dismissedIds, setDismissedIds] = useState(() => new Set())

  const normaliseToArray = (value) => {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (value instanceof Set) return Array.from(value)
    if (typeof value === 'object') return Object.values(value)
    return []
  }

  const filteredSuggestions = useMemo(() => {
    const exclusionSet = new Set()

    if (authUser?._id) {
      exclusionSet.add(authUser._id.toString())
    }

    normaliseToArray(authUser?.following).forEach(id => {
      if (id) {
        exclusionSet.add(id.toString())
      }
    })

    normaliseToArray(authUser?.sentFollowRequests).forEach(id => {
      if (id) {
        exclusionSet.add(id.toString())
      }
    })

    const idsToSkip = new Set(dismissedIds)

    return normaliseToArray(suggestedUsers).filter(candidate => {
      const candidateId = candidate?._id?.toString?.() ?? candidate?._id
      if (!candidateId) return false
      const candidateIdString = candidateId.toString()
      if (idsToSkip.has(candidateIdString)) return false
      return !exclusionSet.has(candidateIdString)
    })
  }, [authUser?._id, authUser?.following, authUser?.sentFollowRequests, dismissedIds, suggestedUsers])

  const viewerFollowings = useMemo(() => new Set(normaliseIdArray(authUser?.following)), [authUser?.following])
  const viewerPendingRequests = useMemo(() => new Set(normaliseIdArray(authUser?.sentFollowRequests)), [authUser?.sentFollowRequests])

  const updateAuthUserRelationships = (status, targetId) => {
    if (!authUser) return
    const updatedAuthUser = computeUpdatedAuthUserAfterFollowAction(authUser, status, targetId)
    dispatch(setAuthUser(updatedAuthUser))
  }

  const handleFollowUser = async (candidate) => {
    const targetId = candidate?._id
    if (!targetId || !authUser?._id) return

    const idString = targetId.toString()
    setProcessingIds(prev => {
      const next = new Set(prev)
      next.add(idString)
      return next
    })

    try {
      const res = await axios.post(`https://let-s-talk-lq7h.onrender.com/api/v1/user/followorunfollow/${idString}`, {}, { withCredentials: true })
      const status = res?.data?.status
      if (res?.data?.success && status) {
        updateAuthUserRelationships(status, idString)

        if (status === 'followed' || status === 'requested') {
          dispatch(setSuggestedUsers(normaliseToArray(suggestedUsers).filter(user => {
            const candidateId = user?._id?.toString?.() ?? user?._id
            return candidateId?.toString() !== idString
          })))

          setDismissedIds(prev => {
            const next = new Set(prev)
            next.add(idString)
            return next
          })
        }

        if (status === 'requested') {
          toast.success('Follow request sent')
        } else if (status === 'request_cancelled') {
          toast.success('Follow request cancelled')
        } else if (status === 'followed') {
          toast.success(`You are now following ${candidate?.username || 'this account'}`)
        } else if (status === 'unfollowed') {
          toast.success(`Unfollowed ${candidate?.username || 'this account'}`)
        }
      }
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || 'Unable to update follow status')
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.delete(idString)
        return next
      })
    }
  }

  if (!filteredSuggestions.length) {
    return (
      <div className='rounded-2xl border border-[rgba(0,0,0,0.05)] bg-white/70 p-5 text-sm text-[var(--color-text-muted)] shadow-[0_14px_36px_-34px_rgba(200,169,241,0.6)]'>
        We are preparing fresh creators for you to follow. Check back soon!
      </div>
    )
  }

  return (
    <div className='rounded-2xl border border-[rgba(0,0,0,0.05)] bg-white/75 p-5 shadow-[0_24px_50px_-42px_rgba(200,169,241,0.65)]'>
      <div className='flex items-center justify-between text-xs uppercase tracking-wide text-[#5a5a5a]'>
        <span className='font-semibold text-[var(--color-text)]'>Suggested for you</span>
        <button className='text-[#c8a9f1] transition hover:text-[#b897e9]'>See all</button>
      </div>
      <div className='mt-5 flex flex-col gap-4'>
        {filteredSuggestions.map((user) => {
          const idString = user?._id?.toString?.() ?? user?._id
          const isProcessing = processingIds.has(idString)
          const hasPendingRequest = viewerPendingRequests.has(idString)
          const isFollowing = viewerFollowings.has(idString)
          const buttonLabel = isFollowing ? 'Following' : hasPendingRequest ? 'Requested' : 'Follow'

          return (
            <div key={user._id} className='flex items-center justify-between gap-3 rounded-xl border border-[rgba(0,0,0,0.05)] bg-white/80 px-4 py-3 shadow-[0_12px_28px_-36px_rgba(0,0,0,0.45)]'>
              <div className='flex items-center gap-3'>
                <Link to={`/profile/${user?._id}`} className='rounded-2xl bg-gradient-to-br from-[#c8a9f1]/30 via-[#e8d6c6]/30 to-[#f8c8a3]/30 p-[2px]'>
                  <Avatar className='h-10 w-10 border border-[rgba(0,0,0,0.05)] bg-white'>
                    <AvatarImage src={user?.profilePicture} alt='post_image' />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div className='flex flex-col'>
                  <h1 className='text-sm font-semibold text-[var(--color-text)]'>
                    <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
                  </h1>
                  <span className='text-xs text-[#5f5f5f]'>{user?.bio || "New to Let&apos;s Talk"}</span>
                </div>
              </div>
              <Button
                size='sm'
                className='rounded-full px-5'
                disabled={isProcessing || isFollowing}
                variant={hasPendingRequest ? 'secondary' : 'default'}
                onClick={() => handleFollowUser(user)}
              >
                {isProcessing ? 'Please wait…' : buttonLabel}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SuggestedUsers
