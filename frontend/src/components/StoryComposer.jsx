import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { readFileAsDataURL } from '@/lib/utils';
import apiClient from '@/lib/apiClient';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { addStory } from '@/redux/storySlice';

const StoryComposer = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [mediaPreview, setMediaPreview] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef();

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setMediaFile(file);
        if(file.type.startsWith('image/')){
            const preview = await readFileAsDataURL(file);
            setMediaPreview(preview);
        }else{
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const resetComposer = () => {
        setMediaPreview('');
        setMediaFile(null);
        setCaption('');
        setOpen(false);
    };

    const handleSubmit = async () => {
        if(!mediaFile){
            toast.error('Please select an image or video');
            return;
        }
        const formData = new FormData();
        formData.append('caption', caption);
        formData.append('media', mediaFile);
        try {
            setLoading(true);
            const res = await apiClient.post('/story', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if(res.data.success){
                dispatch(addStory(res.data.story));
                toast.success('Story added');
                resetComposer();
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || 'Unable to add story');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(mediaPreview && mediaFile && !mediaFile.type.startsWith('image/')){
            return () => URL.revokeObjectURL(mediaPreview);
        }
    }, [mediaPreview, mediaFile]);

    return (
        <>
            <Button variant='outline' className='w-full justify-start text-sm' onClick={() => setOpen(true)}>Share story</Button>
            <Dialog open={open} onOpenChange={(value) => value ? setOpen(true) : resetComposer()}>
                <DialogContent onInteractOutside={resetComposer}>
                    <DialogHeader className='text-center font-semibold'>Create story</DialogHeader>
                    <div className='flex items-center gap-3'>
                        <Avatar>
                            <AvatarImage src={user?.profilePicture} alt='profile' />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <span className='text-sm font-semibold'>{user?.username}</span>
                            <span className='text-xs text-gray-500'>Stories disappear after 24h</span>
                        </div>
                    </div>
                    <Textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder='Add a caption (optional)'
                        className='focus-visible:ring-transparent'
                    />
                    {
                        mediaPreview && (
                            mediaFile?.type?.startsWith('image/') ? (
                                <img src={mediaPreview} alt='preview' className='w-full rounded-xl object-cover max-h-80' />
                            ) : (
                                <video src={mediaPreview} controls className='w-full rounded-xl max-h-80' />
                            )
                        )
                    }
                    <input type='file' accept='image/*,video/*' ref={fileInputRef} onChange={handleFileChange} className='hidden' />
                    <div className='flex gap-3 justify-end'>
                        <Button variant='secondary' onClick={() => fileInputRef.current?.click()}>Select media</Button>
                        {
                            loading ? (
                                <Button disabled>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Uploading
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={!mediaFile}>Share</Button>
                            )
                        }
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default StoryComposer;
