import React, { useState, useCallback } from 'react';
import { submitDeck } from '../api/dashboard';

export default function SubmitPage() {
  const [founderEmail, setFounderEmail] = useState('');
  const [startupName, setStartupName] = useState('');
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a pitch deck PDF.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const data = await submitDeck(file, founderEmail, startupName);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped && dropped.name.toLowerCase().endsWith('.pdf')) {
      setFile(dropped);
    }
  }, []);

  // ── Success State ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center animate-fadeIn">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-verdict-green-bg border border-verdict-green-border flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-verdict-green-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-sans font-bold text-text-primary mb-3">
            Pitch Deck Submitted!
          </h1>
          <p className="text-text-secondary font-sans mb-6">
            Your pitch deck for <span className="text-accent-light font-semibold">{result.startup_name}</span> has been securely received.
          </p>

          <div className="bg-bg-surface border border-border-standard rounded-xl p-6 text-center space-y-4">
            <div className="flex justify-center mb-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
               </svg>
            </div>
            <p className="text-sm font-sans text-text-primary">
              A confirmation email has been sent to your inbox.
            </p>
            <p className="text-xs font-sans text-text-secondary leading-relaxed">
              Our team (and our internal analysis system) is currently reviewing your materials. We will reach out regarding next steps if there is a strong fit.
            </p>
          </div>

          <p className="text-xs font-mono text-text-faint mt-8">
            You may now close this window.
          </p>
        </div>
      </div>
    );
  }

  // ── Form State ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-sans font-semibold tracking-tight text-text-primary mb-2">
            Deal<span className="text-accent-light">Lens</span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-white mb-3">
            Submit Your Pitch Deck
          </h2>
          <p className="text-text-secondary font-sans">
            Fill in your details and upload your pitch deck for investor review.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-[11px] font-mono text-text-muted uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={founderEmail}
              onChange={(e) => setFounderEmail(e.target.value)}
              placeholder="founder@startup.com"
              className="w-full px-4 py-3 rounded-xl bg-bg-surface border border-border-standard text-text-primary font-sans placeholder:text-text-faint focus:outline-none focus:border-accent-light focus:ring-1 focus:ring-accent/30 transition-all"
              required
            />
          </div>

          {/* Startup Name */}
          <div>
            <label className="block text-[11px] font-mono text-text-muted uppercase tracking-wider mb-2">
              Startup Name
            </label>
            <input
              type="text"
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
              placeholder="Your Startup Name"
              className="w-full px-4 py-3 rounded-xl bg-bg-surface border border-border-standard text-text-primary font-sans placeholder:text-text-faint focus:outline-none focus:border-accent-light focus:ring-1 focus:ring-accent/30 transition-all"
              required
            />
          </div>

          {/* File Upload Zone */}
          <div>
            <label className="block text-[11px] font-mono text-text-muted uppercase tracking-wider mb-2">
              Pitch Deck (PDF)
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById('file-input').click()}
              className={`
                w-full rounded-xl border-2 border-dashed py-8 px-6
                flex flex-col items-center justify-center gap-3
                cursor-pointer transition-all duration-300
                ${file
                  ? 'border-verdict-green-border bg-verdict-green-bg/30'
                  : dragging
                    ? 'border-accent bg-accent/10 scale-[1.02]'
                    : 'border-border-standard bg-bg-surface hover:border-border-strong hover:bg-bg-raised'
                }
              `}
            >
              {file ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-verdict-green-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-sans text-verdict-green-text font-medium">{file.name}</p>
                  <p className="text-xs font-mono text-text-faint">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  <p className="text-sm font-sans text-text-secondary">
                    {dragging ? 'Drop your PDF here' : 'Drag & drop or click to browse'}
                  </p>
                  <p className="text-xs font-mono text-text-faint">PDF · Max 20 MB</p>
                </>
              )}
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile(e.target.files[0]);
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm font-sans text-verdict-red-text bg-verdict-red-bg border border-verdict-red-border rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`
              w-full py-3.5 rounded-xl font-sans font-semibold text-white text-sm
              transition-all duration-300
              ${submitting
                ? 'bg-accent/50 cursor-not-allowed'
                : 'bg-accent hover:bg-accent-hover shadow-[0_0_20px_rgba(113,112,255,0.2)] hover:shadow-[0_0_30px_rgba(113,112,255,0.4)] active:scale-[0.98]'
              }
            `}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Pitch Deck'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-text-faint">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Secure & private
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-text-faint">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Instant AI categorization
          </span>
        </div>
      </div>
    </div>
  );
}
