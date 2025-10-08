import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useGetAllMessage from '@/hooks/useGetAllMessage';
import useGetRTM from '@/hooks/useGetRTM';

const Messages = ({ selectedUser }) => {
    useGetRTM();
    useGetAllMessage();
    const { messages } = useSelector((store) => store.chat);
    const { user } = useSelector((store) => store.auth);

    return (
        <div className='flex flex-1 flex-col overflow-hidden'>
            <div className='flex items-center justify-center border-b border-slate-200 bg-white/90 px-6 py-5'>
                <div className='flex flex-col items-center gap-2 text-center'>
                    <Avatar className='h-16 w-16 border border-indigo-100'>
                        <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span className='text-sm font-semibold text-slate-900'>{selectedUser?.username}</span>
                    <Button asChild size='sm' variant='outline' className='rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50'>
                        <Link to={`/profile/${selectedUser?._id}`}>View profile</Link>
                    </Button>
                </div>
            </div>
            <div className='flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-white via-indigo-50/40 to-white px-5 py-6'>
                {messages && messages.length > 0 ? (
                    messages.map((msg) => {
                        const isAuthor = msg.senderId === user?._id;
                        return (
                            <div key={msg._id} className={`flex ${isAuthor ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-xs rounded-2xl px-4 py-2 text-sm shadow-sm transition ${
                                        isAuthor
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                                    }`}
                                >
                                    {msg.message}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className='flex h-full items-center justify-center text-sm text-slate-400'>
                        Start the chat with a friendly hello.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
