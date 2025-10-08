import React from 'react';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import useFollowRequests from '@/hooks/useFollowRequests';
import { toast } from 'sonner';

const FollowRequests = () => {
    const { followRequests } = useSelector((store) => store.auth);
    const { respondToRequest } = useFollowRequests();

    const handleRespond = async (requesterId, action) => {
        try {
            const res = await respondToRequest({ requesterId, action });
            if (res?.success) {
                toast.success(res.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Unable to update request');
        }
    };

    if (!followRequests?.length) return null;

    return (
        <section className='rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_20px_60px_-40px_rgba(15,118,110,0.35)] backdrop-blur'>
            <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-sm font-semibold text-slate-900'>Follow requests</h2>
                <span className='text-xs font-medium text-emerald-500'>{followRequests.length} pending</span>
            </div>
            <div className='space-y-3'>
                {followRequests.map((request) => (
                    <div key={request._id} className='flex items-center justify-between rounded-2xl border border-emerald-100/70 bg-emerald-50/60 p-3'>
                        <div className='flex items-center gap-3'>
                            <Avatar className='h-10 w-10 border border-emerald-100'>
                                <AvatarImage src={request.profilePicture} />
                                <AvatarFallback>RQ</AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col'>
                                <span className='text-sm font-semibold text-emerald-800'>{request.username}</span>
                                <span className='text-xs text-emerald-600'>{request.bio || 'Wants to follow you'}</span>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Button size='sm' className='rounded-full bg-emerald-500 text-white hover:bg-emerald-600' onClick={() => handleRespond(request._id, 'accept')}>
                                Confirm
                            </Button>
                            <Button
                                size='sm'
                                variant='outline'
                                className='rounded-full border-emerald-300 text-emerald-600 hover:bg-emerald-100'
                                onClick={() => handleRespond(request._id, 'decline')}
                            >
                                Dismiss
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FollowRequests;
