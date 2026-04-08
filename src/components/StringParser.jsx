import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, XCircle, ChevronRight, Hash, GitBranch, Terminal, Sparkles } from 'lucide-react';
import { checkString, buildParseTree, getDerivationSteps } from '../utils/converter';

// Simple SVG Tree Node Component
const TreeNode = ({ node, x, y, xDiff, depth = 0 }) => {
  if (!node) return null;
  const isTerminal = node.terminal;
  const childY = y + 80;

  return (
    <g>
      {node.children && node.children.map((child, i) => {
        const childX = node.children.length === 1 ? x : (i === 0 ? x - xDiff : x + xDiff);
        return (
          <React.Fragment key={i}>
            <motion.line
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 0.6, delay: depth * 0.15 }}
              x1={x} y1={y} x2={childX} y2={childY}
              stroke="var(--text-main)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <TreeNode node={child} x={childX} y={childY} xDiff={xDiff * 0.55} depth={depth + 1} />
          </React.Fragment>
        );
      })}

      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, delay: depth * 0.15 }}
      >
        <circle
          cx={x} cy={y} r="20"
          fill={isTerminal ? "var(--bg-glass-active)" : "var(--accent-primary)"}
          stroke={isTerminal ? "var(--accent-secondary)" : "transparent"}
          strokeWidth="2"
          filter="url(#nodeShadow)"
        />
        <text
          x={x} y={y} dy="5"
          textAnchor="middle"
          fill={isTerminal ? "var(--accent-secondary)" : "var(--btn-fill-text)"}
          style={{ fontSize: '12px', fontWeight: 900, fontFamily: 'Inter, monospace' }}
        >
          {node.sym === '\u03B5' ? 'ε' : node.sym}
        </text>
      </motion.g>
    </g>
  );
};

const StringParser = ({ cnfGrammar, startSymbol = 'S' }) => {
  const [inputString, setInputString] = useState('');
  const [result, setResult] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  const gInternal = useMemo(() => {
    if (!cnfGrammar) return null;
    const productions = new Map();
    const variables = Object.keys(cnfGrammar);
    for (const v of variables) {
      productions.set(v, cnfGrammar[v].map(p => p.length === 0 ? ['\u03B5'] : p));
    }
    return {
      variables,
      start: variables.includes('S0') ? 'S0' : (variables.includes(startSymbol) ? startSymbol : variables[0]),
      productions
    };
  }, [cnfGrammar, startSymbol]);

  const handleParse = () => {
    if (isParsing || !gInternal) return;
    setIsParsing(true);
    setResult(null);

    setTimeout(() => {
      const cykRes = checkString(gInternal, inputString.trim());
      let tree = null;
      let derivation = [];

      if (cykRes.accepted) {
        tree = buildParseTree(gInternal, cykRes.table, inputString.trim(), inputString.trim().length, 0, gInternal.start);
        derivation = getDerivationSteps(tree);
      }

      setResult({ ...cykRes, tree, derivation });
      setIsParsing(false);
      setShowExtras(cykRes.accepted);
    }, 400);
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', marginBottom: '20px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
            Testing Playground
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '500px', lineHeight: '1.6' }}>
            Verify if a string belongs to the language. Using the <strong>internally generated CNF</strong> for high-performance membership testing (CYK).
          </p>
        </div>
        <div style={{ background: 'var(--bg-glass-active)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          CYK Engine v1.0
        </div>
      </div>

      <div className="playground-input-group" style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Hash
            size={16}
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
          />
          <input
            type="text"
            placeholder="Enter string (e.g. aabb)"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleParse()}
            className="glass-input"
            style={{ paddingLeft: '40px', width: '100%' }}
          />
        </div>
        <button
          onClick={handleParse}
          disabled={isParsing || !cnfGrammar}
          className="btn-primary playground-test-btn"
        >
          {isParsing ? <div className="spin" style={{ width: '14px', height: '14px', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: 'currentColor', borderRadius: '50%' }} /> : 'Test String'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            key={inputString + result.accepted}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderRadius: '14px',
              background: 'var(--bg-glass-active)',
              border: `1px solid ${result.accepted ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {result.accepted ? (
                  <CheckCircle2 size={24} style={{ color: '#10b981' }} />
                ) : (
                  <XCircle size={24} style={{ color: '#ef4444' }} />
                )}
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                    String "{inputString}" is {result.accepted ? 'ACCEPTED' : 'REJECTED'}
                  </h4>
                  <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                    {result.accepted ? 'Matches the grammar rules.' : 'Cannot be generated by this grammar.'}
                  </p>
                </div>
              </div>
              {result.accepted && (
                <button
                  onClick={() => setShowExtras(!showExtras)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                    fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  {showExtras ? 'Hide Details' : 'Show Tree & Derivation'}
                  <ChevronRight size={14} style={{ transform: showExtras ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              )}
            </div>

            {/* CYK Table Render */}
            <div className="cyk-table-wrapper" style={{ overflowX: 'auto', marginBottom: '32px', borderRadius: '12px' }}>
              <table className="cyk-table" style={{ borderCollapse: 'collapse', width: '100%', minWidth: '300px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}></th>
                    {inputString.split('').map((c, i) => (
                      <th key={i} style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inputString.length > 0 && Array.from({ length: inputString.length }).map((_, lIdx) => {
                    const len = lIdx + 1;
                    return (
                      <tr key={len} style={{ borderTop: '1px solid var(--border-glass)' }}>
                        <td style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                          l={len}
                        </td>
                        {Array.from({ length: inputString.length }).map((_, pos) => {
                          const j = pos + len - 1;
                          if (j >= inputString.length) return <td key={pos}></td>;
                          
                          // Safety check: ensure table entry exists (prevents crash during rapid typing/HMR)
                          const tableCell = result.table && result.table[len] && result.table[len][pos];
                          if (!tableCell) return <td key={pos}></td>;

                          const vars = Array.from(tableCell).sort();
                          const isStart = len === inputString.length && pos === 0 && vars.includes(gInternal.start);
                          return (
                            <td key={pos} style={{ padding: '8px', textAlign: 'center' }}>
                              <div style={{
                                display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3px',
                                minHeight: '28px', alignItems: 'center'
                              }}>
                                {vars.map(v => (
                                  <span key={v} style={{
                                    fontSize: '0.7rem', fontWeight: 800, padding: '2px 5px',
                                    borderRadius: '5px',
                                    background: isStart ? "var(--accent-primary)" : "var(--bg-glass-active)",
                                    color: isStart ? "var(--btn-fill-text)" : "var(--text-main)",
                                    border: isStart ? "none" : "1px solid var(--border-glass)"
                                  }}>
                                    {v}
                                  </span>
                                ))}
                                {vars.length === 0 && <span style={{ opacity: 0.1, fontSize: '0.6rem' }}>-</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tree & Derivation Section */}
            {showExtras && result.accepted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.1)', borderRadius: '18px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <Terminal size={18} style={{ color: 'var(--accent-primary)' }} />
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Leftmost Derivation</h4>
                  </div>

                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center',
                    padding: '16px', background: 'var(--bg-glass)', borderRadius: '12px',
                    marginBottom: '32px', fontSize: '0.85rem', fontFamily: 'monospace'
                  }}>
                    {result.derivation.map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {i > 0 && <span style={{ opacity: 0.3, fontSize: '1.1rem' }}>⇒</span>}
                        <span style={{
                          padding: '6px 12px', borderRadius: '8px',
                          background: i === result.derivation.length - 1 ? "rgba(16,185,129,0.08)" : "var(--bg-glass-subtle)",
                          color: i === result.derivation.length - 1 ? "#10b981" : "var(--text-main)",
                          fontWeight: i === result.derivation.length - 1 ? 800 : 400,
                          border: `1px solid ${i === result.derivation.length - 1 ? 'rgba(16,185,129,0.2)' : 'var(--border-glass)'}`,
                          boxShadow: i === result.derivation.length - 1 ? '0 4px 12px rgba(16,185,129,0.1)' : 'none'
                        }}>
                          {step.split('').map((char, ci) => (
                            <span key={ci} style={{
                              color: /^[A-Z]/.test(char) ? 'var(--accent-primary)' : 'var(--accent-secondary)'
                            }}>
                              {char}
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <GitBranch size={18} style={{ color: 'var(--accent-primary)' }} />
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Parse Tree Visualization</h4>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', padding: '20px 0' }}>
                    <svg width={Math.max(400, inputString.length * 100)} height={inputString.length * 80 + 100}>
                      <defs>
                        <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
                        </filter>
                      </defs>
                      <TreeNode
                         node={result.tree}
                         x={Math.max(200, inputString.length * 50)}
                         y={40}
                         xDiff={inputString.length * 25}
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StringParser;
