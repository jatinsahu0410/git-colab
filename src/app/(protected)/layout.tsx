import { SidebarProvider } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'
import AppSideBar from '../_components/app-side'

type Props = {
    children: React.ReactNode
}

const SidebarLayout = ({ children }: Props) => {
    return (
        <div>
            <SidebarProvider>
                <AppSideBar />
                <main className=' w-full m-2'>
                    <div className='flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md py-2 px-4'>
                        {/* <SearchBar /> */}
                        <div className='ml-auto'></div>
                        <UserButton />
                    </div>
                    {/* the main content */}
                    <div className='h-4'></div>
                    <div className='border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4'>
                        {children}
                    </div>
                </main>
            </SidebarProvider>
        </div>
    )
}

export default SidebarLayout