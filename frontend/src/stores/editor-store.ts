import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { DiagramData, DiagramType, Project } from '@/types';
import { DiagramStorage, ProjectStorage } from '@/lib/storage';
import { debounce } from '@/lib/utils';

interface EditorState {
  // Current diagram
  currentDiagram: DiagramData | null;
  
  // Editor content
  code: string;
  language: DiagramType;
  
  // UI state
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  
  // Auto-save settings
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // in milliseconds
  lastSaved: Date | null;
  
  // Actions
  setCode: (code: string) => void;
  setLanguage: (language: DiagramType) => void;
  setCurrentDiagram: (diagram: DiagramData | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Diagram operations
  saveDiagram: (title?: string, projectId?: string) => Promise<string>;
  loadDiagram: (id: string) => Promise<void>;
  createNewDiagram: (type?: DiagramType) => void;
  
  // Auto-save
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  setAutoSaveInterval: (interval: number) => void;
  triggerAutoSave: () => Promise<void>;
}

// Auto-save debounced function
let autoSaveDebounced: ReturnType<typeof debounce> | null = null;

export const useEditorStore = create<EditorState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentDiagram: null,
    code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
    language: DiagramType.MERMAID,
    isLoading: false,
    hasUnsavedChanges: false,
    autoSaveEnabled: true,
    autoSaveInterval: 30000, // 30 seconds
    lastSaved: null,

    // Actions
    setCode: (code: string) => {
      set({ code, hasUnsavedChanges: true });
      
      // Trigger auto-save if enabled
      const state = get();
      if (state.autoSaveEnabled && autoSaveDebounced) {
        autoSaveDebounced();
      }
    },

    setLanguage: (language: DiagramType) => {
      set({ language, hasUnsavedChanges: true });
    },

    setCurrentDiagram: (diagram: DiagramData | null) => {
      set({ 
        currentDiagram: diagram,
        code: diagram?.code || '',
        language: diagram?.type || DiagramType.MERMAID,
        hasUnsavedChanges: false,
      });
    },

    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    // Diagram operations
    saveDiagram: async (title?: string, projectId?: string): Promise<string> => {
      const state = get();
      set({ isLoading: true });

      try {
        const diagramData: Omit<DiagramData, 'id' | 'createdAt' | 'updatedAt'> = {
          title: title || state.currentDiagram?.title || `Diagram ${new Date().toLocaleDateString()}`,
          code: state.code,
          type: state.language,
          ...(projectId && { projectId }),
        };

        let diagramId: string;

        if (state.currentDiagram) {
          // Update existing diagram
          await DiagramStorage.updateDiagram(state.currentDiagram.id, diagramData);
          diagramId = state.currentDiagram.id;
          
          // Update current diagram in state
          const updatedDiagram: DiagramData = {
            ...state.currentDiagram,
            ...diagramData,
            updatedAt: new Date(),
          };
          set({ currentDiagram: updatedDiagram });
        } else {
          // Create new diagram
          diagramId = await DiagramStorage.saveDiagram(diagramData);
          
          // Load the saved diagram to get complete data
          const savedDiagram = await DiagramStorage.getDiagram(diagramId);
          set({ currentDiagram: savedDiagram || null });
        }

        set({ 
          hasUnsavedChanges: false, 
          lastSaved: new Date(),
          isLoading: false 
        });

        return diagramId;
      } catch (error) {
        set({ isLoading: false });
        console.error('Error saving diagram:', error);
        throw error;
      }
    },

    loadDiagram: async (id: string): Promise<void> => {
      set({ isLoading: true });

      try {
        const diagram = await DiagramStorage.getDiagram(id);
        if (diagram) {
          set({
            currentDiagram: diagram,
            code: diagram.code,
            language: diagram.type,
            hasUnsavedChanges: false,
            isLoading: false,
          });
        } else {
          throw new Error('Diagram not found');
        }
      } catch (error) {
        set({ isLoading: false });
        console.error('Error loading diagram:', error);
        throw error;
      }
    },

    createNewDiagram: (type: DiagramType = DiagramType.MERMAID) => {
      const defaultCode = type === DiagramType.MERMAID 
        ? `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`
        : `@startuml
actor User
User -> System : Request
System -> Database : Query
Database -> System : Response
System -> User : Result
@enduml`;

      set({
        currentDiagram: null,
        code: defaultCode,
        language: type,
        hasUnsavedChanges: false,
      });
    },

    // Auto-save functionality
    enableAutoSave: () => {
      const state = get();
      set({ autoSaveEnabled: true });
      
      // Create debounced auto-save function
      autoSaveDebounced = debounce(async () => {
        const currentState = get();
        if (currentState.hasUnsavedChanges && currentState.currentDiagram) {
          try {
            await currentState.saveDiagram();
          } catch (error) {
            console.error('Auto-save failed:', error);
          }
        }
      }, state.autoSaveInterval);
    },

    disableAutoSave: () => {
      set({ autoSaveEnabled: false });
      autoSaveDebounced = null;
    },

    setAutoSaveInterval: (interval: number) => {
      set({ autoSaveInterval: interval });
      
      // Recreate debounced function with new interval
      const state = get();
      if (state.autoSaveEnabled) {
        autoSaveDebounced = debounce(async () => {
          const currentState = get();
          if (currentState.hasUnsavedChanges && currentState.currentDiagram) {
            try {
              await currentState.saveDiagram();
            } catch (error) {
              console.error('Auto-save failed:', error);
            }
          }
        }, interval);
      }
    },

    triggerAutoSave: async (): Promise<void> => {
      const state = get();
      if (state.hasUnsavedChanges && state.currentDiagram) {
        try {
          await state.saveDiagram();
        } catch (error) {
          console.error('Manual auto-save failed:', error);
          throw error;
        }
      }
    },
  }))
);

// Initialize auto-save on store creation
useEditorStore.getState().enableAutoSave();

// Project Store
interface ProjectState {
  // Projects
  projects: Project[];
  currentProject: Project | null;
  
  // Project diagrams
  projectDiagrams: DiagramData[];
  
  // Loading states
  isLoadingProjects: boolean;
  isLoadingDiagrams: boolean;
  
  // Actions
  loadProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<string>;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProject: (id: string) => Promise<void>;
  
  // Diagram management within projects
  loadProjectDiagrams: (projectId: string) => Promise<void>;
  createDiagramInProject: (projectId: string, title: string, type?: DiagramType) => Promise<string>;
  removeDiagramFromProject: (projectId: string, diagramId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    projects: [],
    currentProject: null,
    projectDiagrams: [],
    isLoadingProjects: false,
    isLoadingDiagrams: false,

    // Load all projects
    loadProjects: async () => {
      set({ isLoadingProjects: true });
      try {
        const projects = await ProjectStorage.getAllProjects();
        const activeProject = await ProjectStorage.getActiveProject();
        set({ 
          projects, 
          currentProject: activeProject || null,
          isLoadingProjects: false 
        });
      } catch (error) {
        set({ isLoadingProjects: false });
        console.error('Error loading projects:', error);
        throw error;
      }
    },

    // Create new project
    createProject: async (name: string, description?: string): Promise<string> => {
      try {
        const project = await ProjectStorage.createProject(name, description);
        const state = get();
        set({ projects: [project, ...state.projects] });
        return project.id;
      } catch (error) {
        console.error('Error creating project:', error);
        throw error;
      }
    },

    // Update project
    updateProject: async (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
      try {
        await ProjectStorage.updateProject(id, updates);
        const state = get();
        const updatedProjects = state.projects.map(p => 
          p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
        );
        set({ projects: updatedProjects });
        
        // Update current project if it's the one being updated
        if (state.currentProject?.id === id) {
          set({ currentProject: { ...state.currentProject, ...updates, updatedAt: new Date() } });
        }
      } catch (error) {
        console.error('Error updating project:', error);
        throw error;
      }
    },

    // Delete project
    deleteProject: async (id: string) => {
      try {
        await ProjectStorage.deleteProject(id);
        const state = get();
        const filteredProjects = state.projects.filter(p => p.id !== id);
        set({ projects: filteredProjects });
        
        // Clear current project if it was deleted
        if (state.currentProject?.id === id) {
          set({ currentProject: null, projectDiagrams: [] });
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
      }
    },

    // Set active project
    setActiveProject: async (id: string) => {
      try {
        await ProjectStorage.setActiveProject(id);
        const state = get();
        const project = state.projects.find(p => p.id === id);
        if (project) {
          // Update projects list to reflect active status
          const updatedProjects = state.projects.map(p => ({
            ...p,
            isActive: p.id === id
          }));
          set({ 
            projects: updatedProjects,
            currentProject: { ...project, isActive: true }
          });
          
          // Load diagrams for the active project
          await get().loadProjectDiagrams(id);
        }
      } catch (error) {
        console.error('Error setting active project:', error);
        throw error;
      }
    },

    // Load diagrams for a project
    loadProjectDiagrams: async (projectId: string) => {
      set({ isLoadingDiagrams: true });
      try {
        const diagrams = await ProjectStorage.getProjectDiagrams(projectId);
        set({ projectDiagrams: diagrams, isLoadingDiagrams: false });
      } catch (error) {
        set({ isLoadingDiagrams: false });
        console.error('Error loading project diagrams:', error);
        throw error;
      }
    },

    // Create diagram in project
    createDiagramInProject: async (projectId: string, title: string, type: DiagramType = DiagramType.MERMAID): Promise<string> => {
      try {
        const defaultCode = type === DiagramType.MERMAID 
          ? `graph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action 1]\n    B -->|No| D[Action 2]\n    C --> E[End]\n    D --> E`
          : `@startuml\nactor User\nUser -> System : Request\nSystem -> Database : Query\nDatabase -> System : Response\nSystem -> User : Result\n@enduml`;

        const diagramData = {
          title,
          code: defaultCode,
          type,
          projectId,
        };

        const diagramId = await DiagramStorage.saveDiagram(diagramData);
        
        // Reload project diagrams
        await get().loadProjectDiagrams(projectId);
        
        return diagramId;
      } catch (error) {
        console.error('Error creating diagram in project:', error);
        throw error;
      }
    },

    // Remove diagram from project
    removeDiagramFromProject: async (projectId: string, diagramId: string) => {
      try {
        await ProjectStorage.removeDiagramFromProject(projectId, diagramId);
        await DiagramStorage.deleteDiagram(diagramId);
        
        // Reload project diagrams
        await get().loadProjectDiagrams(projectId);
      } catch (error) {
        console.error('Error removing diagram from project:', error);
        throw error;
      }
    },
  }))
);