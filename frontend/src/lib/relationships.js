export const normaliseIdArray = (input) => {
  if (!input) return []
  if (Array.isArray(input)) {
    return input
      .map((value) => {
        if (!value) return null
        if (typeof value === 'string') return value
        if (typeof value === 'number') return value.toString()
        if (typeof value === 'object') {
          if (value instanceof Map) {
            return null
          }
          if ('_id' in value) {
            const raw = value._id
            if (typeof raw === 'string') return raw
            if (raw && typeof raw.toString === 'function') return raw.toString()
            return raw ?? null
          }
          if (value.id) {
            const raw = value.id
            if (typeof raw === 'string') return raw
            if (raw && typeof raw.toString === 'function') return raw.toString()
            return raw ?? null
          }
        }
        if (value && typeof value.toString === 'function') {
          return value.toString()
        }
        return null
      })
      .filter(Boolean)
  }
  if (typeof input === 'object') {
    return normaliseIdArray(Object.values(input))
  }
  if (typeof input === 'string') return [input]
  if (typeof input === 'number') return [input.toString()]
  return []
}

export const computeUpdatedAuthUserAfterFollowAction = (authUser, status, targetId) => {
  if (!authUser || !targetId) return authUser
  const target = typeof targetId === 'string' ? targetId : targetId.toString()
  const followingSet = new Set(normaliseIdArray(authUser.following))
  const pendingSet = new Set(normaliseIdArray(authUser.sentFollowRequests))

  switch (status) {
    case 'followed': {
      followingSet.add(target)
      pendingSet.delete(target)
      break
    }
    case 'unfollowed': {
      followingSet.delete(target)
      pendingSet.delete(target)
      break
    }
    case 'requested': {
      pendingSet.add(target)
      followingSet.delete(target)
      break
    }
    case 'request_cancelled': {
      pendingSet.delete(target)
      break
    }
    default:
      break
  }

  return {
    ...authUser,
    following: Array.from(followingSet),
    sentFollowRequests: Array.from(pendingSet),
  }
}
