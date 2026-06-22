import React from 'react';

const inputClassName =
  'flex h-11 md:h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base md:text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-colors';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1 w-full text-left">
        <label className="text-sm font-medium leading-none text-foreground">{label}</label>
        <input
          ref={ref}
          className={`${inputClassName} ${className || ''}`}
          {...props}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const AmountInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ inputMode = 'decimal', step = 'any', autoComplete = 'off', ...props }, ref) => (
    <Input
      ref={ref}
      type="text"
      inputMode={inputMode}
      step={step}
      autoComplete={autoComplete}
      {...props}
    />
  )
);
AmountInput.displayName = 'AmountInput';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="space-y-1 w-full text-left">
        <label className="text-sm font-medium leading-none text-foreground">{label}</label>
        <select
          ref={ref}
          className={`${inputClassName} ${className || ''}`}
          {...props}
        >
          <option value="" disabled>Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1 w-full">
        <label className="text-sm font-medium leading-none text-foreground">{label}</label>
        <textarea
          ref={ref}
          className={`flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base md:text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-colors ${className || ''}`}
          {...props}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
