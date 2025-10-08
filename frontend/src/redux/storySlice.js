import { createSlice } from "@reduxjs/toolkit";

const sortStories = (stories = []) =>
  [...(stories || [])]
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const normalizeStoryGroups = (groups = []) =>
  [...(groups || [])]
    .map(group => ({
      ...group,
      stories: sortStories(group?.stories)
    }))
    .filter(group => group.stories.length)
    .sort((a, b) => {
      const aTime = a.stories[0]?.createdAt ? new Date(a.stories[0].createdAt).getTime() : 0;
      const bTime = b.stories[0]?.createdAt ? new Date(b.stories[0].createdAt).getTime() : 0;
      return bTime - aTime;
    });

const storySlice = createSlice({
  name: 'story',
  initialState: {
    stories: []
  },
  reducers: {
    setStories: (state, action) => {
      state.stories = normalizeStoryGroups(action.payload || []);
    },
    addStory: (state, action) => {
      const story = action.payload;
      if (!story?.author?._id) return;
      const authorId = story.author._id;
      const existingGroupIndex = state.stories.findIndex(group => group.author._id === authorId);

      if (existingGroupIndex !== -1) {
        const group = state.stories[existingGroupIndex];
        group.stories = sortStories([story, ...(group.stories || [])]);
      } else {
        state.stories = [
          { author: story.author, stories: [story] },
          ...state.stories
        ];
      }

      state.stories = normalizeStoryGroups(state.stories);
    }
  }
});

export const { setStories, addStory } = storySlice.actions;
export default storySlice.reducer;
