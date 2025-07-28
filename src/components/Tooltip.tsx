import { motion } from 'framer-motion';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  show: boolean;
}

export const Tooltip = ({ children, content, show }: TooltipProps) => {
  return (
    <div className="relative inline-block">
      {children}
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
        >
          <div className="glass-morphism px-2 py-1 rounded-lg shadow-lg">
            <span className="text-xs text-foreground font-medium whitespace-nowrap">
              {content}
            </span>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-glass-border" />
          </div>
        </motion.div>
      )}
    </div>
  );
};