import Dexie, { Table } from 'dexie';
import { DiagramData, ChatMessage, UserSettings, DiagramType } from '@/types';
import { nanoid } from 'nanoid';

// Interfaz para proyectos (colección de diagramas)
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  diagramIds: string[];
}

// Interfaz extendida para UserSettings con ID para Dexie
interface UserSettingsWithId extends UserSettings {
  id: string;
}

// Base de datos IndexedDB usando Dexie
export class DiagramatIQDatabase extends Dexie {
  diagrams!: Table<DiagramData>;
  projects!: Table<Project>;
  chatMessages!: Table<ChatMessage>;
  settings!: Table<UserSettingsWithId>;

  constructor() {
    super('DiagramatIQDatabase');
    
    this.version(1).stores({
      diagrams: 'id, name, type, createdAt, updatedAt, projectId',
      projects: 'id, name, createdAt, updatedAt, isActive',
      chatMessages: 'id, timestamp, diagramId',
      settings: 'id'
    });
  }
}

// Instancia global de la base de datos
export const db = new DiagramatIQDatabase();

// Configuración por defecto
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  preferredAIProvider: 'perplexity',
  autoSave: true,
  autoSaveInterval: 30,
  editorFontSize: 14,
  showLineNumbers: true,
  wordWrap: true,
};

// Funciones para gestión de diagramas
export class DiagramStorage {
  // Crear un nuevo diagrama
  static async createDiagram(
    title: string,
    code: string,
    type: DiagramType,
    projectId?: string
  ): Promise<DiagramData> {
    const diagram: DiagramData = {
      id: nanoid(),
      title,
      code,
      type,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      ...(projectId && { projectId }),
    };

    await db.diagrams.add(diagram);

    // Si pertenece a un proyecto, actualizar la lista de diagramas
    if (projectId) {
      await ProjectStorage.addDiagramToProject(projectId, diagram.id);
    }

    return diagram;
  }

  // Guardar un diagrama (alias para createDiagram para compatibilidad)
  static async saveDiagram(
    diagramData: Omit<DiagramData, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const diagram: DiagramData = {
      id: nanoid(),
      ...diagramData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.diagrams.add(diagram);

    // Si pertenece a un proyecto, actualizar la lista de diagramas
    if (diagram.projectId) {
      await ProjectStorage.addDiagramToProject(diagram.projectId, diagram.id);
    }

    return diagram.id;
  }

  // Obtener un diagrama por ID
  static async getDiagram(id: string): Promise<DiagramData | undefined> {
    return await db.diagrams.get(id);
  }

  // Actualizar un diagrama
  static async updateDiagram(
    id: string,
    updates: Partial<Omit<DiagramData, 'id' | 'createdAt'>>
  ): Promise<void> {
    await db.diagrams.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  // Eliminar un diagrama
  static async deleteDiagram(id: string): Promise<void> {
    await db.diagrams.delete(id);
    // También eliminar mensajes de chat relacionados
    await db.chatMessages.where('diagramId').equals(id).delete();
  }

  // Obtener todos los diagramas
  static async getAllDiagrams(): Promise<DiagramData[]> {
    return await db.diagrams.orderBy('updatedAt').reverse().toArray();
  }

  // Buscar diagramas por título o tags
  static async searchDiagrams(query: string): Promise<DiagramData[]> {
    const lowerQuery = query.toLowerCase();
    return await db.diagrams
      .filter(diagram => 
        diagram.title.toLowerCase().includes(lowerQuery) ||
        (diagram.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ?? false)
      )
      .toArray();
  }

  // Obtener diagramas por tipo
  static async getDiagramsByType(type: DiagramType): Promise<DiagramData[]> {
    return await db.diagrams.where('type').equals(type).toArray();
  }
}

// Funciones para gestión de proyectos
export class ProjectStorage {
  // Crear un nuevo proyecto
  static async createProject(name: string, description?: string): Promise<Project> {
    const project: Project = {
      id: nanoid(),
      name,
      ...(description && { description }),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: false,
      diagramIds: [],
    };

    await db.projects.add(project);
    return project;
  }

  // Obtener un proyecto por ID
  static async getProject(id: string): Promise<Project | undefined> {
    return await db.projects.get(id);
  }

  // Actualizar un proyecto
  static async updateProject(
    id: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt'>>
  ): Promise<void> {
    await db.projects.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  // Eliminar un proyecto
  static async deleteProject(id: string): Promise<void> {
    const project = await db.projects.get(id);
    if (project) {
      // Eliminar todos los diagramas del proyecto
      for (const diagramId of project.diagramIds) {
        await DiagramStorage.deleteDiagram(diagramId);
      }
    }
    await db.projects.delete(id);
  }

  // Obtener todos los proyectos
  static async getAllProjects(): Promise<Project[]> {
    return await db.projects.orderBy('updatedAt').reverse().toArray();
  }

  // Establecer proyecto activo
  static async setActiveProject(id: string): Promise<void> {
    // Desactivar todos los proyectos
    await db.projects.toCollection().modify({ isActive: false });
    // Activar el proyecto seleccionado
    await db.projects.update(id, { isActive: true, updatedAt: new Date() });
  }

  // Obtener proyecto activo
  static async getActiveProject(): Promise<Project | undefined> {
    return await db.projects.filter(project => project.isActive === true).first();
  }

  // Agregar diagrama a proyecto
  static async addDiagramToProject(projectId: string, diagramId: string): Promise<void> {
    const project = await db.projects.get(projectId);
    if (project && !project.diagramIds.includes(diagramId)) {
      project.diagramIds.push(diagramId);
      await db.projects.update(projectId, {
        diagramIds: project.diagramIds,
        updatedAt: new Date(),
      });
    }
  }

  // Remover diagrama de proyecto
  static async removeDiagramFromProject(projectId: string, diagramId: string): Promise<void> {
    const project = await db.projects.get(projectId);
    if (project) {
      project.diagramIds = project.diagramIds.filter(id => id !== diagramId);
      await db.projects.update(projectId, {
        diagramIds: project.diagramIds,
        updatedAt: new Date(),
      });
    }
  }

  // Obtener diagramas de un proyecto
  static async getProjectDiagrams(projectId: string): Promise<DiagramData[]> {
    const project = await db.projects.get(projectId);
    if (!project) return [];

    const diagrams = await Promise.all(
      project.diagramIds.map(id => DiagramStorage.getDiagram(id))
    );

    return diagrams.filter(Boolean) as DiagramData[];
  }
}

// Funciones para gestión de chat
export class ChatStorage {
  // Guardar mensaje de chat
  static async saveMessage(message: ChatMessage): Promise<void> {
    await db.chatMessages.add(message);
  }

  // Obtener historial de chat para un diagrama
  static async getChatHistory(diagramId: string): Promise<ChatMessage[]> {
    return await db.chatMessages
      .where('diagramId')
      .equals(diagramId)
      .toArray();
  }

  // Limpiar historial de chat
  static async clearChatHistory(diagramId?: string): Promise<void> {
    if (diagramId) {
      await db.chatMessages.where('diagramId').equals(diagramId).delete();
    } else {
      await db.chatMessages.clear();
    }
  }
}

// Funciones para gestión de configuración
export class SettingsStorage {
  private static readonly SETTINGS_ID = 'user-settings';

  // Obtener configuración
  static async getSettings(): Promise<UserSettings> {
    const settings = await db.settings.get(this.SETTINGS_ID);
    return settings || DEFAULT_SETTINGS;
  }

  // Actualizar configuración
  static async updateSettings(updates: Partial<UserSettings>): Promise<void> {
    const currentSettings = await this.getSettings();
    const newSettings = { ...currentSettings, ...updates };
    
    await db.settings.put({ ...newSettings, id: this.SETTINGS_ID });
  }

  // Resetear configuración a valores por defecto
  static async resetSettings(): Promise<void> {
    await db.settings.put({ ...DEFAULT_SETTINGS, id: this.SETTINGS_ID });
  }
}

// Funciones de utilidad para exportar/importar datos
export class DataManager {
  // Exportar todos los datos
  static async exportData(): Promise<{
    diagrams: DiagramData[];
    projects: Project[];
    chatMessages: ChatMessage[];
    settings: UserSettings;
    exportDate: Date;
  }> {
    const [diagrams, projects, chatMessages, settings] = await Promise.all([
      DiagramStorage.getAllDiagrams(),
      ProjectStorage.getAllProjects(),
      db.chatMessages.toArray(),
      SettingsStorage.getSettings(),
    ]);

    return {
      diagrams,
      projects,
      chatMessages,
      settings,
      exportDate: new Date(),
    };
  }

  // Importar datos (con confirmación)
  static async importData(data: {
    diagrams?: DiagramData[];
    projects?: Project[];
    chatMessages?: ChatMessage[];
    settings?: UserSettings;
  }): Promise<void> {
    await db.transaction('rw', [db.diagrams, db.projects, db.chatMessages, db.settings], async () => {
      if (data.diagrams) {
        await db.diagrams.bulkPut(data.diagrams);
      }
      if (data.projects) {
        await db.projects.bulkPut(data.projects);
      }
      if (data.chatMessages) {
        await db.chatMessages.bulkPut(data.chatMessages);
      }
      if (data.settings) {
        await SettingsStorage.updateSettings(data.settings);
      }
    });
  }

  // Limpiar todos los datos
  static async clearAllData(): Promise<void> {
    await db.transaction('rw', [db.diagrams, db.projects, db.chatMessages, db.settings], async () => {
      await db.diagrams.clear();
      await db.projects.clear();
      await db.chatMessages.clear();
      await db.settings.clear();
    });
  }

  // Obtener estadísticas de uso
  static async getUsageStats(): Promise<{
    totalDiagrams: number;
    totalProjects: number;
    totalChatMessages: number;
    diagramsByType: Record<DiagramType, number>;
    oldestDiagram?: Date;
    newestDiagram?: Date;
  }> {
    const [diagrams, projects, chatMessages] = await Promise.all([
      DiagramStorage.getAllDiagrams(),
      ProjectStorage.getAllProjects(),
      db.chatMessages.count(),
    ]);

    const diagramsByType = diagrams.reduce((acc, diagram) => {
      acc[diagram.type] = (acc[diagram.type] || 0) + 1;
      return acc;
    }, {} as Record<DiagramType, number>);

    const dates = diagrams.map(d => d.createdAt).sort();

    return {
      totalDiagrams: diagrams.length,
      totalProjects: projects.length,
      totalChatMessages: chatMessages,
      diagramsByType,
      ...(dates.length > 0 && {
        oldestDiagram: dates[0],
        newestDiagram: dates[dates.length - 1],
      }),
    };
  }
}

// Export singleton instance for easy access
export const dataManager = new DataManager();