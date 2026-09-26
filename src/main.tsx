import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props: ErrorBoundaryProps;
  state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('HardwareLab caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          direction: 'rtl',
          background: '#f8fafc',
          color: '#1e293b'
        }}>
          <div style={{
            maxWidth: '520px',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '32px 24px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '42px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              خطایی در اجرای صفحه رخ داد
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
              یکی از مؤلفه‌های گرافیکی یا حافظه با خطا مواجه شد. می‌توانید صفحه را مجدداً بارگذاری کنید:
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 22px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                بارگذاری مجدد صفحه
              </button>
              <button
                onClick={() => {
                  window.location.href = window.location.pathname;
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                بازگشت به صفحه اصلی
              </button>
            </div>
            {this.state.error && (
              <pre style={{
                marginTop: '20px',
                padding: '12px',
                background: '#f1f5f9',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#ef4444',
                textAlign: 'left',
                direction: 'ltr',
                overflowX: 'auto'
              }}>
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
