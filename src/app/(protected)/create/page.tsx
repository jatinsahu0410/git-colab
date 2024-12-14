'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useRefresh from '@/hooks/useRefresh';
import { api } from '@/trpc/react';
import Image from 'next/image';
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
  const refetch = useRefresh();

  const onSubmit = (data: FormInput) => {
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
  }
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
              <div className="h-4"></div>
              <Button type='submit' disabled={createProject.isPending}>
                Create Project
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreatePoject