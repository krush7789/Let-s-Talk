import React from 'react';
import { useSelector } from 'react-redux';
import ReelComposer from './ReelComposer';
import ReelCard from './ReelCard';

const ReelsShelf = () => {
    const { reels, isLoading } = useSelector(store => store.reel);

    return (
        <div className='w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='font-semibold text-sm'>Reels</h2>
                    <p className='text-xs text-gray-500'>Enjoy full-screen vertical videos from your network.</p>
                </div>
                <ReelComposer />
            </div>
            {
                isLoading ? (
                    <div className='text-center text-sm text-gray-500 py-10'>Loading reels...</div>
                ) : reels.length === 0 ? (
                    <div className='text-center text-sm text-gray-500 py-10'>No reels yet. Be the first to share!</div>
                ) : (
                    <div className='flex flex-col gap-6'>
                        {reels.map(reel => <ReelCard key={reel._id} reel={reel} />)}
                    </div>
                )
            }
        </div>
    );
};

export default ReelsShelf;
