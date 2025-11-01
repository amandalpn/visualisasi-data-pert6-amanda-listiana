import { offset, shift, arrow } from '@floating-ui/react-dom'; 
import { useHover, useRole, useInteractions, useFloating } from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  type ReactNode,
  cloneElement,
  isValidElement,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

type TooltipProps = {
  label: ReactNode;
  children: ReactNode;
  className?: string;
};

export const Tooltip = ({ label, children, className }: TooltipProps) => {
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const { x, y, refs, strategy, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'top',
    middleware: [offset(12), shift({ padding: 8 }), arrow({ element: arrowRef })],
  });

  const hover = useHover(context, { move: false });
  const role = useRole(context, { role: 'tooltip' });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, role]);

  const reference = useMemo(() => {
    if (!isValidElement(children)) {
      throw new Error('Tooltip memerlukan elemen tunggal sebagai anak.');
    }
    return cloneElement(children, {
      ...getReferenceProps(children.props as any),
    });
  }, [children, getReferenceProps, refs.setReference]);

  return (
    <>
      {reference}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            ref={refs.setFloating}
            {...getFloatingProps({
              className: cn(
                'z-50 max-w-xs rounded-xl border border-white/20 bg-slate-900/90 px-3 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-xl',
                className,
              ),
              style: {
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
              },
            })}
          >
            {label}
            <div
              ref={arrowRef}
              className="absolute h-3 w-3 rotate-45 border border-white/20 bg-slate-900/90"
              style={{
                left: context.middlewareData.arrow?.x ?? 'calc(50% - 6px)',
                top: context.middlewareData.arrow?.y ?? 'auto',
                right: undefined,
                bottom: -6,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
