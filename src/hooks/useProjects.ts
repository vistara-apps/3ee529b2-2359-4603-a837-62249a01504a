import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { 
  createProject as createProjectDB,
  getProjectsByCreator,
  addContributor,
  getContributorsByProject
} from '@/lib/supabase';
import { generateId, handleError } from '@/lib/utils';
import type { 
  Project, 
  Contributor, 
  CreateProjectForm, 
  AddContributorForm,
  UseProjectsReturn 
} from '@/types';

export function useProjects(): UseProjectsReturn {
  const { user } = usePrivy();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = user?.wallet?.address;

  // Fetch projects for the current user
  const fetchProjects = useCallback(async () => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getProjectsByCreator(walletAddress);
      
      // Transform database data to our Project type
      const transformedProjects: Project[] = data.map((project: any) => ({
        projectId: project.id,
        projectName: project.project_name,
        creatorWalletAddress: project.creator_wallet_address,
        createdAt: project.created_at,
        status: project.status,
        description: project.description,
        totalRevenue: project.total_revenue,
        totalDistributed: project.total_distributed,
      }));

      setProjects(transformedProjects);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  // Create a new project
  const createProject = useCallback(async (data: CreateProjectForm): Promise<Project> => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      // Create the project
      const projectData = await createProjectDB({
        projectName: data.projectName,
        creatorWalletAddress: walletAddress,
        description: data.description,
      });

      // Add contributors
      const contributorPromises = data.contributors.map(contributor =>
        addContributor({
          projectId: projectData.id,
          walletAddress: contributor.walletAddress,
          sharePercentage: contributor.sharePercentage,
          role: contributor.role,
          farcasterUsername: contributor.farcasterUsername,
        })
      );

      await Promise.all(contributorPromises);

      // Transform to our Project type
      const newProject: Project = {
        projectId: projectData.id,
        projectName: projectData.project_name,
        creatorWalletAddress: projectData.creator_wallet_address,
        createdAt: projectData.created_at,
        status: projectData.status,
        description: projectData.description,
        totalRevenue: projectData.total_revenue,
        totalDistributed: projectData.total_distributed,
      };

      // Update local state
      setProjects(prev => [newProject, ...prev]);

      return newProject;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  // Update a project
  const updateProject = useCallback(async (
    projectId: string, 
    updates: Partial<Project>
  ): Promise<Project> => {
    setLoading(true);
    setError(null);

    try {
      // This would update the project in the database
      // For now, we'll just update local state
      const updatedProject = projects.find(p => p.projectId === projectId);
      if (!updatedProject) {
        throw new Error('Project not found');
      }

      const newProject = { ...updatedProject, ...updates };
      setProjects(prev => 
        prev.map(p => p.projectId === projectId ? newProject : p)
      );

      return newProject;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projects]);

  // Delete a project
  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // This would delete the project from the database
      // For now, we'll just remove from local state
      setProjects(prev => prev.filter(p => p.projectId !== projectId));
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch projects
  const refetch = useCallback(async () => {
    await fetchProjects();
  }, [fetchProjects]);

  // Initial fetch
  useEffect(() => {
    if (walletAddress) {
      fetchProjects();
    }
  }, [fetchProjects, walletAddress]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch,
  };
}
