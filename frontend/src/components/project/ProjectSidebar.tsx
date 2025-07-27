'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  Folder, 
  FolderOpen, 
  FileText, 
  Plus, 
  MoreHorizontal,
  Trash2,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { useProjectStore, useEditorStore } from '@/stores/editor-store';
import { DiagramData, Project } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ProjectSidebarProps {
  className?: string;
}

export function ProjectSidebar({ className }: ProjectSidebarProps) {
  const {
    projects,
    currentProject,
    projectDiagrams,
    isLoadingProjects,
    loadProjects,
    createProject,
    setActiveProject,
    updateProject,
    deleteProject,
    createDiagramInProject,
    removeDiagramFromProject,
  } = useProjectStore();

  const { 
    currentDiagram, 
    loadDiagram 
  } = useEditorStore();

  // Project states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // Diagram states
  const [editingDiagramId, setEditingDiagramId] = useState<string | null>(null);
  const [editingDiagramTitle, setEditingDiagramTitle] = useState('');

  // Cargar proyectos al montar el componente
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      await createProject(newProjectName.trim(), newProjectDescription.trim() || undefined);
      setNewProjectName('');
      setNewProjectDescription('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleEditProject = async () => {
    if (!editingProject || !newProjectName.trim()) return;

    try {
      await updateProject(editingProject.id, {
        name: newProjectName.trim(),
        ...(newProjectDescription.trim() && { description: newProjectDescription.trim() }),
      });
      setEditingProject(null);
      setNewProjectName('');
      setNewProjectDescription('');
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.name}"? Esto eliminará todos los diagramas del proyecto.`)) {
      try {
        await deleteProject(project.id);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleSelectProject = async (project: Project) => {
    await setActiveProject(project.id);
  };

  const handleSelectDiagram = async (diagram: DiagramData) => {
    await loadDiagram(diagram.id);
  };

  const handleCreateDiagramInProject = async () => {
    if (!currentProject) return;

    try {
      await createDiagramInProject(currentProject.id, `Nuevo Diagrama ${projectDiagrams.length + 1}`);
    } catch (error) {
      console.error('Error creating diagram in project:', error);
    }
  };

  // Diagram management functions
  const handleStartEditDiagram = (diagram: DiagramData) => {
    setEditingDiagramId(diagram.id);
    setEditingDiagramTitle(diagram.title);
  };

  const handleSaveEditDiagram = async () => {
    if (!editingDiagramId || !editingDiagramTitle.trim()) return;

    try {
      // Update diagram title through storage
      const { DiagramStorage } = await import('@/lib/storage');
      await DiagramStorage.updateDiagram(editingDiagramId, {
        title: editingDiagramTitle.trim()
      });
      
      // Reload project diagrams to reflect changes
      if (currentProject) {
        const { loadProjectDiagrams } = useProjectStore.getState();
        await loadProjectDiagrams(currentProject.id);
      }
      
      setEditingDiagramId(null);
      setEditingDiagramTitle('');
    } catch (error) {
      console.error('Error updating diagram title:', error);
    }
  };

  const handleCancelEditDiagram = () => {
    setEditingDiagramId(null);
    setEditingDiagramTitle('');
  };

  const handleDeleteDiagram = async (diagram: DiagramData) => {
    if (!currentProject) return;
    
    if (confirm(`¿Estás seguro de que quieres eliminar el diagrama "${diagram.title}"?`)) {
      try {
        await removeDiagramFromProject(currentProject.id, diagram.id);
      } catch (error) {
        console.error('Error deleting diagram:', error);
      }
    }
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    setNewProjectDescription(project.description || '');
    setIsEditDialogOpen(true);
  };

  return (
    <div className={`bg-card border-r border-border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Proyectos</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost">
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nombre</label>
                  <Input
                    value={newProjectName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProjectName(e.target.value)}
                    placeholder="Nombre del proyecto"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleCreateProject()}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción (opcional)</label>
                  <Textarea
                    value={newProjectDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewProjectDescription(e.target.value)}
                    placeholder="Descripción del proyecto"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                    Crear
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingProjects ? (
          <div className="p-4 text-center text-muted-foreground">
            Cargando proyectos...
          </div>
        ) : projects.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay proyectos</p>
            <p className="text-xs">Crea tu primer proyecto</p>
          </div>
        ) : (
          <div className="p-2">
            {projects.map((project) => (
              <div key={project.id} className="mb-2">
                {/* Project Item */}
                <div
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent ${
                    currentProject?.id === project.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => handleSelectProject(project)}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {currentProject?.id === project.id ? (
                      <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : (
                      <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{project.name}</p>
                      {project.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(project)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProject(project)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Project Diagrams */}
                {currentProject?.id === project.id && (
                  <div className="ml-6 mt-1 space-y-1">
                    {projectDiagrams.map((diagram) => (
                      <div
                        key={diagram.id}
                        className={`flex items-center justify-between group p-1 rounded cursor-pointer hover:bg-accent/50 ${
                          currentDiagram?.id === diagram.id ? 'bg-accent/50' : ''
                        }`}
                      >
                        <div 
                          className="flex items-center space-x-2 flex-1 min-w-0"
                          onClick={() => handleSelectDiagram(diagram)}
                        >
                          <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          {editingDiagramId === diagram.id ? (
                            <div className="flex items-center space-x-1 flex-1">
                              <Input
                                value={editingDiagramTitle}
                                onChange={(e) => setEditingDiagramTitle(e.target.value)}
                                className="h-5 text-xs px-1 py-0"
                                onKeyDown={(e) => {
                                  e.stopPropagation();
                                  if (e.key === 'Enter') {
                                    handleSaveEditDiagram();
                                  } else if (e.key === 'Escape') {
                                    handleCancelEditDiagram();
                                  }
                                }}
                                onBlur={handleSaveEditDiagram}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveEditDiagram();
                                }}
                              >
                                <Save className="h-2 w-2" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEditDiagram();
                                }}
                              >
                                <X className="h-2 w-2" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs truncate">{diagram.title}</span>
                          )}
                        </div>
                        
                        {editingDiagramId !== diagram.id && (
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-4 w-4 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditDiagram(diagram);
                              }}
                            >
                              <Edit3 className="h-2 w-2" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-4 w-4 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDiagram(diagram);
                              }}
                            >
                              <Trash2 className="h-2 w-2" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Add Diagram Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-full justify-start text-xs"
                      onClick={handleCreateDiagramInProject}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Nuevo Diagrama
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Proyecto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={newProjectName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProjectName(e.target.value)}
                placeholder="Nombre del proyecto"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleEditProject()}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción (opcional)</label>
              <Textarea
                value={newProjectDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewProjectDescription(e.target.value)}
                placeholder="Descripción del proyecto"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditProject} disabled={!newProjectName.trim()}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}