import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-5xl font-mono text-text-primary">404</h1>
        <p className="text-lg font-sans text-text-secondary">
          Report not found. The deck you are looking for may have been deleted or the link is invalid.
        </p>
        <Link 
          to="/"
          className="inline-block mt-4 px-6 py-3 rounded-lg bg-accent text-text-primary font-medium hover:bg-accent-hover transition-colors"
        >
          ← Analyse a new deck
        </Link>
      </div>
    </div>
  );
}
