'use client'

import MeetingCard from '@/_components/MeetingCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useProject from '@/hooks/useProject'
import useRefresh from '@/hooks/useRefresh';
import { api } from '@/trpc/react';
import Link from 'next/link';
import React from 'react'
import { toast } from 'sonner';

const Meetings = () => {
    const { projectId } = useProject();
    const refetch = useRefresh();
    // well this component will be render while uploading will be going on in the backgound so that we need to refetch at a interval 
    const { data: meetings, isLoading } = api.project.getMeeetings.useQuery({ projectId }, {
        refetchInterval: 4000,
    });

    const deleteMeeting = api.project.deleteMeeting.useMutation();
    const handleDeleteMeeting = async (meeting: any) => {
        // first delete the meeting from db 
        try {
            const deleteRes = await fetch('/api/deleteFile', {
                method: 'DELETE',
                body: JSON.stringify(meeting.fileId)
            });
            if (!deleteRes.ok) {
                throw new Error("Error in deleting from imagekit io");
            }
            toast.success("Meeting deleted Successfully!!");
            refetch()
        } catch (error) {
            console.log('The Error in delete meeting', error);
            toast.error("Failed to deleted meeting");
        }
    }
    return (
        <>
            <MeetingCard />
            <div className="h-6"></div>
            <h1 className='text-xl font-semibold'>Meetings</h1>
            {
                meetings && meetings.length === 0 && (<div>No meetings Found</div>)
            }
            {
                isLoading && (<div>Loading...</div>)
            }
            <ul className='divide-y divide-gray-200'>
                {
                    meetings?.map((meeting) => (
                        <li key={meeting.id} className='flex items-center justify-between py-4 gap-x-6 border rounded-md px-2 shadow'>
                            <div>
                                <div className='min-w-0'>
                                    <div className='flex items-center gap-2'>
                                        <Link href={`/meetings/${meeting.id}`} className='text-sm font-semibold'>
                                            {meeting.name}
                                        </Link>
                                        {meeting.status === "PROCESSING" ? (
                                            <Badge className='bg-yellow-500 text-white cursor-pointer'>
                                                Processing...
                                            </Badge>
                                        ) : (<Badge className='bg-green-500 text-white cursor-pointer'> Completed</Badge>)}
                                    </div>
                                </div>
                                <div className='flex items-center text-xs text-gray-500 gap-x-2'>
                                    <p className='whitespace-nowrap'>
                                        {meeting.createdAt.toLocaleDateString()}
                                    </p>
                                    <p className='truncate'>
                                        {meeting.issues.length} issues
                                    </p>
                                </div>
                            </div>
                            <div className='flex items-center flex-none gap-x-4'>
                                <Link href={`meetings/${meeting.id}`}>
                                    <Button size='sm' variant='outline'>
                                        View Meeting
                                    </Button>
                                </Link>
                                <Button variant='destructive' size='sm' onClick={() => {
                                    deleteMeeting.mutate({ meetingId: meeting.id }, { onSuccess: () => { refetch() } })
                                }}>
                                    Delete Meeting
                                </Button>
                            </div>
                        </li>
                    ))
                }
            </ul>
        </>
    )
}

export default Meetings