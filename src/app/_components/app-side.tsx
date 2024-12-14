/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import useProject from '@/hooks/useProject'
import { cn } from '@/lib/utils'
import { BotIcon, CreditCardIcon, LayoutDashboardIcon, PlusCircleIcon, PresentationIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const AppSideBar = () => {
    const pathname = usePathname();
    const open = useSidebar();
    const items = [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboardIcon,
        },
        {
            title: "Q&A",
            url: "/qa",
            icon: BotIcon,
        },
        {
            title: "Meetings",
            url: "/meetings",
            icon: PresentationIcon,
        },
        {
            title: "Billing",
            url: "/billing",
            icon: CreditCardIcon
        }
    ];

    // for the second sidebar grup
    const { projects, projectId, setProjectId } = useProject();
    return (
        <Sidebar collapsible='icon' variant='floating'>
            <SidebarHeader>
                <div className='flex items-center gap-2'>
                    <Image src='https://img.icons8.com/?size=100&id=b2rw9AoJdaQb&format=png&color=000000' alt='logo' width={40} height={40} className='object-contain bg-transparent' />
                    {
                        open ? (
                            <h1 className='text-xl font-bold text-primary/80'>
                                GITCOLAB
                            </h1>
                        ) : null
                    }
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {
                                items.map(ele => {
                                    return (
                                        <SidebarMenuItem key={ele.title}>
                                            <SidebarMenuButton asChild>
                                                <Link href={ele.url} className={cn({
                                                    '!bg-primary !text-white': pathname === ele.url
                                                }, 'list-none')}>
                                                    <ele.icon />
                                                    <span>
                                                        {ele.title}
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })
                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Your Projects
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <div>
                                {
                                    projects !== undefined && projects.map((ele) => {
                                        const isActive = ele.id === projectId; // Check if the current project is active
                                        return (
                                            <SidebarMenuItem key={ele.name}>
                                                <SidebarMenuButton asChild>
                                                    <div
                                                        className='cursor-pointer flex items-center gap-2'
                                                        onClick={() => setProjectId(ele.id)}
                                                    >
                                                        <div
                                                            className={cn(
                                                                'rounded-md border size-6 flex items-center justify-center text-sm',
                                                                isActive ? 'bg-primary text-white' : 'bg-gray-200 text-black' // Apply active/inactive styles
                                                            )}
                                                        >
                                                            {ele.name[0]}
                                                        </div>
                                                        <span
                                                            className={cn(
                                                                'text-sm font-medium',
                                                                isActive ? 'text-primary' : 'text-gray-500' // Adjust text style
                                                            )}
                                                        >
                                                            {ele.name}
                                                        </span>
                                                    </div>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })
                                }
                            </div>
                            {/* now the create project button */}
                            <div className='h-2'></div>
                            <SidebarMenuItem>
                                <Link href='/create'>
                                    <Button size='sm' variant={'outline'} className='w-fit'>
                                        <PlusCircleIcon />
                                        Create Project
                                    </Button>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

export default AppSideBar