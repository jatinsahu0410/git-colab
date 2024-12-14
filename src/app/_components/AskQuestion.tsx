'use client'
import MDEditor from "@uiw/react-markdown-editor";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import useProject from '@/hooks/useProject'
import Image from 'next/image';
import React, { useState } from 'react'
import { askQuestion } from '../action/respondQuestion';
import { readStreamableValue } from 'ai/rsc';
import CodeReference from "./Code-references";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import MarkdownEditor from "@uiw/react-markdown-editor";
import useRefresh from "@/hooks/useRefresh";

function AskQuestion() {
    const { project } = useProject();
    const [question, setQuestion] = useState<string>();
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [fileRefrences, setFileRefrences] = useState<{ fileName: string, sourceCode: string, summary: string }[]>([]);
    const [answer, setAnswer] = useState('');
    const saveAnswer = api.project.saveQuestion.useMutation();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setAnswer('');
        setFileRefrences([]);
        e.preventDefault();
        if (!project?.id) return;
        setLoading(true);

        const { output, fileRefrences } = await askQuestion(question!, project.id);
        setFileRefrences(fileRefrences)
        setOpen(true);

        // stream the output 
        for await (const chunk of readStreamableValue(output)) {
            if (chunk) {
                setAnswer(answer => answer + chunk);
            }
        }
        setQuestion('');
        setLoading(false);
    }
    const refetch = useRefresh();
    return (
        <>
            {/* to open the dialog box that will show the reply of the question modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[80vw] bg-white max-h-[95vh] overflow-y-scroll">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <DialogTitle>
                                <Image src='https://img.icons8.com/?size=100&id=b2rw9AoJdaQb&format=png&color=000000' alt='logo' width={40} height={40} className='object-contain bg-transparent' />
                            </DialogTitle>
                            <Button disabled={saveAnswer.isPending} variant={"outline"} onClick={() => {
                                saveAnswer.mutate({
                                    projectId: project?.id!,
                                    question: question!,
                                    answer,
                                    fileRefrence: fileRefrences,
                                }, {
                                    onSuccess: () => {
                                        toast.success('Answer saved!');
                                        refetch()
                                    },
                                    onError: () => {
                                        toast.error('Failed to save answer');
                                    }
                                })
                            }}>Save Answer</Button>
                        </div>
                    </DialogHeader>
                    <MarkdownEditor.Markdown
                        source={answer}
                        className="custom-markdown px-4 rounded-md  max-h-[40vh] overflow-y-scroll"
                        style={{
                            backgroundColor: '#ffffff',
                            color: '#333',
                            padding: '1rem',
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                        }}
                    />
                    <CodeReference fileReferences={fileRefrences} />
                    <Button type="button" onClick={() => { setOpen(!true) }}>Close</Button>
                </DialogContent>
            </Dialog>
            <Card className='relative col-span-3'>
                <CardHeader>
                    <CardTitle>
                        Ask @ Question
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea placeholder='Which file should I edit to change the home page' value={question} onChange={(e) => setQuestion(e.target.value)} />
                        <div className='h-4'></div>
                        <Button type='submit' disabled={loading}>
                            Ask GITCOLAB AI
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestion