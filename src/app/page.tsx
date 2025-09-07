'use client';

import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { FrameContainer } from '@/components/layout/FrameContainer';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjects } from '@/hooks/useProjects';
import { Plus, Wallet, Users, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { login, logout, authenticated, user } = usePrivy();
  const { projects, loading, error } = useProjects();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Show login screen if not authenticated
  if (!authenticated) {
    return (
      <FrameContainer
        title="CreatorChain"
        subtitle="Transparent revenue sharing for collaborative creators"
      >
        <div className="space-y-6">
          {/* Features */}
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-heading font-semibold text-textPrimary">
                      Collaborative Projects
                    </h3>
                    <p className="text-caption text-textSecondary">
                      Set up revenue splits with your collaborators
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-heading font-semibold text-textPrimary">
                      Automated Payouts
                    </h3>
                    <p className="text-caption text-textSecondary">
                      Revenue is automatically distributed on-chain
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-heading font-semibold text-textPrimary">
                      Transparent Auditing
                    </h3>
                    <p className="text-caption text-textSecondary">
                      All transactions are verifiable on Base
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>

          <p className="text-caption text-textSecondary text-center">
            Connect your wallet or Farcaster account to get started
          </p>
        </div>
      </FrameContainer>
    );
  }

  // Show main dashboard if authenticated
  return (
    <FrameContainer
      title="My Projects"
      subtitle={`Welcome back, ${user?.farcaster?.displayName || 'Creator'}!`}
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-display font-bold text-primary">
                {projects.length}
              </div>
              <div className="text-caption text-textSecondary">
                Active Projects
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-display font-bold text-secondary">
                {projects.reduce((sum, p) => sum + (p.totalRevenue || 0), 0).toFixed(2)}
              </div>
              <div className="text-caption text-textSecondary">
                Total Revenue (USDC)
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create New Project Button */}
        <Link href="/projects/new">
          <Button className="w-full" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Create New Project
          </Button>
        </Link>

        {/* Projects List */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-caption text-textSecondary">Loading projects...</p>
            </div>
          )}

          {error && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-caption text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && projects.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-heading font-semibold text-textPrimary mb-2">
                  No projects yet
                </h3>
                <p className="text-caption text-textSecondary mb-4">
                  Create your first collaborative project to start sharing revenue with your team.
                </p>
                <Link href="/projects/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {projects.map((project) => (
            <Link key={project.projectId} href={`/projects/${project.projectId}`}>
              <ProjectCard
                project={project}
                onClick={() => {}}
              />
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={logout}
          className="w-full"
        >
          Disconnect Wallet
        </Button>
      </div>
    </FrameContainer>
  );
}
