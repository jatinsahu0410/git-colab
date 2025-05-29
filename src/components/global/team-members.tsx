'use client'
import useProject from '@/hooks/useProject'
import { api } from '@/trpc/react';
import Image from 'next/image';
import React from 'react'

const TeamMembers = () => {
    const { projectId } = useProject();
    const { data: members } = api.project.getTeamMembers.useQuery({ projectId });

    return (
        <div className='flex items-center gap-2'>
            {
                members?.map(member => (
                    <div className='min-w-50 min-h-50 rounded-full shadow-lg shadow-emerald-300'>
                        <Image key={member.id} src={member.user.imageUrl || ""} alt={member.user.firstName || ''} height={42} width={42} className='rounded-full' />
                    </div>
                ))
            }
        </div>
    )
}

export default TeamMembers