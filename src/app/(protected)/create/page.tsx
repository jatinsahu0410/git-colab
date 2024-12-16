'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useRefresh from '@/hooks/useRefresh';
import { api } from '@/trpc/react';
import { Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import { useForm } from "react-hook-form";
import { toast } from "sonner"

type FormInput = {
  repoUrl: string,
  projectName: string,
  githubToken?: string
}


const CreatePoject = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const creditRequired = api.project.creditRequired.useMutation();


  const refetch = useRefresh();

  const onSubmit = (data: FormInput) => {
    // firstly we have to checck how much credits are required to process the project and whether the user have enough credits or not 
    if (!!creditRequired.data) {
      console.log("The form data is : ", data);
      createProject.mutate({
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken
      }, {
        onSuccess: () => {
          toast.success("Project created successfully");
          void refetch()
          reset()
        },
        onError: () => {
          toast.error("Error in creatomga ")
        }
      }
      )
    } else {
      creditRequired.mutate({ githubUrl: data.repoUrl, githubToken: data.githubToken })
    }
  }

  const hasEnoughCredits = creditRequired.data?.userCredits ? creditRequired.data.fileCount <= creditRequired.data.userCredits : true;

  return (
    <>
      <div className='flex items-center gap-12 h-full justify-center'>
        <div>
          <Image src='/peron.svg' alt='person' height={250} width={300} />
        </div>
        <div>
          <div>
            <h1 className='text-2xl font-semibold'>
              Link Your Github Repo: 🔗
            </h1>
            <p className='text-sm text-muted-foreground'>
              Enter URL of your repo to link it to GITCOLAB
            </p>
          </div>
          <div className='h-4'></div>
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                {...register('projectName', { required: true })}
                placeholder='Enter the Project Name'
                required
              />
              <div className='h-2'></div>
              <Input
                {...register('repoUrl', { required: true })}
                placeholder='Enter the repo URL'
                required
              />
              <div className="h-2"></div>
              <Input
                {...register('githubToken')}
                placeholder='Github Token (Options) if repo is private'
              />
              {
                !!creditRequired.data && (
                  <>
                    <div className='mt-4 bg-orange-50 px-4 py-2 rounded-md border border-orange-200 text-orange-700'>
                      <div className='flex items-center gap-2 '>
                        <Info className='size-4' />
                        <p className='text-sm'>You will be charged <strong>{creditRequired.data.fileCount}</strong> credits for this.</p>
                      </div>
                      <p className='text-sm text-blue-600 ml-6'>You have <strong>{creditRequired.data.userCredits}</strong> cerdits remaining!!</p>
                    </div>
                  </>
                )
              }
              <div className="h-4"></div>
              <div className='flex items-center'>
                <Button type='submit' disabled={createProject.isPending || !!creditRequired.isPending || !hasEnoughCredits}>
                  {
                    !!creditRequired.data ? 'Create Project' : 'Check credits'
                  }
                </Button>
                {
                  !hasEnoughCredits && (
                    <Link href={'/billing'}>
                      <Button className='ml-2'>
                        Buy Credits
                      </Button>
                    </Link>
                  )
                }
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreatePoject