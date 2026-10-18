import React, { useState } from 'react';
import { PhoneCall, X, User, Building, Play } from 'lucide-react';

interface NewCallModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onStartCall: (prospectName: string, prospectCompany: string) => Promise<void>;
}

export const NewCallModal: React.FC<NewCallModalProps> = ({
  isOpen,
  isLoading,
  onClose,
  onStartCall
}) => {
  const [prospectName, setProspectName] = useState('');
  const [prospectCompany, setProspectCompany] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onStartCall(prospectName.trim(), prospectCompany.trim());
    setProspectName('');
    setProspectCompany('');
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="new-call-title">
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="brand-icon" style={{ width: '32px', height: '32px' }}>
              <PhoneCall size={16} />
            </div>
            <h3 id="new-call-title" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Start Live Cold Call
            </h3>
          </div>
          <button type="button" className="copy-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Enter the prospect's details (or leave blank to begin immediately). The 8-stage sales copilot will guide you through the dial.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="prospect-name">
              <span><User size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Prospect Full Name (Optional)</span>
            </label>
            <input
              id="prospect-name"
              type="text"
              className="form-input"
              placeholder="e.g. Sarah Connor, VP of Sales"
              value={prospectName}
              onChange={e => setProspectName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prospect-company">
              <span><Building size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Company Name (Optional)</span>
            </label>
            <input
              id="prospect-company"
              type="text"
              className="form-input"
              placeholder="e.g. Cyberdyne Systems"
              value={prospectCompany}
              onChange={e => setProspectCompany(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              id="btn-confirm-start-call"
            >
              <Play size={15} />
              <span>{isLoading ? 'Starting...' : 'Begin Live Guidance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
