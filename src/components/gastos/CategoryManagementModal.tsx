'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { createCategory, updateCategory, deleteCategory } from '@/actions/transactions';
import type { ICategory } from '@/types/transaction';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ICategory[];
}

const RECOMMENDED_EMOJIS = [
  '🍔', '🚗', '🎬', '💊', '🎓', '🏠', '💡', '🛍️', '✈️',
  '💻', '📱', '🍕', '🏆', '🎁', '🐶', '👶', '🏖️', '🏥',
  '📈', '🔄', '📁', '☕', '🥦', '⛽', '🎟️', '🎮',
  '🏧', '🏍️', '🚚', '💳', '🧾', '💰',
];

export default function CategoryManagementModal({
  isOpen,
  onClose,
  categories,
}: CategoryManagementModalProps) {
  // State for creating new category
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState('📁');
  const [newLimit, setNewLimit] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // State for editing existing category
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editLimit, setEditLimit] = useState('');
  const [isEditingLoading, setIsEditingLoading] = useState(false);

  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      setError('El nombre es requerido');
      return;
    }
    setIsCreating(true);
    setError('');
    try {
      await createCategory({ 
        label: newLabel.trim(), 
        icon: newIcon, 
        limit: newLimit ? parseFloat(newLimit) : undefined 
      });
      setNewLabel('');
      setNewIcon('📁');
      setNewLimit('');
    } catch (err: any) {
      setError(err.message || 'Error al crear la categoría');
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (cat: ICategory) => {
    setEditingId(cat._id);
    setEditLabel(cat.label);
    setEditIcon(cat.icon || '📁');
    setEditLimit(cat.limit ? cat.limit.toString() : '');
    setError('');
  };

  const handleUpdate = async (id: string) => {
    if (!editLabel.trim()) return;
    setIsEditingLoading(true);
    setError('');
    try {
      await updateCategory(id, { 
        label: editLabel.trim(), 
        icon: editIcon, 
        limit: editLimit ? parseFloat(editLimit) : null 
      });
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la categoría');
    } finally {
      setIsEditingLoading(false);
    }
  };

  const handleDelete = async (id: string, isDefault?: boolean) => {
    if (isDefault) {
      alert('Las categorías predeterminadas del sistema no se pueden eliminar.');
      return;
    }
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await deleteCategory(id);
      } catch (err: any) {
        alert(err.message || 'Error al eliminar la categoría');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestión de Categorías" size="lg">
      <div className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Create New Category Form */}
        <form onSubmit={handleCreate} className="p-4 rounded-xl bg-background-elevated border border-border space-y-3">
          <h3 className="text-sm font-semibold text-foreground">✨ Crear Nueva Categoría</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2">
              <Input
                label="Nombre *"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Ej: Suscripciones, Mascotas..."
              />
            </div>
            <div>
              <Input
                label="Límite Mensual (CLP)"
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="Opcional. Ej: 30000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Icono actual</label>
              <div className="flex items-center gap-2 h-10 px-3 rounded-lg bg-background border border-border">
                <span className="text-xl">{newIcon}</span>
                <Input
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="h-7 text-xs px-1 w-full"
                  placeholder="Emoji"
                />
              </div>
            </div>
          </div>

          {/* Emoji Suggestions */}
          <div>
            <label className="block text-xs font-medium text-foreground-subtle mb-1.5">
              Iconos rápidos recomendados:
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-background rounded-lg border border-border/50">
              {RECOMMENDED_EMOJIS.map((emoji, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNewIcon(emoji)}
                  className={`w-7 h-7 rounded flex items-center justify-center text-base hover:bg-background-elevated transition-colors ${
                    newIcon === emoji ? 'bg-primary/20 border border-primary text-primary' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" isLoading={isCreating} className="w-full text-xs py-2">
            + Añadir Categoría
          </Button>
        </form>

        {/* Existing Categories List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">📁 Categorías Existentes</h3>
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {categories.map((cat) => {
              const isEditing = editingId === cat._id;

              if (isEditing) {
                return (
                  <div key={cat._id} className="p-3 rounded-lg bg-background-elevated border border-primary space-y-3 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <Input
                          label="Nombre"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                        />
                      </div>
                      <div>
                        <Input
                          label="Límite Mensual (CLP)"
                          type="number"
                          value={editLimit}
                          onChange={(e) => setEditLimit(e.target.value)}
                          placeholder="Sin límite"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground-muted mb-1">Icono</label>
                        <div className="flex items-center gap-2 h-10 px-3 rounded-lg bg-background border border-border">
                          <span className="text-xl">{editIcon}</span>
                          <Input
                            value={editIcon}
                            onChange={(e) => setEditIcon(e.target.value)}
                            className="h-7 text-xs px-1 w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Emoji Suggestions for Edit */}
                    <div className="flex flex-wrap gap-1 p-1 bg-background rounded-lg border border-border/50 max-h-20 overflow-y-auto">
                      {RECOMMENDED_EMOJIS.map((emoji, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setEditIcon(emoji)}
                          className={`w-6 h-6 rounded flex items-center justify-center text-sm hover:bg-background-elevated ${
                            editIcon === emoji ? 'bg-primary/20 border border-primary' : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="secondary" onClick={() => setEditingId(null)} className="text-xs py-1.5 px-3">
                        Cancelar
                      </Button>
                      <Button type="button" isLoading={isEditingLoading} onClick={() => handleUpdate(cat._id)} className="text-xs py-1.5 px-3">
                        Guardar
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={cat._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background-elevated border border-border hover:border-border-hover transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 rounded-lg bg-background border border-border/50 flex items-center justify-center">
                      {cat.icon || '📁'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{cat.label}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {cat.isDefault && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            Sistema
                          </span>
                        )}
                        {cat.limit ? (
                          <span className="text-[10px] bg-warning/15 text-warning-light px-2 py-0.5 rounded-full font-semibold border border-warning/15">
                            Límite: ${cat.limit.toLocaleString('es-CL')} CLP
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="p-1.5 text-foreground-subtle hover:text-foreground rounded transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    {!cat.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDelete(cat._id, cat.isDefault)}
                        className="p-1.5 text-foreground-subtle hover:text-danger rounded transition-colors"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-border flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
