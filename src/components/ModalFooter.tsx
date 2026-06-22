import { cn } from '../lib/utils';

interface ModalFooterProps {
  onCancel: () => void;
  submitLabel: string;
  cancelLabel?: string;
  formId?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'destructive';
  className?: string;
}

export function ModalFooter({
  onCancel,
  submitLabel,
  cancelLabel = 'Cancel',
  formId,
  isSubmitting = false,
  disabled = false,
  variant = 'primary',
  className,
}: ModalFooterProps) {
  const submitClass =
    variant === 'destructive' ? 'btn-modal-destructive' : 'btn-modal-primary';

  return (
    <div className={cn('modal-footer-actions', className)}>
      <button type="button" onClick={onCancel} className="btn-modal-secondary">
        {cancelLabel}
      </button>
      <button
        type="submit"
        form={formId}
        disabled={disabled || isSubmitting}
        className={submitClass}
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </div>
  );
}
