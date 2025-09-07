'use client';

import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Name } from '@coinbase/onchainkit/identity';
import { FrameContainer } from '@/components/FrameContainer';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { DistributeRevenueModal } from '@/components/DistributeRevenueModal';
import { PayoutHistory } from '@/components/PayoutHistory';
import { ContributorRow } from '@/components/ContributorRow';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Project, Contributor, CreateProjectData, DistributeRevenueData, Payout } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { Plus, Users, DollarSign, BarChart3, ArrowLeft, TrendingUp } from 'lucide-react';

type View = 'dashboard' | 'project-details' | 'create-project';

interface ToastState {
  isVisible: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function HomePage() {
  const { setFrameReady } = useMiniKit();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ isVisible: false, type: 'info', message: '' });

  // Mock data - in a real app, this would come from your backend/blockchain
  const [projects, setProjects] = useState<Project[]>([
    {
      projectId: '1',
      projectName: 'NFT Collection Alpha',
      creatorWalletAddress: '0x1234567890123456789012345678901234567890',
      createdAt: new Date('2024-01-15'),
      status: 'active',
      description: 'A collaborative NFT collection featuring digital art',
      totalRevenue: 2.5,
      totalDistributed: 2.45,
    },
    {
      projectId: '2',
      projectName: 'Music Album Beta',
      creatorWalletAddress: '0x1234567890123456789012345678901234567890',
      createdAt: new Date('2024-02-01'),
      status: 'active',
      description: 'Collaborative music album with multiple artists',
      totalRevenue: 1.8,
      totalDistributed: 1.764,
    },
  ]);

  const [contributors, setContributors] = useState<Contributor[]>([
    {
      contributorId: '1',
      projectId: '1',
      walletAddress: '0x1234567890123456789012345678901234567890',
      sharePercentage: 60,
      role: 'Lead Artist',
      onboardedAt: new Date('2024-01-15'),
      status: 'confirmed',
      name: 'Alice Creator',
    },
    {
      contributorId: '2',
      projectId: '1',
      walletAddress: '0x2345678901234567890123456789012345678901',
      sharePercentage: 40,
      role: 'Designer',
      onboardedAt: new Date('2024-01-16'),
      status: 'confirmed',
      name: 'Bob Designer',
    },
  ]);

  const [payouts, setPayouts] = useState<Payout[]>([
    {
      payoutId: '1',
      poolId: '1',
      contributorId: '1',
      amount: 1.47,
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      timestamp: new Date('2024-01-20'),
      status: 'completed',
    },
    {
      payoutId: '2',
      poolId: '1',
      contributorId: '2',
      amount: 0.98,
      transactionHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
      timestamp: new Date('2024-01-20'),
      status: 'completed',
    },
  ]);

  useEffect(() => {
    setFrameReady();
  }, [setFrameReady]);

  const showToast = (type: ToastState['type'], message: string) => {
    setToast({ isVisible: true, type, message });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleCreateProject = async (data: CreateProjectData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newProject: Project = {
        projectId: generateId(),
        projectName: data.projectName,
        creatorWalletAddress: '0x1234567890123456789012345678901234567890', // Would come from wallet
        createdAt: new Date(),
        status: 'active',
        description: data.description,
        totalRevenue: 0,
        totalDistributed: 0,
      };

      const newContributors: Contributor[] = data.contributors.map(c => ({
        contributorId: generateId(),
        projectId: newProject.projectId,
        walletAddress: c.walletAddress,
        sharePercentage: c.sharePercentage,
        role: c.role,
        onboardedAt: new Date(),
        status: 'confirmed',
        name: c.name,
      }));

      setProjects(prev => [...prev, newProject]);
      setContributors(prev => [...prev, ...newContributors]);
      setIsCreateModalOpen(false);
      showToast('success', 'Project created successfully!');
    } catch (error) {
      showToast('error', 'Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDistributeRevenue = async (data: DistributeRevenueData) => {
    setIsLoading(true);
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const projectContributors = contributors.filter(c => c.projectId === data.projectId);
      const newPayouts: Payout[] = projectContributors.map(contributor => ({
        payoutId: generateId(),
        poolId: generateId(),
        contributorId: contributor.contributorId,
        amount: data.amount * (contributor.sharePercentage / 100) * 0.98, // After 2% fee
        transactionHash: `0x${Math.random().toString(16).substring(2).padStart(64, '0')}`,
        timestamp: new Date(),
        status: 'completed',
      }));

      setPayouts(prev => [...prev, ...newPayouts]);
      
      // Update project totals
      setProjects(prev => prev.map(p => 
        p.projectId === data.projectId 
          ? { 
              ...p, 
              totalRevenue: (p.totalRevenue || 0) + data.amount,
              totalDistributed: (p.totalDistributed || 0) + (data.amount * 0.98)
            }
          : p
      ));

      setIsDistributeModalOpen(false);
      showToast('success', 'Revenue distributed successfully!');
    } catch (error) {
      showToast('error', 'Failed to distribute revenue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8 py-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gradient">CreatorChain</h1>
          <p className="text-textSecondary text-lg max-w-md mx-auto">
            Transparent revenue sharing for collaborative creators
          </p>
        </div>
        
        <div className="pt-4">
          <Wallet>
            <ConnectWallet>
              <Name />
            </ConnectWallet>
          </Wallet>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stats-card text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <DollarSign className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-textPrimary mb-1">
            {projects.reduce((sum, p) => sum + (p.totalRevenue || 0), 0).toFixed(3)} ETH
          </p>
          <p className="text-sm text-textMuted">Total Revenue</p>
        </div>
        
        <div className="stats-card text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-secondary-100 rounded-xl">
              <Users className="w-8 h-8 text-secondary-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-textPrimary mb-1">{projects.length}</p>
          <p className="text-sm text-textMuted">Active Projects</p>
        </div>
        
        <div className="stats-card text-center sm:col-span-1 col-span-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-accent-100 rounded-xl">
              <BarChart3 className="w-8 h-8 text-accent-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-textPrimary mb-1">{payouts.length}</p>
          <p className="text-sm text-textMuted">Total Payouts</p>
        </div>
      </div>

      {/* Projects Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-semibold text-textPrimary">My Projects</h2>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            New Project
          </Button>
        </div>

        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-xl border border-border">
              <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Plus className="w-8 h-8 text-textMuted" />
              </div>
              <h3 className="text-lg font-medium text-textPrimary mb-2">No projects yet</h3>
              <p className="text-textSecondary mb-6 max-w-sm mx-auto">
                Create your first project to start collaborating and sharing revenue with your team.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create Your First Project
              </Button>
            </div>
          ) : (
            projects.map((project, index) => (
              <div
                key={project.projectId}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProjectCard
                  project={project}
                  variant={project.status === 'active' ? 'active' : 'inactive'}
                  onClick={() => {
                    setSelectedProject(project);
                    setCurrentView('project-details');
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderProjectDetails = () => {
    if (!selectedProject) return null;

    const projectContributors = contributors.filter(c => c.projectId === selectedProject.projectId);
    const projectPayouts = payouts.filter(p => 
      projectContributors.some(c => c.contributorId === p.contributorId)
    );

    const distributionPercentage = selectedProject.totalRevenue 
      ? ((selectedProject.totalDistributed || 0) / selectedProject.totalRevenue) * 100 
      : 0;

    return (
      <div className="space-y-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('dashboard')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="w-fit"
          >
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-textPrimary mb-2">{selectedProject.projectName}</h1>
            <p className="text-textSecondary">{selectedProject.description}</p>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="stats-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-textPrimary">Total Revenue</h3>
              <div className="p-2 bg-primary-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-primary-600 mb-2">
              {(selectedProject.totalRevenue || 0).toFixed(3)} ETH
            </p>
            <p className="text-sm text-textMuted">
              Generated from project activities
            </p>
          </div>
          
          <div className="stats-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-textPrimary">Distributed</h3>
              <div className="p-2 bg-secondary-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-secondary-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-secondary-600 mb-2">
              {(selectedProject.totalDistributed || 0).toFixed(3)} ETH
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-secondary-500 to-secondary-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(distributionPercentage, 100)}%` }}
                />
              </div>
              <span className="text-sm text-textMuted">{distributionPercentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Contributors Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-xl font-semibold text-textPrimary">Contributors</h3>
            <Button
              onClick={() => setIsDistributeModalOpen(true)}
              leftIcon={<DollarSign className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Distribute Revenue
            </Button>
          </div>

          <div className="space-y-3">
            {projectContributors.length === 0 ? (
              <div className="text-center py-8 bg-surface rounded-xl border border-border">
                <div className="p-3 bg-gray-50 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Users className="w-6 h-6 text-textMuted" />
                </div>
                <p className="text-textMuted">No contributors added yet</p>
              </div>
            ) : (
              projectContributors.map((contributor, index) => (
                <div
                  key={contributor.contributorId}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ContributorRow contributor={contributor} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payout History */}
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <PayoutHistory payouts={projectPayouts} contributors={projectContributors} />
        </div>
      </div>
    );
  };

  return (
    <FrameContainer>
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'project-details' && renderProjectDetails()}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        isLoading={isLoading}
      />

      {selectedProject && (
        <DistributeRevenueModal
          isOpen={isDistributeModalOpen}
          onClose={() => setIsDistributeModalOpen(false)}
          onSubmit={handleDistributeRevenue}
          projectId={selectedProject.projectId}
          contributors={contributors.filter(c => c.projectId === selectedProject.projectId)}
          isLoading={isLoading}
        />
      )}

      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </FrameContainer>
  );
}
