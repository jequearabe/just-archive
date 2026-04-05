import React from 'react';
import { IconPicker } from './IconPicker';

interface BlockEditorProps {
  block: { type: string; props: Record<string, any> };
  onUpdate: (props: Record<string, any>) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ block, onUpdate }) => {
  const { type, props } = block;

  const updateProp = (key: string, value: any) => {
    onUpdate({ ...props, [key]: value });
  };

  if (type === 'header') {
    return (
      <div className="editor-field">
        <select value={props.level || 2} onChange={(e) => updateProp('level', parseInt(e.target.value))}>
          <option value={1}>H1 - Large title</option>
          <option value={2}>H2 - Section title</option>
          <option value={3}>H3 - Subtitle</option>
        </select>
        <input
          type="text"
          value={props.text || ''}
          onChange={(e) => updateProp('text', e.target.value)}
          placeholder="Your title text"
        />
      </div>
    );
  }

  if (type === 'paragraph') {
    return (
      <textarea
        value={props.text || ''}
        onChange={(e) => updateProp('text', e.target.value)}
        rows={4}
        placeholder="Write your paragraph here..."
      />
    );
  }

  if (type === 'image') {
    return (
      <div className="editor-field">
        <input
          type="text"
          value={props.url || ''}
          onChange={(e) => updateProp('url', e.target.value)}
          placeholder="Image URL (or upload via button)"
        />
        <input
          type="text"
          value={props.caption || ''}
          onChange={(e) => updateProp('caption', e.target.value)}
          placeholder="Caption (optional)"
        />
        <button type="button" onClick={() => document.getElementById('imageUpload')?.click()}>
          📁 Upload Image
        </button>
        <input type="file" id="imageUpload" accept="image/*" style={{ display: 'none' }} />
      </div>
    );
  }

  if (type === 'gallery') {
    const images = props.images || [];
    const addImage = () => updateProp('images', [...images, '']);
    const updateImage = (idx: number, url: string) => {
      const newImages = [...images];
      newImages[idx] = url;
      updateProp('images', newImages);
    };
    const removeImage = (idx: number) => updateProp('images', images.filter((_: any, i: number) => i !== idx));
    return (
      <div>
        {images.map((url: string, idx: number) => (
          <div key={idx} className="gallery-row">
            <input type="text" value={url} onChange={(e) => updateImage(idx, e.target.value)} placeholder="Image URL" />
            <button onClick={() => removeImage(idx)}>✕ Remove</button>
          </div>
        ))}
        <button onClick={addImage}>+ Add image</button>
      </div>
    );
  }

  if (type === 'socialLinks') {
    const links = props.links || [];
    const addLink = () => updateProp('links', [...links, { label: '', url: '', icon: 'fas fa-link' }]);
    const updateLink = (idx: number, field: string, value: string) => {
      const newLinks = [...links];
      newLinks[idx][field] = value;
      updateProp('links', newLinks);
    };
    const removeLink = (idx: number) => updateProp('links', links.filter((_: any, i: number) => i !== idx));
    return (
      <div>
        {links.map((link: any, idx: number) => (
          <div key={idx} className="social-row">
            <input
              type="text"
              value={link.label}
              onChange={(e) => updateLink(idx, 'label', e.target.value)}
              placeholder="Label (e.g., Twitter)"
            />
            <input
              type="text"
              value={link.url}
              onChange={(e) => updateLink(idx, 'url', e.target.value)}
              placeholder="URL (https://...)"
            />
            <IconPicker value={link.icon} onChange={(icon) => updateLink(idx, 'icon', icon)} />
            <button onClick={() => removeLink(idx)}>✕</button>
          </div>
        ))}
        <button onClick={addLink}>+ Add social link</button>
      </div>
    );
  }

  if (type === 'musicTracks') {
    const tracks = props.tracks || [];
    const addTrack = () => updateProp('tracks', [...tracks, { platform: 'youtube', url: '', name: '' }]);
    const updateTrack = (idx: number, field: string, value: string) => {
      const newTracks = [...tracks];
      newTracks[idx][field] = value;
      updateProp('tracks', newTracks);
    };
    const removeTrack = (idx: number) => updateProp('tracks', tracks.filter((_: any, i: number) => i !== idx));
    return (
      <div>
        {tracks.map((track: any, idx: number) => (
          <div key={idx} className="track-row">
            <select value={track.platform} onChange={(e) => updateTrack(idx, 'platform', e.target.value)}>
              <option value="youtube">YouTube</option>
              <option value="spotify">Spotify</option>
              <option value="applemusic">Apple Music</option>
            </select>
            <input
              type="text"
              value={track.name}
              onChange={(e) => updateTrack(idx, 'name', e.target.value)}
              placeholder="Song / album name"
            />
            <input
              type="text"
              value={track.url}
              onChange={(e) => updateTrack(idx, 'url', e.target.value)}
              placeholder="URL"
            />
            <button onClick={() => removeTrack(idx)}>✕</button>
          </div>
        ))}
        <button onClick={addTrack}>+ Add music track</button>
      </div>
    );
  }

  return <div>Unknown block type: {type}</div>;
};