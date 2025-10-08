import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

const SuggestedUsers = () => {
    const { suggestedUsers } = useSelector((store) => store.auth);

    if (!suggestedUsers?.length) {
        return null;
    }

    return (
        <section className='rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_20px_60px_-40px_rgba(30,64,175,0.4)] backdrop-blur'>
            <div className='mb-4 flex items-center justify-between'>
                <div>
                    <h2 className='text-sm font-semibold text-slate-900'>Connections worth exploring</h2>
                    <p className='text-xs text-slate-500'>Discover people aligned with your vibe.</p>
                </div>
                <Link to='/search' className='text-xs font-medium text-indigo-600 hover:text-indigo-500'>See all</Link>
            </div>
            <div className='space-y-4'>
                {suggestedUsers.slice(0, 5).map((profile) => (
                    <div key={profile._id} className='flex items-center justify-between rounded-2xl border border-slate-100/80 bg-slate-50/60 p-3 transition hover:border-indigo-200'>
                        <div className='flex items-center gap-3'>
                            <Avatar className='h-10 w-10 border border-indigo-100'>
                                <AvatarImage src={profile?.profilePicture} alt={profile?.username} />
                                <AvatarFallback>SG</AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col'>
                                <Link to={`/profile/${profile?._id}`} className='text-sm font-semibold text-slate-900 hover:text-indigo-600'>
                                    {profile?.username}
                                </Link>
                                <span className='text-xs text-slate-500'>{profile?.bio || 'New on Pulseboard'}</span>
                            </div>
                        </div>
                        <Button asChild size='sm' variant='outline' className='rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-500/10'>
                            <Link to={`/profile/${profile?._id}`}>View</Link>
                        </Button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default SuggestedUsers;
