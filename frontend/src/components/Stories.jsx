import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import CreateStory from './CreateStory';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

const getRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const now = Date.now();
  const createdAt = new Date(timestamp).getTime();
  if (Number.isNaN(createdAt)) return '';
  const diff = Math.max(0, now - createdAt);
  const minutes = Math.floor(diff / (60 * 1000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  const years = Math.floor(days / 365);
  return `${years}y`;
};

const StoryAvatar = ({ group, onOpen }) => {
  const cover = group?.stories?.[0]?.media || group?.author?.profilePicture;
  const hasStories = Boolean(group?.stories?.length);
  const ringClass = hasStories
    ? 'p-[2px] bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500'
    : 'p-[2px] border border-dashed border-muted-foreground/40';

  return (
    <button
      type="button"
      onClick={() => hasStories && onOpen(group)}
      className="flex flex-col items-center gap-1 focus:outline-none disabled:opacity-60"
      disabled={!hasStories}
    >
      <div className={`h-16 w-16 rounded-full ${ringClass}`}>
        <div className="h-full w-full rounded-full bg-background overflow-hidden">
          <img src={cover} alt={group?.author?.username} className="h-full w-full object-cover" />
        </div>
      </div>
      <span className="text-xs text-muted-foreground max-w-[72px] truncate">{group?.author?.username}</span>
    </button>
  );
};

const Stories = () => {
  const { user } = useSelector(store => store.auth);
  const { stories } = useSelector(store => store.story);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeAuthorId, setActiveAuthorId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const storyGroups = useMemo(() => {
    if (!stories?.length) return [];
    return stories
      .map(group => {
        const normalizedStories = [...(group?.stories || [])]
          .filter(Boolean)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return {
          ...group,
          stories: normalizedStories
        };
      })
      .filter(group => group.stories.length)
      .sort((a, b) => {
        const aTime = a.stories[0]?.createdAt ? new Date(a.stories[0].createdAt).getTime() : 0;
        const bTime = b.stories[0]?.createdAt ? new Date(b.stories[0].createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [stories]);

  const activeGroup = useMemo(() => {
    if (!activeAuthorId) return null;
    return storyGroups.find(group => group.author?._id === activeAuthorId) || null;
  }, [storyGroups, activeAuthorId]);

  const currentStory = activeGroup?.stories?.[activeIndex];
  const currentMediaType = currentStory?.mediaType || (currentStory?.media?.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' : 'image');
  const relativeTime = getRelativeTime(currentStory?.createdAt);

  const myStoryGroup = storyGroups.find(group => group.author?._id === user?._id);

  const handleOpenStory = useCallback((group) => {
    if (!group?.author?._id) return;
    setActiveAuthorId(group.author._id);
    setActiveIndex(0);
    setProgress(0);
    setViewerOpen(true);
  }, []);

  const closeViewer = useCallback(() => {
    setViewerOpen(false);
    setActiveAuthorId(null);
    setActiveIndex(0);
    setProgress(0);
  }, []);

  const handleViewerChange = useCallback((nextOpen) => {
    if (!nextOpen) {
      closeViewer();
    } else if (activeGroup) {
      setViewerOpen(true);
    }
  }, [activeGroup, closeViewer]);

  useEffect(() => {
    if (viewerOpen && !activeGroup) {
      closeViewer();
    }
  }, [viewerOpen, activeGroup, closeViewer]);

  const handleNext = useCallback(() => {
    if (!activeGroup) return;
    setActiveIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= activeGroup.stories.length) {
        closeViewer();
        return prev;
      }
      return nextIndex;
    });
    setProgress(0);
  }, [activeGroup, closeViewer]);

  const handlePrev = useCallback(() => {
    if (!activeGroup) return;
    setActiveIndex((prev) => {
      if (prev === 0) return prev;
      return prev - 1;
    });
    setProgress(0);
  }, [activeGroup]);

  useEffect(() => {
    if (!viewerOpen || !currentStory) {
      setProgress(0);
      return;
    }

    if (currentMediaType === 'video') {
      setProgress(0);
      return;
    }

    setProgress(0);
    const duration = 5000; // 5s per story for images
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const percentage = Math.min(100, (elapsed / duration) * 100);
      setProgress(percentage);
      if (percentage >= 100) {
        clearInterval(interval);
        handleNext();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [viewerOpen, currentStory, currentMediaType, handleNext]);

  const handleVideoProgress = useCallback((event) => {
    const element = event.currentTarget;
    if (!element?.duration) return;
    const percentage = Math.min(100, (element.currentTime / element.duration) * 100);
    setProgress(percentage);
  }, []);

  return (
    <div className="w-full max-w-2xl mb-6">
      <CreateStory open={creatorOpen} setOpen={setCreatorOpen} />
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => (myStoryGroup ? handleOpenStory(myStoryGroup) : setCreatorOpen(true))}
            className={`h-16 w-16 rounded-full flex items-center justify-center ${myStoryGroup ? 'p-[2px] bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500' : 'border border-dashed border-muted-foreground/40'}`}
          >
            {myStoryGroup ? (
              <div className="h-full w-full rounded-full overflow-hidden bg-background">
                <img src={myStoryGroup?.stories?.[0]?.media || user?.profilePicture} alt="Your story" className="h-full w-full object-cover" />
              </div>
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </button>
          <span className="text-xs text-muted-foreground max-w-[72px] truncate">Your story</span>
        </div>
        {storyGroups
          .filter(group => group.author?._id !== user?._id)
          .map(group => (
            <StoryAvatar key={group.author._id} group={group} onOpen={handleOpenStory} />
          ))}
      </div>

      <Dialog open={viewerOpen} onOpenChange={handleViewerChange}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-black text-white aspect-[9/16] max-h-[90vh]">
          {currentStory ? (
            <div className="relative h-full w-full">
              <div className="absolute inset-x-0 top-0 p-4 flex gap-2">
                {activeGroup?.stories?.map((story, idx) => {
                  const width = idx < activeIndex ? '100%' : idx === activeIndex ? `${progress}%` : '0%';
                  return (
                    <div key={story._id} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
                      <div
                        className="h-full bg-white transition-[width] duration-100 ease-linear"
                        style={{ width }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="absolute top-4 right-4 z-10">
                <button
                  type="button"
                  onClick={closeViewer}
                  className="rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close stories</span>
                </button>
              </div>

              <div className="absolute top-4 left-4 right-20 z-10 flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-white/40">
                  <AvatarImage src={activeGroup?.author?.profilePicture} alt={activeGroup?.author?.username} />
                  <AvatarFallback>{activeGroup?.author?.username?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold leading-tight">{activeGroup?.author?.username}</span>
                  <span className="text-xs text-white/70">{relativeTime}</span>
                </div>
              </div>

              <div className="h-full w-full bg-black">
                {currentMediaType === 'video' ? (
                  <video
                    key={currentStory._id}
                    src={currentStory.media}
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    controls
                    playsInline
                    onTimeUpdate={handleVideoProgress}
                    onEnded={handleNext}
                  />
                ) : (
                  <img src={currentStory.media} alt="story" className="h-full w-full object-cover" />
                )}
              </div>

              {activeGroup?.stories?.length > 1 ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handlePrev}
                    disabled={activeIndex === 0}
                    className="absolute left-3 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-black/60 focus-visible:ring-0 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous story</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleNext}
                    disabled={activeIndex === activeGroup.stories.length - 1}
                    className="absolute right-3 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-black/60 focus-visible:ring-0 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next story</span>
                  </Button>
                </>
              ) : null}

              {currentStory?.caption ? (
                <div className="absolute bottom-6 left-6 right-6 z-10 text-sm leading-snug text-white">
                  {currentStory.caption}
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stories;
