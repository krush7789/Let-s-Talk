import React from 'react';
import { Outlet } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';

const MainLayout = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 text-slate-900'>
      <div className='relative flex min-h-screen'>
        <LeftSidebar />
        <main className='flex-1 px-4 py-8 pb-20 md:ml-72 md:px-16 lg:px-24 transition-all duration-300'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
