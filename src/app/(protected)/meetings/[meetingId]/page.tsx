import { api } from '@/trpc/react';
import React from 'react'
import IssueList from './issueList';

type Props = {
    params: Promise<{ meetingId: string }>
}

const MeetingPage = async ({ params }: Props) => {
    const { meetingId } = await params;

    return (
        <IssueList meetingId={meetingId} />
    )
}

export default MeetingPage