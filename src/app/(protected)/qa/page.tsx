'use client'
import AskQuestion from '@/_components/AskQuestion';
import CodeReference from '@/_components/Code-references';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import useProject from '@/hooks/useProject'
import { api } from '@/trpc/react';
import MarkdownEditor from '@uiw/react-markdown-editor';
import Image from 'next/image';
import React, { useState } from 'react'

const QAPage = () => {
  const { projectId } = useProject();
  const { data: questions } = api.project.getQuestions.useQuery({ projectId: projectId });
  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions?.[questionIndex];
  return (
    <div>
      <Sheet>
        <AskQuestion />
        <div className='h-4'></div>
        <h1 className='text-xl font-semibold'>Saved Question</h1>
        <div className="h-2"></div>
        <div className='flex flex-col gap-2'>
          {questions?.map((question, idx) => (
            <React.Fragment key={question.id}>
              <SheetTrigger onClick={() => setQuestionIndex(idx)}>
                <div className='flex items-center gap-4 bg-white rounded-lg px-4 py-3 shadow border'>
                  <Image className='rounded-full' width={30} height={30} src={question.user.imageUrl ?? ""} alt='porfile image' />
                  <div className='text-left flex flex-col'>
                    <div className='flex items-center gap-2'>
                      <p className='text-gray-700 line-clamp-1 text-lg font-medium'>
                        {question.question}
                      </p>
                      <span className='text-xs text-gray-400 whitespace-nowrap'>
                        {question.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className='text-gray-500 line-clamp-1 text-sm'>
                      {question.answer}
                    </p>
                  </div>
                </div>
              </SheetTrigger>
            </React.Fragment>
          ))}
        </div>
        {/* now it clicked on a question */}
        {
          question && (
            <SheetContent side="right"
              className="!w-[80vw] !max-w-[80vw] overflow-y-auto scrollbar-hide">
              <SheetTitle>
                {question.question}
              </SheetTitle>
              <MarkdownEditor.Markdown
                source={question.answer}
                className="custom-markdown px-4 rounded-md  max-h-[60vh] overflow-y-scroll"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#333',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                }}
              />
              <div className="h-1"></div>
              <div className="h-[400px]">
                <CodeReference fileReferences={question.fileReference ?? [] as any} />
              </div>
            </SheetContent>
          )
        }
      </Sheet>
    </div>
  )
}

export default QAPage