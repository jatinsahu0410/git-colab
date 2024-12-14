/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client'
import ArchiveButton from '@/app/_components/archive-button';
import AskQuestion from '@/app/_components/AskQuestion';
import CommitLoges from '@/app/_components/commit-loges';
import InviteButton from '@/app/_components/invite-button';
import MeetingCard from '@/app/_components/MeetingCard';
import TeamMembers from '@/app/_components/team-members';
import useProject from '@/hooks/useProject'
import { ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

const Dashboard = () => {
  const { project } = useProject();
  return (
    <div className=''>
      {/* header component info about the repo and ask ai*/}
      <div className='flex items-center justify-between flex-wrap gap-y-4'>
        <div className='w-fit flex items-center rounded-md bg-primary px-4 py-3'>
          <Github className='size-5 text-white' />
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