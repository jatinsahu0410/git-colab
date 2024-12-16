'use client';
import '@/styles/globals.css';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useClerk, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md animate-fadeInDown sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <h1 className="text-3xl font-bold tracking-wide text-primary">GitColab</h1>
          <div className="space-x-4 flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Image
                    src={user.imageUrl}
                    alt="profile"
                    className="w-12 h-12 rounded-full border-2 border-primary shadow-lg hover:scale-105 transition-transform"
                    width={48}
                    height={48}
                  />
                </Link>
                <Button
                  variant="outline"
                  onClick={() => signOut()}
                  className="hover:bg-red-50 text-red-600 border-red-300"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/sign-in">
                  <Button variant="outline" className="hover:bg-primary/10 text-primary">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button className="bg-primary hover:bg-primary/90 text-white">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto py-16 px-4 text-center animate-fadeIn">
        <h2 className="text-5xl font-bold text-gray-800 leading-snug">
          Collaborate, Learn, <span className="text-primary">and Build Together</span>
        </h2>
        <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
          Join forces with developers worldwide to build amazing projects, learn together, and stay ahead with
          the latest tools.
        </p>
        <div className="mt-10">
          <Link href="/auth/sign-up">
            <Button className="px-6 py-3 text-lg bg-primary hover:bg-primary/90 text-white shadow-lg">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="mt-16 grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <Card className="p-6 shadow-lg rounded-xl transform transition-transform hover:scale-105">
            <CardHeader>
              <h3 className="text-2xl font-semibold text-primary">Commit Summaries</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Stay in the loop with brief and accurate summaries of your project's latest commits.
              </p>
            </CardContent>
          </Card>
          {/* Card 2 */}
          <Card className="p-6 shadow-lg rounded-xl transform transition-transform hover:scale-105">
            <CardHeader>
              <h3 className="text-2xl font-semibold text-primary">AI-Powered Code Queries</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get immediate answers to code-related queries with our AI-driven assistant.
              </p>
            </CardContent>
          </Card>
          {/* Card 3 */}
          <Card className="p-6 shadow-lg rounded-xl transform transition-transform hover:scale-105">
            <CardHeader>
              <h3 className="text-2xl font-semibold text-primary">Meeting Summaries</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Upload meeting recordings and receive concise summaries of key issues discussed.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto flex justify-between items-center">
          <p className="text-sm">&copy; 2024 GitColab. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="/about" className="hover:text-primary">About</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
