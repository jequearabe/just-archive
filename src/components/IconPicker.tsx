import React from 'react';

const ICON_OPTIONS = [
  { value: 'fab fa-twitter', label: 'Twitter' },
  { value: 'fab fa-instagram', label: 'Instagram' },
  { value: 'fab fa-github', label: 'GitHub' },
  { value: 'fab fa-linkedin', label: 'LinkedIn' },
  { value: 'fab fa-youtube', label: 'YouTube' },
  { value: 'fab fa-spotify', label: 'Spotify' },
  { value: 'fab fa-apple', label: 'Apple Music' },
  { value: 'fab fa-discord', label: 'Discord' },
  { value: 'fas fa-globe', label: 'Website' },
  { value: 'fas fa-envelope', label: 'Email' },
  { value: 'fas fa-link', label: 'Link' },
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="icon-picker">
      {ICON_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label} ({opt.value})
        </option>
      ))}
    </select>
  );
};