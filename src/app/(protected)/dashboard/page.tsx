"use client";

import React, { useEffect } from 'react'
import ArchiveButton from '@/components/global/archive-button';
import AskQuestion from '@/components/global/AskQuestion';
import CommitLoges from '@/components/global/commit-loges';
import InviteButton from '@/components/global/invite-button';
import MeetingCard from '@/components/global/MeetingCard';
import TeamMembers from '@/components/global/team-members';
import useProject from '@/hooks/useProject'
import { CatIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const Dashboard = () => {
  const { project } = useProject();
  return (
    <div className=''>
      {/* header component info about the repo and ask ai*/}
      <div className='flex items-center justify-between flex-wrap gap-y-4'>
        <div className='w-fit flex items-center rounded-md bg-primary px-4 py-3'>
          <CatIcon className='size-5 text-white' />
          <div className="ml-2 flex items-center">
            <p className='text-sm font-medium text-white'>
              This Project is linked to the repo {' '}
            </p>
            <Link href={project?.githubUrl ?? " "} className='inline-flex items-center text-white/80 hover:underline'>
              <ExternalLink className='ml-1 size-5 text-white hover:text-purple-400 hover: scale-105' />
            </Link>
          </div>
        </div>
        <div className="h-4"></div>
        <div className="flex items-center gap-4">
          <TeamMembers />
          <InviteButton />
          <ArchiveButton />
        </div>
      </div>
      {/* second part ask question and meeting  */}
      <div className="mt-4">
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-5'>
          <AskQuestion />
          <MeetingCard />
        </div>
      </div>

      {/* commit logs */}
      <div className="mt-8">
        <CommitLoges />
      </div>
    </div>
  )
}

export default Dashboard