import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useDispatch, useSelector } from 'react-redux';
import apiClient from '@/lib/apiClient';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { addReel } from '@/redux/reelSlice';

const ReelComposer = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [caption, setCaption] = useState('');
    const [videoPreview, setVideoPreview] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef();

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if(!file) return;
        if(!file.type.startsWith('video/')){
            toast.error('Please select a video file');
            return;
        }
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
    };

    const reset = () => {
        setCaption('');
        setVideoPreview('');
        setVideoFile(null);
        setOpen(false);
    };

    const submitReel = async () => {
        if(!videoFile){
            toast.error('Please choose a video');
            return;
        }
        const formData = new FormData();
        formData.append('caption', caption);
        formData.append('video', videoFile);
        try {
            setLoading(true);
            const res = await apiClient.post('/reel', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if(res.data.success){
                dispatch(addReel(res.data.reel));
                toast.success(res.data.message || 'Reel shared');
                reset();
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || 'Unable to share reel');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(videoPreview){
            return () => URL.revokeObjectURL(videoPreview);
        }
    }, [videoPreview]);

    return (
        <>
            <Button onClick={() => setOpen(true)} className='bg-black hover:bg-black/80 text-white'>Share reel</Button>
            <Dialog open={open} onOpenChange={(value) => value ? setOpen(true) : reset()}>
                <DialogContent onInteractOutside={reset} className='max-w-xl'>
                    <DialogHeader className='text-center font-semibold'>Create reel</DialogHeader>
                    <div className='flex items-center gap-3'>
                        <Avatar>
                            <AvatarImage src={user?.profilePicture} />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <span className='text-sm font-semibold'>{user?.username}</span>
                            <span className='text-xs text-gray-500'>Share immersive vertical videos</span>
                        </div>
                    </div>
                    <Textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder='Write a caption...'
                        className='focus-visible:ring-transparent'
                    />
                    {
                        videoPreview && (
                            <video src={videoPreview} controls className='rounded-xl w-full max-h-80' />
                        )
                    }
                    <input ref={fileInputRef} onChange={handleFileChange} type='file' accept='video/*' className='hidden' />
                    <div className='flex gap-3 justify-end'>
                        <Button variant='outline' onClick={() => fileInputRef.current?.click()}>Select video</Button>
                        {
                            loading ? (
                                <Button disabled>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Uploading
                                </Button>
                            ) : (
                                <Button onClick={submitReel} disabled={!videoFile}>Share</Button>
                            )
                        }
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ReelComposer;
