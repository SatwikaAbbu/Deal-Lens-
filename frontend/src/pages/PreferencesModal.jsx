import React, { useState, useEffect } from 'react';
import { getPreferences, savePreferences } from '../api/dashboard';

const ALL_CATEGORIES = [
  'EdTech', 'FinTech', 'HealthTech', 'QuickCommerce', 'SaaS',
  'AgriTech', 'CleanTech', 'Crypto', 'AI/ML', 'Logistics',
  'FoodTech', 'Gaming', 'MediaTech', 'InsurTech', 'PropTech',
  'HRTech', 'LegalTech', 'TravelTech', 'D2C', 'Marketplace', 'Other',
];

export default function PreferencesModal({ isOpen, onClose, onSaved }) {
  const [interested, setInterested] = useState([]);
  const [disqualified, setDisqualified] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getPreferences()
      .then((data) => {
        setInterested(data.interested_categories || []);
        setDisqualified(data.disqualified_categories || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePreferences(interested, disqualified);
      onSaved?.();
      onClose();
    } catch {
      // Silently fail for hackathon
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (cat, list, setList) => {
    if (list.includes(cat)) {
      setList(list.filter((c) => c !== cat));
    } else {
      // Remove from the other list if present
      if (list === interested) {
        setDisqualified(disqualified.filter((c) => c !== cat));
      } else {
        setInterested(interested.filter((c) => c !== cat));
      }
      setList([...list, cat]);
    }
  };

  const getCatState = (cat) => {
    if (interested.includes(cat)) return 'interested';
    if (disqualified.includes(cat)) return 'disqualified';
    return 'neutral';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-bg-surface border border-border-standard rounded-2xl w-full max-w-lg mx-4 shadow-2xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle">
          <div>
            <h2 className="text-lg font-sans font-semibold text-text-primary">Investment Preferences</h2>
            <p className="text-xs font-sans text-text-muted mt-1">Click categories to set your interest level</p>
          </div>
          <button onClick={onClose} className="text-text-faint hover:text-text-primary transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="text-center text-text-muted font-mono text-sm py-8">Loading preferences...</div>
          ) : (
            <>
              {/* Legend */}
              <div className="flex items-center gap-4 mb-5 text-[10px] font-mono uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-verdict-green-text" />
                  <span className="text-text-muted">Interested</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-verdict-red-text" />
                  <span className="text-text-muted">Disqualified</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-text-faint" />
                  <span className="text-text-muted">Neutral</span>
                </span>
              </div>

              {/* Category Grid */}
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((cat) => {
                  const state = getCatState(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        if (state === 'neutral') {
                          toggleCategory(cat, interested, setInterested);
                        } else if (state === 'interested') {
                          // Move from interested → disqualified
                          setInterested(interested.filter((c) => c !== cat));
                          setDisqualified([...disqualified, cat]);
                        } else {
                          // Move from disqualified → neutral
                          setDisqualified(disqualified.filter((c) => c !== cat));
                        }
                      }}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-sans font-medium
                        border transition-all duration-200 cursor-pointer
                        ${state === 'interested'
                          ? 'bg-verdict-green-bg border-verdict-green-border text-verdict-green-text shadow-[0_0_10px_rgba(42,194,106,0.15)]'
                          : state === 'disqualified'
                            ? 'bg-verdict-red-bg border-verdict-red-border text-verdict-red-text shadow-[0_0_10px_rgba(226,75,74,0.15)]'
                            : 'bg-bg-raised border-border-standard text-text-muted hover:text-text-secondary hover:border-border-strong'
                        }
                      `}
                    >
                      {state === 'interested' && '✓ '}
                      {state === 'disqualified' && '✕ '}
                      {cat}
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] font-mono text-text-faint mt-4">
                Click once = Interested · Click twice = Disqualified · Click three times = Neutral
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-subtle">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-sans font-medium text-text-muted hover:text-text-primary border border-border-standard hover:border-border-strong transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-5 py-2 rounded-lg text-sm font-sans font-semibold text-white transition-all ${
              saving ? 'bg-accent/50 cursor-not-allowed' : 'bg-accent hover:bg-accent-hover'
            }`}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
