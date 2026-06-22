import React from 'react';
import { Calendar } from 'lucide-react';
import { formatDateDisplay } from '../lib/dates';

const inputClassName =
  'flex h-11 md:h-10 w-full rounded-xl border border-input/80 bg-background/80 px-3 py-2 text-base md:text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-md';

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    refs.forEach(ref => {
      if (typeof ref === 'function') ref(node);
      else if (ref && typeof ref === 'object') (ref as React.RefObject<T | null>).current = node;
    });
  };
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="space-y-1 w-full text-left">
        <label htmlFor={inputId} className="text-sm font-medium leading-none text-foreground">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
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

export const DateInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, onChange, onBlur, name, disabled, min, max, value, defaultValue, ...rest }, ref) => {
    const inputId = id ?? name;
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [display, setDisplay] = React.useState(() =>
      formatDateDisplay(
        value !== undefined ? String(value) : defaultValue !== undefined ? String(defaultValue) : ''
      )
    );

    React.useEffect(() => {
      if (value !== undefined) {
        setDisplay(formatDateDisplay(String(value)));
      }
    }, [value]);

    React.useLayoutEffect(() => {
      const el = inputRef.current;
      if (el?.value) {
        setDisplay(formatDateDisplay(el.value));
      }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDisplay(formatDateDisplay(e.target.value));
      onChange?.(e);
    };

    const valueProps =
      value !== undefined
        ? { value: String(value) }
        : defaultValue !== undefined
          ? { defaultValue: String(defaultValue) }
          : {};

    return (
      <div className="space-y-1 w-full text-left">
        <label htmlFor={inputId} className="text-sm font-medium leading-none text-foreground">
          {label}
        </label>
        <div className="relative h-11 md:h-10 w-full">
          <div
            aria-hidden
            className={`${inputClassName} date-input-display pointer-events-none absolute inset-0 pl-10 ${
              display ? 'text-foreground' : 'text-muted-foreground'
            } ${disabled ? 'opacity-60' : ''} ${className || ''}`}
          >
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <span className="truncate">{display || 'DD/MM/YYYY'}</span>
          </div>
          <input
            ref={mergeRefs(ref, inputRef)}
            type="date"
            id={inputId}
            name={name}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled}
            min={min}
            max={max}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            {...valueProps}
            {...rest}
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
DateInput.displayName = 'DateInput';

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
          <option value="" disabled hidden>
            Choose…
          </option>
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
