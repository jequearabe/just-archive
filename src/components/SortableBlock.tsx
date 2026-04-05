import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BlockEditor } from './BlockEditor';

interface SortableBlockProps {
  id: string;
  block: any;
  onUpdate: (id: string, props: any) => void;
  onDelete: (id: string) => void;
}

export const SortableBlock: React.FC<SortableBlockProps> = ({ id, block, onUpdate, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-block">
      <div className="block-handle" {...attributes} {...listeners}>
        ⋮⋮
      </div>
      <div className="block-content">
        <BlockEditor block={block} onUpdate={(newProps) => onUpdate(id, newProps)} />
      </div>
      <button className="delete-block" onClick={() => onDelete(id)}>
        ✕
      </button>
    </div>
  );
};