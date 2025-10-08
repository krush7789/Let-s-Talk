import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import CreateStory from './CreateStory';
import { Plus } from 'lucide-react';

const StoryAvatar = ({ group, onOpen }) => {
  const cover = group?.stories?.[0]?.media;
  return (
    <button
      onClick={() => onOpen(group)}
      className="flex flex-col items-center gap-1 focus:outline-none"
    >
      <div className="h-16 w-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500">
        <div className="h-full w-full rounded-full bg-background overflow-hidden">
          <img src={cover || group?.author?.profilePicture} alt={group?.author?.username} className="h-full w-full object-cover" />
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
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const sortedStories = useMemo(() => {
    if (!stories?.length) return [];
    return [...stories].sort((a, b) => {
      const firstA = a.stories?.[0]?.createdAt ? new Date(a.stories[0].createdAt).getTime() : 0;
      const firstB = b.stories?.[0]?.createdAt ? new Date(b.stories[0].createdAt).getTime() : 0;
      return firstB - firstA;
    });
  }, [stories]);

  const handleOpenStory = (group) => {
    setActiveGroup(group);
    setActiveIndex(0);
    setViewerOpen(true);
  };

  const handleNext = () => {
    if (!activeGroup) return;
    setActiveIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= activeGroup.stories.length) {
        setViewerOpen(false);
        return prev;
      }
      return nextIndex;
    });
  };

  const currentStory = activeGroup?.stories?.[activeIndex];

  const myStoryGroup = sortedStories.find(group => group.author._id === user?._id);

  return (
    <div className="w-full max-w-2xl mb-6">
      <CreateStory open={creatorOpen} setOpen={setCreatorOpen} />
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => myStoryGroup ? handleOpenStory(myStoryGroup) : setCreatorOpen(true)}
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
        {sortedStories
          .filter(group => group.author._id !== user?._id)
          .map(group => (
            <StoryAvatar key={group.author._id} group={group} onOpen={handleOpenStory} />
          ))}
      </div>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-black">
          {currentStory ? (
            <div className="relative w-full h-full">
              <img src={currentStory.media} alt="story" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 top-0 p-4 flex gap-2">
                {activeGroup?.stories?.map((story, idx) => (
                  <div
                    key={story._id}
                    className={`h-1 rounded-full bg-white/40 flex-1 ${idx <= activeIndex ? 'bg-white' : ''}`}
                  />
                ))}
              </div>
              <div className="absolute top-4 left-4 flex items-center gap-2 text-white">
                <Avatar className="h-8 w-8 border border-white/40">
                  <AvatarImage src={activeGroup?.author?.profilePicture} alt={activeGroup?.author?.username} />
                  <AvatarFallback>{activeGroup?.author?.username?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{activeGroup?.author?.username}</span>
                  {currentStory?.caption ? (
                    <span className="text-xs text-white/80">{currentStory.caption}</span>
                  ) : null}
                </div>
              </div>
              <Button
                variant="ghost"
                className="absolute inset-0 bg-transparent hover:bg-transparent focus-visible:ring-0"
                onClick={handleNext}
              >
                <span className="sr-only">Next story</span>
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stories;
