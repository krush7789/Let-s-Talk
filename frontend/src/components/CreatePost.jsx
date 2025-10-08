import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { readFileAsDataURL } from '@/lib/utils';
import { ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const dataUrl = await readFileAsDataURL(selected);
      setImagePreview(dataUrl);
    }
  };

  const createPostHandler = async () => {
    if (!file) {
      toast.error('Attach a photo or video to share.');
      return;
    }
    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('image', file);
    try {
      setLoading(true);
      const res = await apiClient.post('/post/addpost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setCaption('');
        setFile(null);
        setImagePreview('');
        setOpen(false);
      }
    } catch (error) {
      toast.error(error.message || error.response?.data?.message || 'Unable to create post');
    } finally {
      setLoading(false);
    }
  };

  const closeComposer = () => {
    setOpen(false);
    setCaption('');
    setImagePreview('');
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => (!value ? closeComposer() : setOpen(value))}>
      <DialogContent className='max-w-xl rounded-3xl border border-slate-200/70 bg-white/95 shadow-[0_25px_80px_-40px_rgba(30,64,175,0.4)] backdrop-blur'>
        <DialogHeader className='text-center text-base font-semibold text-slate-900'>Share a new moment</DialogHeader>
        <div className='flex items-center gap-3 rounded-2xl bg-slate-50/80 p-3'>
          <Avatar className='h-12 w-12 border border-indigo-100'>
            <AvatarImage src={user?.profilePicture} alt={user?.username} />
            <AvatarFallback>YOU</AvatarFallback>
          </Avatar>
          <div>
            <h1 className='text-sm font-semibold text-slate-900'>{user?.username}</h1>
            <span className='text-xs text-slate-500'>{user?.bio || 'Let friends know what you are up to.'}</span>
          </div>
        </div>
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className='min-h-[120px] rounded-2xl border border-slate-200 bg-white/80 text-sm text-slate-700 focus-visible:border-indigo-300 focus-visible:ring-indigo-100'
          placeholder='Describe your moment…'
        />
        {imagePreview ? (
          <div className='relative flex h-64 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100'>
            <img src={imagePreview} alt='preview' className='h-full w-full object-cover' />
          </div>
        ) : (
          <button
            onClick={() => imageRef.current?.click()}
            className='flex h-40 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600'
          >
            <ImageIcon className='mb-2 h-6 w-6' />
            Tap to add a photo or video
          </button>
        )}
        <input ref={imageRef} type='file' accept='image/*,video/*' className='hidden' onChange={fileChangeHandler} />
        <div className='flex items-center justify-between gap-4'>
          <Button onClick={() => imageRef.current?.click()} variant='outline' className='rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50'>
            {imagePreview ? 'Replace media' : 'Choose from device'}
          </Button>
          {imagePreview && (
            loading ? (
              <Button className='rounded-full bg-indigo-500 px-6 text-sm text-white hover:bg-indigo-600'>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Posting
              </Button>
            ) : (
              <Button onClick={createPostHandler} className='rounded-full bg-indigo-600 px-6 text-sm text-white hover:bg-indigo-700'>
                Post now
              </Button>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
