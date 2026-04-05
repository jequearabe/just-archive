import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableBlock } from './SortableBlock';

interface Block {
  id: string;
  type: string;
  props: Record<string, any>;
}

interface PageBuilderProps {
  initialData: { slug: string; title: string; content_json: { blocks: Block[] } };
  onSave: (data: any) => void;
}

const defaultProps: Record<string, any> = {
  header: { level: 2, text: 'New title' },
  paragraph: { text: '' },
  image: { url: 'https://picsum.photos/400/300', caption: '' },
  gallery: { images: ['https://picsum.photos/200/150'] },
  socialLinks: { links: [{ label: 'Twitter', url: 'https://twitter.com', icon: 'fab fa-twitter' }] },
  musicTracks: { tracks: [{ platform: 'youtube', url: 'https://youtu.be/example', name: 'Example song' }] },
};

export const PageBuilder: React.FC<PageBuilderProps> = ({ initialData, onSave }) => {
  const [slug, setSlug] = useState(initialData.slug || '');
  const [title, setTitle] = useState(initialData.title || '');
  const [blocks, setBlocks] = useState<Block[]>(initialData.content_json?.blocks || []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addBlock = (type: string) => {
    const newBlock: Block = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      type,
      props: JSON.parse(JSON.stringify(defaultProps[type])),
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, newProps: Record<string, any>) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, props: newProps } : block)));
  };

  const deleteBlock = (id: string) => {
    if (confirm('Delete this block?')) {
      setBlocks(blocks.filter((block) => block.id !== id));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over?.id);
      setBlocks(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const handleSave = async () => {
    if (!slug) {
      setMessage('Slug is required');
      return;
    }
    if (!/^[a-z0-9\-_]+$/.test(slug)) {
      setMessage('Slug can only contain lowercase letters, numbers, - and _');
      return;
    }
    setSaving(true);
    setMessage('');
    const token = localStorage.getItem('token');
    const res = await fetch('/api/user/page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ slug, title, content_json: { blocks } }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Page saved successfully!');
      onSave(data.page);
    } else {
      setMessage(data.error || 'Error saving page');
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="page-builder">
      <div className="builder-header">
        <input
          type="text"
          placeholder="Page slug (e.g., my-page)"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
          className="slug-input"
        />
        <input
          type="text"
          placeholder="Page title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />
        <button onClick={handleSave} disabled={saving} className="save-btn">
          {saving ? 'Saving...' : 'Save page'}
        </button>
        {message && <div className="save-message">{message}</div>}
      </div>

      <div className="toolbar">
        <button onClick={() => addBlock('header')}>➕ Header</button>
        <button onClick={() => addBlock('paragraph')}>📄 Paragraph</button>
        <button onClick={() => addBlock('image')}>🖼️ Image</button>
        <button onClick={() => addBlock('gallery')}>🖼️ Gallery</button>
        <button onClick={() => addBlock('socialLinks')}>🔗 Social links</button>
        <button onClick={() => addBlock('musicTracks')}>🎵 Music tracks</button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="blocks-container">
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                id={block.id}
                block={block}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && <div className="empty-state">✨ No blocks yet. Add some using the buttons above.</div>}
    </div>
  );
};