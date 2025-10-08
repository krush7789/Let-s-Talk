import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Loader2, Plus } from 'lucide-react';
import { readFileAsDataURL } from '@/lib/utils';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addStory } from '@/redux/storySlice';

const CreateStory = ({ open, setOpen }) => {
  const mediaRef = useRef();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const dataUrl = await readFileAsDataURL(selectedFile);
      setPreview(dataUrl);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview('');
    setCaption('');
  };

  const handleSubmit = async () => {
    if (!file) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('media', file);
      if (caption) formData.append('caption', caption);
      const res = await axios.post('https://let-s-talk-lq7h.onrender.com/api/v1/story', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      if (res.data.success) {
        dispatch(addStory(res.data.story));
        toast.success(res.data.message);
        resetForm();
        setOpen(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to share story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="sm:max-w-[425px]">
        <DialogHeader className="text-center font-semibold">Create Story</DialogHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="profile" />
            <AvatarFallback>
              <Plus className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-sm">{user?.username}</h2>
            <p className="text-xs text-muted-foreground">Share a moment that disappears in 24 hours.</p>
          </div>
        </div>
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Say something about your story..."
          className="focus-visible:ring-transparent border-none"
          rows={2}
        />
        {preview ? (
          <div className="w-full h-72 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            <img src={preview} alt="story preview" className="object-cover h-full w-full" />
          </div>
        ) : (
          <button
            onClick={() => mediaRef.current?.click()}
            className="w-full h-72 rounded-lg border border-dashed border-muted-foreground/40 flex flex-col items-center justify-center text-sm text-muted-foreground"
          >
            <Plus className="h-6 w-6 mb-2" />
            Tap to add photo or video
          </button>
        )}
        <input ref={mediaRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        {preview && (
          loading ? (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sharing...
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="w-full">
              Share to story
            </Button>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateStory;
