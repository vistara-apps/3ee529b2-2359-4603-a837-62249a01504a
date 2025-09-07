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
import { Plus, Users, DollarSign, BarChart3, ArrowLeft } from 'lucide-react';

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
    <div className="space-y-xl py-lg">
      <div className="text-center space-y-md">
        <h1 className="text-3xl font-bold text-textPrimary">CreatorChain</h1>
        <p className="text-textSecondary">
          Transparent revenue sharing for collaborative creators
        </p>
        
        <Wallet>
          <ConnectWallet>
            <Name />
          </ConnectWallet>
        </Wallet>
      </div>

      <div className="grid grid-cols-3 gap-md">
        <div className="text-center p-md bg-surface rounded-lg shadow-card">
          <DollarSign className="w-8 h-8 text-primary mx-auto mb-sm" />
          <p className="text-2xl font-bold text-textPrimary">
            {projects.reduce((sum, p) => sum + (p.totalRevenue || 0), 0).toFixed(2)} ETH
          </p>
          <p className="text-sm text-textSecondary">Total Revenue</p>
        </div>
        
        <div className="text-center p-md bg-surface rounded-lg shadow-card">
          <Users className="w-8 h-8 text-secondary mx-auto mb-sm" />
          <p className="text-2xl font-bold text-textPrimary">{projects.length}</p>
          <p className="text-sm text-textSecondary">Active Projects</p>
        </div>
        
        <div className="text-center p-md bg-surface rounded-lg shadow-card">
          <BarChart3 className="w-8 h-8 text-accent mx-auto mb-sm" />
          <p className="text-2xl font-bold text-textPrimary">{payouts.length}</p>
          <p className="text-sm text-textSecondary">Total Payouts</p>
        </div>
      </div>

      <div className="space-y-md">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-textPrimary">My Projects</h2>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Button>
        </div>

        <div className="space-y-md">
          {projects.map((project) => (
            <ProjectCard
              key={project.projectId}
              project={project}
              variant={project.status === 'active' ? 'active' : 'inactive'}
              onClick={() => {
                setSelectedProject(project);
                setCurrentView('project-details');
              }}
            />
          ))}
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

    return (
      <div className="space-y-xl py-lg">
        <div className="flex items-center space-x-md">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center space-x-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-2xl font-bold text-textPrimary">{selectedProject.projectName}</h1>
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div className="p-md bg-surface rounded-lg shadow-card">
            <h3 className="text-lg font-semibold text-textPrimary mb-sm">Revenue</h3>
            <p className="text-2xl font-bold text-primary">
              {(selectedProject.totalRevenue || 0).toFixed(3)} ETH
            </p>
          </div>
          <div className="p-md bg-surface rounded-lg shadow-card">
            <h3 className="text-lg font-semibold text-textPrimary mb-sm">Distributed</h3>
            <p className="text-2xl font-bold text-secondary">
              {(selectedProject.totalDistributed || 0).toFixed(3)} ETH
            </p>
          </div>
        </div>

        <div className="space-y-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-textPrimary">Contributors</h3>
            <Button
              onClick={() => setIsDistributeModalOpen(true)}
              className="flex items-center space-x-xs"
            >
              <DollarSign className="w-4 h-4" />
              <span>Distribute Revenue</span>
            </Button>
          </div>

          <div className="space-y-sm">
            {projectContributors.map((contributor) => (
              <ContributorRow
                key={contributor.contributorId}
                contributor={contributor}
              />
            ))}
          </div>
        </div>

        <PayoutHistory payouts={projectPayouts} contributors={projectContributors} />
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
