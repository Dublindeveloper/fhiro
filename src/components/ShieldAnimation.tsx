import { motion } from 'framer-motion';

export default function ShieldAnimation() {
  return (
    <div className="relative w-32 h-36 mx-auto">
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Shield SVG */}
      <motion.svg
        viewBox="0 0 100 120"
        className="w-full h-full shield-glow"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Shield body */}
        <motion.path
          d="M50 8 L90 24 L90 56 C90 80 70 100 50 112 C30 100 10 80 10 56 L10 24 Z"
          fill="rgba(16, 185, 129, 0.1)"
          stroke="#10B981"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />

        {/* Inner shield highlight */}
        <motion.path
          d="M50 18 L82 32 L82 54 C82 74 65 90 50 100 C35 90 18 74 18 54 L18 32 Z"
          fill="none"
          stroke="rgba(16, 185, 129, 0.3)"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        />

        {/* Lock body */}
        <motion.g
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
        >
          {/* Lock shackle */}
          <path
            d="M40 50 L40 42 C40 34 44 30 50 30 C56 30 60 34 60 42 L60 50"
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Lock body */}
          <rect
            x="36"
            y="50"
            width="28"
            height="22"
            rx="4"
            fill="#10B981"
          />
          {/* Keyhole */}
          <circle cx="50" cy="59" r="3" fill="#0F172A" />
          <rect x="48" y="59" width="4" height="8" rx="1" fill="#0F172A" />
        </motion.g>

        {/* Checkmark overlay (appears after lock) */}
        <motion.path
          d="M38 60 L46 68 L62 52"
          fill="none"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4, ease: 'easeOut' }}
        />
      </motion.svg>

      {/* Status indicator */}
      <motion.div
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
        style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10B981',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.4 }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
        SECURE
      </motion.div>
    </div>
  );
}
