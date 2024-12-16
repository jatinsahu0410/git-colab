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
                    <Image key={member.id} src={member.user.imageUrl || ""} alt={member.user.firstName || ''} height={30} width={30} className='rounded-full' />
                ))
            }
        </div>
    )
}

export default TeamMembers