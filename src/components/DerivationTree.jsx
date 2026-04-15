import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Animated Tree Node Component (matching StringParser style)
const TreeNode = ({ node, x, y, allocatedWidth, depth = 0, nodeRadius = 28 }) => {
  if (!node) return null;
  const isTerminal = node.terminal !== false;
  const childY = y + 140;

  // Get label text
  let labelText = node.sym === 'ε' || node.sym === '\u03B5' ? 'ε' : String(node.sym);
  
  // Calculate dynamic size based on text length
  // For short text (1-2 chars), use fixed radius
  // For longer text, use rounded rectangle
  const isShortText = labelText.length <= 2;
  const baseRadius = 28;
  const dynamicRadius = isShortText ? baseRadius : baseRadius + (labelText.length - 2) * 8;
  const rectWidth = isShortText ? baseRadius * 2 : Math.max(baseRadius * 2.2, labelText.length * 12 + 12);
  const rectHeight = baseRadius * 1.8;

  // Enhanced color scheme
  const circleFill = isTerminal 
    ? "rgba(16, 185, 129, 0.2)" 
    : "rgba(59, 130, 246, 0.2)";
  const circleStroke = isTerminal ? "#10b981" : "#3b82f6";
  const textFill = isTerminal ? "#10b981" : "#3b82f6";

  let currentXStart = x - allocatedWidth / 2;

  return (
    <g>
      {/* Lines between nodes */}
      {node.children && node.children.map((child, i) => {
        const childShare = (child.subtreeWidth / node.subtreeWidth) * allocatedWidth;
        const childX = currentXStart + childShare / 2;
        currentXStart += childShare;

        return (
          <React.Fragment key={i}>
            <motion.line
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 0.7, delay: depth * 0.08, ease: "easeOut" }}
              x1={x} y1={y + (isShortText ? baseRadius : rectHeight / 2)} 
              x2={childX} y2={childY - (isShortText ? baseRadius : rectHeight / 2)}
              stroke="var(--text-main)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeDasharray={isTerminal ? "none" : "5 5"}
              style={{ opacity: 0.45 }}
            />
            <TreeNode 
              node={child} 
              x={childX} 
              y={childY} 
              allocatedWidth={childShare} 
              depth={depth + 1}
              nodeRadius={nodeRadius}
            />
          </React.Fragment>
        );
      })}

      {/* Node Circle/Rounded Rectangle with Enhanced Styling */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: depth * 0.08 }}
      >
        {isShortText ? (
          <>
            {/* Shadow for circular nodes */}
            <circle 
              cx={x} cy={y + 3} r={baseRadius} 
              fill="rgba(0, 0, 0, 0.25)" 
              opacity="0.6"
            />
            
            {/* Main Circle Background */}
            <circle
              cx={x} cy={y} r={baseRadius}
              fill="var(--body-bg)"
              opacity="1"
            />
            
            {/* Circle with gradient effect */}
            <circle
              cx={x} cy={y} r={baseRadius}
              fill={circleFill}
              stroke={circleStroke}
              strokeWidth="3"
              style={{ 
                filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.3))',
                backdropFilter: 'blur(4px)'
              }}
            />
            
            {/* Text Label for circles */}
            <text
              x={x} y={y}
              dy="0.35em"
              textAnchor="middle"
              fill={textFill}
              style={{ 
                fontSize: '16px', 
                fontWeight: 900, 
                fontFamily: 'Inter, -apple-system, sans-serif',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            >
              {labelText}
            </text>
          </>
        ) : (
          <>
            {/* Shadow for rounded rectangles */}
            <rect
              x={x - rectWidth / 2} y={y - rectHeight / 2 + 3}
              width={rectWidth} height={rectHeight}
              rx={rectHeight / 2}
              fill="rgba(0, 0, 0, 0.25)"
              opacity="0.6"
            />
            
            {/* Main Rectangle Background */}
            <rect
              x={x - rectWidth / 2} y={y - rectHeight / 2}
              width={rectWidth} height={rectHeight}
              rx={rectHeight / 2}
              fill="var(--body-bg)"
              opacity="1"
            />
            
            {/* Rectangle with gradient effect */}
            <rect
              x={x - rectWidth / 2} y={y - rectHeight / 2}
              width={rectWidth} height={rectHeight}
              rx={rectHeight / 2}
              fill={circleFill}
              stroke={circleStroke}
              strokeWidth="3"
              style={{ 
                filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.3))',
                backdropFilter: 'blur(4px)'
              }}
            />
            
            {/* Text Label for rectangles */}
            <text
              x={x} y={y}
              dy="0.35em"
              textAnchor="middle"
              fill={textFill}
              style={{ 
                fontSize: '15px', 
                fontWeight: 900, 
                fontFamily: 'Inter, -apple-system, sans-serif',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            >
              {labelText}
            </text>
          </>
        )}
      </motion.g>
    </g>
  );
};

/**
 * DerivationTree Component with enhanced UI
 * Renders interactive tree visualizations matching StringParser style
 */
export default function DerivationTree({ tree, title = "Derivation Tree" }) {
  const [zoom, setZoom] = useState(1);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  // Calculate subtree widths for adaptive layout
  const processedTree = useMemo(() => {
    const calculateSubtreeWidths = (node) => {
      if (!node) return 0;
      if (!node.children || node.children.length === 0) {
        node.subtreeWidth = 1;
        return 1;
      }
      let totalWidth = 0;
      for (const child of node.children) {
        totalWidth += calculateSubtreeWidths(child);
      }
      node.subtreeWidth = totalWidth;
      return totalWidth;
    };

    if (tree) {
      const cloned = JSON.parse(JSON.stringify(tree));
      calculateSubtreeWidths(cloned);
      return cloned;
    }
    return null;
  }, [tree]);

  const nodeRadius = 28;
  const verticalSpacing = 140;
  const horizontalSpacing = processedTree ? Math.max(120, processedTree.subtreeWidth * 80) : 300;

  if (!processedTree) return null;

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));
  const handleReset = () => {
    setZoom(1);
    setDragPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38 }}
      className="derivation-tree-container"
      style={{
        padding: '20px',
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-glass)',
        borderRadius: '12px',
        marginTop: '16px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '15px', fontWeight: '700', letterSpacing: '-0.02em' }}>
          {title}
        </h4>
        
        {/* Enhanced Control Bar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          background: 'var(--bg-glass-active)', 
          padding: '6px', 
          borderRadius: '10px', 
          border: '1px solid var(--border-glass)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginRight: '4px', padding: '0 4px' }}>
            <button 
              onClick={handleZoomOut}
              className="icon-btn-pill"
              style={{
                padding: '4px 6px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }}
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: 800, 
              minWidth: '38px', 
              textAlign: 'center',
              color: 'var(--text-main)',
              opacity: 0.7
            }}>
              {Math.round(zoom * 100)}%
            </div>
            <button 
              onClick={handleZoomIn}
              className="icon-btn-pill"
              style={{
                padding: '4px 6px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }}
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          <div style={{ width: '1px', height: '16px', background: 'var(--border-glass)' }} />

          <button 
            onClick={handleReset}
            className="btn-reset-pill"
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: '600'
            }}
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>
      
      <div 
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '400px',
          overflow: 'hidden', 
          background: 'var(--bg-glass-subtle)', 
          borderRadius: '14px',
          border: '1px solid var(--border-glass)',
          boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.3)',
          cursor: 'grab'
        }}
        onWheel={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            setZoom(z => Math.max(0.5, Math.min(3, z + delta)));
          }
        }}
      >
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          animate={{ 
            scale: zoom, 
            x: dragPosition.x, 
            y: dragPosition.y 
          }}
          style={{ 
            width: '2400px', 
            height: '1800px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            position: 'absolute',
            top: '40px',
            left: 'calc(50% - 1200px)',
            cursor: 'grabbing',
            transformOrigin: 'top center'
          }}
          onDragEnd={(e, info) => {
            setDragPosition(prev => ({ 
              x: prev.x + info.offset.x, 
              y: prev.y + info.offset.y 
            }));
          }}
        >
          <svg 
            width="2400" 
            height="1800"
            viewBox="0 0 2400 1800"
            style={{ overflow: 'visible' }}
          >
            <TreeNode
              node={processedTree}
              x={1200}
              y={60}
              allocatedWidth={Math.max(800, processedTree.subtreeWidth * 120)}
              nodeRadius={nodeRadius}
            />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * Utility: Build a derivation tree from a grammar and string
 * Used to show one-step derivations or example parses
 */
export function buildSimpleDerivationTree(symbol, production) {
  return {
    sym: symbol,
    children: production.map(sym => ({
      sym: sym,
      terminal: /^[a-z0-9ε_]$/.test(sym) || sym === 'ε',
      children: []
    })),
    terminal: false
  };
}

/**
 * Build a derivation tree showing grammar transformation
 * For example: showing how a rule was split during binarization
 */
export function buildTransformationTree(rule, transformation) {
  return {
    sym: rule,
    children: [
      {
        sym: 'Original',
        children: transformation.original.map(s => ({
          sym: s,
          terminal: /^[a-z0-9ε_]$/.test(s) || s === 'ε'
        }))
      },
      {
        sym: 'Transformed',
        children: transformation.transformed.map(s => ({
          sym: s,
          terminal: /^[a-z0-9ε_]$/.test(s) || s === 'ε'
        }))
      }
    ]
  };
}
