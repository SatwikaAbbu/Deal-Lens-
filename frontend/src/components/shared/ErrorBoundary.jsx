import React from 'react';
import ReportCard from './ReportCard';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error.message };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Section Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ReportCard eyebrow={this.props.eyebrow || "!"} title={this.props.title || "Section Failed to Load"}>
          <div className="p-4 rounded-lg bg-verdict-red-bg/20 border border-verdict-red-border/30">
            <p className="text-sm font-mono text-verdict-red-text mb-2">
              ⚠️ Failed to render this section.
            </p>
            <p className="text-xs text-text-muted font-mono whitespace-pre-wrap">
              {this.state.errorMsg || "Unknown error occurred."}
            </p>
          </div>
        </ReportCard>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
