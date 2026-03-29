import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRightToLine, Menu, X, BookOpen } from 'lucide-react';
import './index.css';

import CFGInput from './components/CFGInput';
import GrammarStep from './components/GrammarStep';
import ThemeToggle from './components/ThemeToggle';
import { AboutCFG, WhatIsCNF, StepsCNF, WhatIsGNF, StepsGNF } from './components/InfoPages';
import { convertToCNF, convertToGNF } from './utils/converter';
import GlowProvider from './components/GlowProvider';

const NAV_ITEMS = [
  { id: 'cfg',       label: 'About CFG' },
  { id: 'cnf-what',  label: 'What is CNF?' },
  { id: 'cnf-steps', label: 'Steps: CFG → CNF' },
  { id: 'gnf-what',  label: 'What is GNF?' },
  { id: 'gnf-steps', label: 'Steps: CFG → GNF' },
];

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

function App() {
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null); // 'cnf' | 'gnf'
  const [activeTab, setActiveTab] = useState('cfg');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleConvert = (grammarConfig, type) => {
    setError(null);
    setSteps([]);
    setLastAction(type);
    setIsLoading(true);

    // 1.5s simulated calculation delay
    setTimeout(() => {
      try {
        const outputSteps = type === 'gnf' ? convertToGNF(grammarConfig) : convertToCNF(grammarConfig);
        setSteps(outputSteps);
        setError(null);
      } catch (err) {
        console.error('Conversion Error:', err);
        setError(err.message || 'Failed to parse or convert the grammar. Please check your rules.');
        setSteps([]);
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <GlowProvider>
      <div className="app-layout">
      {/* Hamburger — only visible when sidebar is CLOSED */}
      {!isSidebarOpen && (
        <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)} title="Open sidebar">
          <Menu size={18} />
        </button>
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${!isSidebarOpen ? 'closed' : ''}`}>

        {/* Header row: logo left | close button right — NO overlap */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <h2 style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.03em' }}>
              <u>Project by Laksh Kumar</u>
              <br/>
              <u>2024UCM2375</u>
            </h2>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setIsSidebarOpen(false)}
            title="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav items */}
        <div className="sidebar-nav">
          <div className="sidebar-divider" />
          <span className="nav-section-label">Theory</span>

          {NAV_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </button>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <button
              className={`nav-item nav-converter ${activeTab === 'converter' ? 'active' : ''}`}
              onClick={() => setActiveTab('converter')}
            >
              <Sparkles size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Converter
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={`main-content ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
        <div className="app-container">

          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

          {/* Hero — Saki ultra-bold minimal */}
          <motion.div
            className="hero-section"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1
              className="heading-xl"
              style={{
                fontSize: 'clamp(2.4rem, 5.5vw, 4rem)',
                fontWeight: 900,
                letterSpacing: '-0.045em',
                lineHeight: 1.04,
                color: 'var(--text-main)',
              }}
            >
              CNF &amp; GNF<br />
              <span style={{ color: 'var(--text-muted)', fontWeight: 300 }}>Converter</span>
            </h1>
            <div className="hero-divider" />
            <p className="hero-subtitle">
              An interactive portal for formal grammar normalizations.
              Step-by-step CNF and GNF transformations.
            </p>
          </motion.div>

          {/* Routed content */}
          <AnimatePresence mode="wait">

            {activeTab === 'cfg' && (
              <motion.div key="cfg" className="info-page" {...pageVariants}>
                <AboutCFG />
              </motion.div>
            )}
            {activeTab === 'cnf-what' && (
              <motion.div key="cnf-what" className="info-page" {...pageVariants}>
                <WhatIsCNF />
              </motion.div>
            )}
            {activeTab === 'cnf-steps' && (
              <motion.div key="cnf-steps" className="info-page" {...pageVariants}>
                <StepsCNF />
              </motion.div>
            )}
            {activeTab === 'gnf-what' && (
              <motion.div key="gnf-what" className="info-page" {...pageVariants}>
                <WhatIsGNF />
              </motion.div>
            )}
            {activeTab === 'gnf-steps' && (
              <motion.div key="gnf-steps" className="info-page" {...pageVariants}>
                <StepsGNF />
              </motion.div>
            )}

            {activeTab === 'converter' && (
              <motion.div key="converter" className="converter-layout" {...pageVariants}>

                {/* Input */}
                <div className="input-section">
                  <CFGInput
                    onConvert={handleConvert}
                    error={error}
                    isLoading={isLoading}
                    lastAction={lastAction}
                  />
                </div>

                {/* Output */}
                <div className="output-section">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="empty-state"
                      style={{ gap: '0' }}
                    >
                      {/* Spinning ring */}
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        border: '4px solid var(--border-glass)',
                        borderTopColor: 'var(--accent-primary)',
                        animation: 'spin 0.9s linear infinite',
                        marginBottom: '20px',
                      }} />
                      <h3 style={{ marginBottom: '6px' }}>
                        {lastAction === 'gnf' ? 'Converting to GNF…' : 'Converting to CNF…'}
                      </h3>
                      <p style={{ fontSize: '0.88rem', marginTop: '4px', animation: 'pulse-fade 1.5s ease-in-out infinite' }}>
                        Applying transformation steps, please wait…
                      </p>
                    </motion.div>
                  ) : steps.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="empty-state"
                    >
                      <ArrowRightToLine
                        size={44}
                        style={{ opacity: 0.22, marginBottom: '14px', color: 'var(--accent-primary)' }}
                      />
                      <h3>Awaiting Your Grammar</h3>
                      <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>
                        Enter grammar rules above and click <em>Convert to CNF</em> or <em>Convert to GNF</em>.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                      <AnimatePresence>
                        {steps.map((step, index) => (
                          <GrammarStep key={index} step={step} isActive />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
      </div>
    </GlowProvider>
  );
}

export default App;
