import React from 'react';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import useFollowRequests from '@/hooks/useFollowRequests';
import { toast } from 'sonner';

const FollowRequests = () => {
    const { followRequests } = useSelector(store => store.auth);
    const { respondToRequest } = useFollowRequests();

    const handleRespond = async (requesterId, action) => {
        try {
            const res = await respondToRequest({ requesterId, action });
            if(res?.success){
                toast.success(res.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Unable to update request');
        }
    };

    if(!followRequests?.length) return null;

    return (
        <div className='mt-8 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm'>
            <div className='flex items-center justify-between mb-4'>
                <h2 className='font-semibold text-sm'>Follow requests</h2>
                <span className='text-xs text-gray-500'>{followRequests.length}</span>
            </div>
            <div className='flex flex-col gap-4'>
                {followRequests.map(request => (
                    <div key={request._id} className='flex items-center justify-between gap-2'>
                        <div className='flex items-center gap-3'>
                            <Avatar className='h-10 w-10'>
                                <AvatarImage src={request.profilePicture} />
                                <AvatarFallback>RQ</AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col'>
                                <span className='text-sm font-semibold'>{request.username}</span>
                                <span className='text-xs text-gray-500'>{request.bio || 'Wants to follow you'}</span>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Button size='sm' onClick={() => handleRespond(request._id, 'accept')}>Confirm</Button>
                            <Button size='sm' variant='outline' onClick={() => handleRespond(request._id, 'decline')}>Delete</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FollowRequests;
