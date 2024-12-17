'use client'

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useProject from '@/hooks/useProject'
import React, { useState } from 'react'
import { toast } from 'sonner';

const InviteButton = () => {
    const { projectId } = useProject();
    const [open, setOpen] = useState(false);
    const [copy, setCopy] = useState('')
    const handleCopy = () => {
        navigator.clipboard.writeText(`${window.location.origin}/join/${projectId}`)
        setCopy(`${window.location.origin}/join/${projectId}`)
        toast.success("Copied to clipboard");
    }
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Invite Team Member
                        </DialogTitle>
                    </DialogHeader>
                    <p className='text-sm text-gray-500'>
                        Ask them to copy and past that link
                    </p>
                    <Input
                        className='mt-4'
                        readOnly
                        onClick={handleCopy}
                        value={copy}
                    />
                </DialogContent>
            </Dialog>
            <Button size='sm' onClick={() => setOpen(true)}>Invite Member</Button>
        </>
    )
}

export default InviteButton