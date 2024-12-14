'use client';
import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Presentation, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { IKUpload, ImageKitProvider } from 'imagekitio-next';
import { v4 as uuidv4 } from 'uuid';
import { api } from '@/trpc/react';
import useProject from '@/hooks/useProject';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const MeetingCard: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const uploadMeeting = api.project.uploadMeeting.useMutation();
    const { project, projectId } = useProject();
    const router = useRouter(); 
    // the meeting will be send to assembly ai for processing
    const processMeeting = useMutation({
        mutationFn: async (data: { meetingUrl: string, meetingId: string}) => {
            console.log("The data from processMeeting : ", data);
            const {meetingId, meetingUrl} = data;
            const res = await axios.post('/api/process-meetings', {meetingId, meetingUrl})
            return res.data;
        }
    });
    
    // ImageKit.io credentials
    const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY || '';
    const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT || '';

    // Function to authenticate with ImageKit.io
    const authenticator = async () => {
        try {
            const response = await fetch('/api/auth');
            if (!response.ok) throw new Error(`Response failed with status ${response.status}`);

            const data = await response.json();
            console.log("The imagekitio auth  : ", data);
            const { signature, expire, token } = data;
            return { signature, expire, token };
        } catch (error) {
            console.error('ImageKit.io Authentication Error:', error);
            throw error;
        }
    };

    // Function to generate a unique file name
    const generateUniqueFileName = (originalName: string) => {
        const fileExtension = originalName.split('.').pop() || 'unknown';
        return `meeting-${Date.now()}-${uuidv4()}.${fileExtension}`;
    };

    // Handle upload progress
    const handleProgress = (percent: number) => {
        console.log("The event phase : ", percent);
        setProgress(percent);
    };

    // Handle upload success
    const handleSuccess = async (response: any) => {
        setIsUploading(false);
        // if no project 
        if (!project) return;

        console.log('Upload Success:', response);
        // after geting the url now we can save the meeting to the data base 
        uploadMeeting.mutate({
            projectId: projectId,
            meetingUrl: response.url,
            fileId: response.fileId,
            name: response.name
        }, {
            onSuccess: (meeting) => {
                toast.success("Meeting Uploaded and Saved to db");
                router.push("/meetings");
                processMeeting.mutateAsync({meetingUrl: meeting.meetingUrl, meetingId: meeting.id})
            },
            onError: () => {
                console.log("Error in uploading and saving meeting to db.");
                toast.error("The Meeting uploaded error");
            }
        })
    };

    // Handle upload error
    const handleError = (error: any) => {
        setIsUploading(false);
        setUploadError('Failed to upload the file. Please try again.');
        console.error('Upload Error:', error);
    };

    const uploadRef = useRef<HTMLInputElement | null>(null);

    return (
        <Card className="col-span-2 flex flex-col items-center justify-center p-4">
            {!isUploading && (
                <>
                    <Presentation className="mt-1 h-10 w-10 animate-bounce" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Create a new Meeting</h3>
                    <p className="mt-1 text-center text-sm text-gray-600">
                        Analyze your meeting with GTI-COLAB
                        <br />
                        POWERED BY ASSEMBLY AI
                    </p>

                    <ImageKitProvider
                        publicKey={publicKey}
                        urlEndpoint={urlEndpoint}
                        authenticator={authenticator}
                    >
                        <div className="mt-6">
                            <Button
                                onClick={() => uploadRef.current?.click()}
                                disabled={isUploading}
                                className="flex items-center gap-2"
                            >
                                <Upload className="h-5 w-5" aria-hidden="true" />
                                Upload Meeting
                            </Button>
                            <IKUpload
                                ref={uploadRef}
                                fileName={generateUniqueFileName('meeting-file')}
                                isPrivateFile={false}
                                onUploadStart={() => {
                                    setIsUploading(true);
                                    setProgress(0);
                                    setUploadError(null);
                                }}
                                onSuccess={handleSuccess}
                                onError={handleError}
                                onProgress={(e) => {
                                    e.preventDefault();
                                    handleProgress(e.eventPhase);
                                }}
                                accept="audio/*,video/*" // Restrict to audio and video files
                                folder={"/Gitcolab"}
                                validateFile={(file) => file.size < 20000000}
                                style={{ display: 'none' }} // Hide default input
                            />
                        </div>
                    </ImageKitProvider>
                </>
            )}

            {isUploading && (
                <div className="flex flex-col items-center justify-center">
                    <CircularProgressbar value={progress} text={`${Math.round(progress)}%`} className="size-20" />
                    <p className="text-sm text-gray-500 mt-2">Uploading your Meeting</p>
                </div>
            )}

            {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}
        </Card>
    );
};

export default MeetingCard;
