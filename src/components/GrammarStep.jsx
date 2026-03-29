import React from 'react';
import { motion } from 'framer-motion';

function renderProduction(symbols) {
  if (!symbols || symbols.length === 0) {
    return (
      <span className="terminal" style={{ marginRight: '3px' }}>
        ε
      </span>
    );
  }
  return symbols.map((symbol, idx) => {
    const isTerminal = /^[a-z0-9ε_]$/.test(symbol) || symbol === 'ε';
    return (
      <span key={idx} className={isTerminal ? 'terminal' : 'non-terminal'} style={{ marginRight: '3px' }}>
        {symbol}
      </span>
    );
  });
}

export default function GrammarStep({ step }) {
  if (!step) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card step-card"
    >
      {/* Header row */}
      <div className="step-card-header">
        <h3 className="step-title">{step.title}</h3>
        <span className="step-badge">Step</span>
      </div>

      {/* Description block */}
      {step.description && (
        <div className="step-description">
          {step.description.split('\n').map((line, idx) =>
            line.trim() ? <p key={idx} style={{ marginBottom: '6px' }}>{line}</p> : null
          )}
        </div>
      )}

      {/* Grammar display */}
      <div className="grammar-display">
        {Object.entries(step.grammar).map(([head, productions], i) => (
          <div key={i} className="rule">
            <span className="rule-left">{head}</span>
            <span className="rule-arrow">→</span>
            <div className="rule-right" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'baseline' }}>
              {productions.map((prod, j) => (
                <React.Fragment key={j}>
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'baseline' }}>
                    {renderProduction(prod)}
                  </div>
                  {j < productions.length - 1 && (
                    <span style={{ color: 'var(--text-muted)', padding: '0 2px' }}>|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(step.grammar).length === 0 && (
          <div style={{ fontStyle: 'italic', opacity: 0.5 }}>Empty grammar at this stage</div>
        )}
      </div>
    </motion.div>
  );
}
