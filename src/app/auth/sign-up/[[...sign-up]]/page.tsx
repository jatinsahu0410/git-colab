// app/auth/sign-up/page.tsx
'use client'
import { SignUp } from '@clerk/nextjs'
import React from 'react'

const SignUpComponent = () => {
    return (
        <div className="flex justify-center items-center min-h-screen text-white">
            <div className="bg-transparent bg-opacity-60 p-8 rounded-lg shadow-lg">
                <SignUp />
            </div>
        </div>
    )
}

export default SignUpComponent
