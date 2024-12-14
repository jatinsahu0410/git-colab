'use client'
import { Button } from '@/components/ui/button';
import useProject from '@/hooks/useProject';
import useRefresh from '@/hooks/useRefresh';
import { api } from '@/trpc/react'
import React from 'react'
import { toast } from 'sonner';

const ArchiveButton = () => {
    const archiveProject = api.project.archiveProject.useMutation();
    const { projectId } = useProject();
    const refetch = useRefresh();
    return (
        <Button disabled={archiveProject.isPending} size='sm' variant='destructive' onClick={() => {
            const confirm = window.confirm("are you sure u want to archive this project");
            if (confirm) archiveProject.mutate({ projectId: projectId }, {
                onSuccess: () => {
                    toast.success("The project is archived");
                    refetch();
                },
                onError: () => {
                    toast.error("Error in archiving the project!! sorry")
                }
            })
        }}>
            Archive
        </Button>
    )
}

export default ArchiveButton