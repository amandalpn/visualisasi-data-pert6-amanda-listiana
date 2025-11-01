import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
};

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

type DialogProps = {
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const Dialog = ({ children, defaultOpen = false, open: openProp, onOpenChange }: DialogProps) => {
  const [stateOpen, setStateOpen] = useState(defaultOpen);
  const open = openProp ?? stateOpen;
  const titleId = useId();
  const descriptionId = useId();

  const setOpen = useCallback(
    (value: boolean) => {
      if (openProp === undefined) {
        setStateOpen(value);
      }
      onOpenChange?.(value);
    },
    [openProp, onOpenChange],
  );

  const value = useMemo(
    () => ({
      open,
      setOpen,
      titleId,
      descriptionId,
    }),
    [open, setOpen, titleId, descriptionId],
  );

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
};

export const DialogTrigger = ({ children }: { children: ReactNode }) => {
  const ctx = useDialogContext();
  if (!children || typeof children !== 'object') {
    throw new Error('DialogTrigger membutuhkan elemen React.');
  }
  return (
    <span
      onClick={() => ctx.setOpen(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          ctx.setOpen(true);
        }
      }}
    >
      {children}
    </span>
  );
};

type DialogContentProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export const DialogContent = ({ title, description, children, className }: DialogContentProps) => {
  const ctx = useDialogContext();

  return (
    <AnimatePresence>
      {ctx.open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={ctx.titleId}
          aria-describedby={description ? ctx.descriptionId : undefined}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => ctx.setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'relative z-[101] w-full max-w-2xl rounded-3xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/90',
              className,
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={ctx.titleId} className="text-xl font-semibold text-slate-900 dark:text-white">
                  {title}
                </h2>
                {description && (
                  <p id={ctx.descriptionId} className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => ctx.setOpen(false)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:hover:bg-white/10"
                aria-label="Tutup dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const DialogClose = ({ children }: { children: ReactNode }) => {
  const ctx = useDialogContext();

  if (!children || typeof children !== 'object') {
    throw new Error('DialogClose membutuhkan elemen React.');
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => ctx.setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          ctx.setOpen(false);
        }
      }}
    >
      {children}
    </span>
  );
};

const useDialogContext = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('Gunakan komponen dialog di dalam <Dialog>.');
  return ctx;
};
