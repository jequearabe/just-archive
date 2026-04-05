import React, { useState } from 'react';

export const SimpleEditor = ({ initialData, onSave }) => {
  const [slug, setSlug] = useState(initialData.slug || '');
  const [title, setTitle] = useState(initialData.title || '');
  const [blocks, setBlocks] = useState(initialData.content_json?.blocks || []);

  const addBlock = () => {
    setBlocks([...blocks, { id: Date.now(), type: 'paragraph', props: { text: '' } }]);
  };

  const updateBlock = (id, text) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, props: { text } } : b));
  };

  const save = async () => {
    const token = localStorage.getItem('token');
    await fetch('/api/user/page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ slug, title, content_json: { blocks } }),
    });
    onSave();
  };

  return (
    <div>
      <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="slug" />
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="title" />
      <button onClick={addBlock}>Añadir bloque</button>
      {blocks.map(block => (
        <textarea key={block.id} value={block.props.text} onChange={e => updateBlock(block.id, e.target.value)} />
      ))}
      <button onClick={save}>Guardar</button>
    </div>
  );
};