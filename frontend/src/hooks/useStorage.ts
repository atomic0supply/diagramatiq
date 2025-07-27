import { useCallback, useEffect, useState } from 'react';
import { 
  DiagramStorage, 
  ProjectStorage, 
  ChatStorage, 
  SettingsStorage, 
  DataManager 
} from '@/lib/storage';
import { DiagramData, Project, ChatMessage, UserSettings } from '@/types';

/**
 * Custom hook for storage operations
 */
export function useStorage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize storage
  useEffect(() => {
    const initStorage = async () => {
      try {
        // Storage is automatically initialized when first accessed
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize storage');
      }
    };

    initStorage();
  }, []);

  // Diagram operations
  const saveDiagram = useCallback(async (diagram: Omit<DiagramData, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await DiagramStorage.saveDiagram(diagram);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save diagram');
      throw err;
    }
  }, []);

  const loadDiagram = useCallback(async (id: string): Promise<DiagramData | null> => {
    try {
      return await DiagramStorage.getDiagram(id) || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load diagram');
      return null;
    }
  }, []);

  const deleteDiagram = useCallback(async (id: string) => {
    try {
      await DiagramStorage.deleteDiagram(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete diagram');
      throw err;
    }
  }, []);

  const getAllDiagrams = useCallback(async (): Promise<DiagramData[]> => {
    try {
      return await DiagramStorage.getAllDiagrams();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load diagrams');
      return [];
    }
  }, []);

  // Project operations
  const createProject = useCallback(async (name: string, description?: string): Promise<string> => {
    try {
      const project = await ProjectStorage.createProject(name, description);
      return project.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    }
  }, []);

  const loadProject = useCallback(async (id: string): Promise<Project | null> => {
    try {
      return await ProjectStorage.getProject(id) || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
      return null;
    }
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<Pick<Project, 'name' | 'description'>>) => {
    try {
      await ProjectStorage.updateProject(id, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await ProjectStorage.deleteProject(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    }
  }, []);

  const getAllProjects = useCallback(async (): Promise<Project[]> => {
    try {
      return await ProjectStorage.getAllProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
      return [];
    }
  }, []);

  const setActiveProject = useCallback(async (id: string) => {
    try {
      await ProjectStorage.setActiveProject(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set active project');
      throw err;
    }
  }, []);

  const getActiveProject = useCallback(async (): Promise<Project | null> => {
    try {
      return await ProjectStorage.getActiveProject() || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get active project');
      return null;
    }
  }, []);

  // Chat operations
  const saveChatMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    try {
      const fullMessage: ChatMessage = {
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };
      await ChatStorage.saveMessage(fullMessage);
      return fullMessage.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save chat message');
      throw err;
    }
  }, []);

  const getChatHistory = useCallback(async (diagramId?: string): Promise<ChatMessage[]> => {
    try {
      if (diagramId) {
        return await ChatStorage.getChatHistory(diagramId);
      }
      // If no diagramId provided, return empty array for now
      return [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat history');
      return [];
    }
  }, []);

  const clearChatHistory = useCallback(async (diagramId?: string) => {
    try {
      await ChatStorage.clearChatHistory(diagramId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear chat history');
      throw err;
    }
  }, []);

  // Settings operations
  const saveSettings = useCallback(async (settings: UserSettings) => {
    try {
      await SettingsStorage.updateSettings(settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      throw err;
    }
  }, []);

  const loadSettings = useCallback(async (): Promise<UserSettings | null> => {
    try {
      return await SettingsStorage.getSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      return null;
    }
  }, []);

  // Data management
  const exportData = useCallback(async () => {
    try {
      return await DataManager.exportData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
      throw err;
    }
  }, []);

  const importData = useCallback(async (data: any) => {
    try {
      await DataManager.importData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data');
      throw err;
    }
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      await DataManager.clearAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear data');
      throw err;
    }
  }, []);

  const getUsageStats = useCallback(async () => {
    try {
      return await DataManager.getUsageStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get usage stats');
      return null;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isInitialized,
    error,
    clearError,

    // Diagram operations
    saveDiagram,
    loadDiagram,
    deleteDiagram,
    getAllDiagrams,

    // Project operations
    createProject,
    loadProject,
    updateProject,
    deleteProject,
    getAllProjects,
    setActiveProject,
    getActiveProject,

    // Chat operations
    saveChatMessage,
    getChatHistory,
    clearChatHistory,

    // Settings operations
    saveSettings,
    loadSettings,

    // Data management
    exportData,
    importData,
    clearAllData,
    getUsageStats,
  };
}