import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string; size?: number; color?: string; style?: React.CSSProperties }>;
  iconColor?: string;
  disabled?: boolean;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  buttonIcon?: React.ComponentType<{ className?: string; size?: number; color?: string; style?: React.CSSProperties }>;
  buttonIconColor?: string;
}

export default function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  disabled = false,
  buttonIcon,
  buttonIconColor,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionIdPrefix = useId();

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const [focusedOptionIndex, setFocusedOptionIndex] = useState(-1);
  const hasIcons = options.some(opt => opt.icon);

  // Focus management when opening
  useEffect(() => {
    if (isOpen) {
      const activeIdx = options.findIndex((opt) => opt.value === value);
      setFocusedOptionIndex(activeIdx >= 0 ? activeIdx : 0);
    }
  }, [isOpen, value, options]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedOptionIndex >= 0 && focusedOptionIndex < options.length) {
          handleSelect(options[focusedOptionIndex].value);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        let nextIndex = focusedOptionIndex;
        do {
          nextIndex = nextIndex < options.length - 1 ? nextIndex + 1 : nextIndex;
        } while (nextIndex < options.length && options[nextIndex].disabled && nextIndex !== focusedOptionIndex);
        setFocusedOptionIndex(nextIndex);
        break;
      case 'ArrowUp':
        e.preventDefault();
        let prevIndex = focusedOptionIndex;
        do {
          prevIndex = prevIndex > 0 ? prevIndex - 1 : prevIndex;
        } while (prevIndex >= 0 && options[prevIndex].disabled && prevIndex !== focusedOptionIndex);
        setFocusedOptionIndex(prevIndex);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedOptionIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedOptionIndex(options.length - 1);
        break;
      default:
        // Basic typeahead (single letter)
        if (e.key.length === 1 && e.key.match(/[a-z0-9]/i)) {
          const char = e.key.toLowerCase();
          const matchIdx = options.findIndex(
            (opt, idx) => idx > focusedOptionIndex && opt.label.toLowerCase().startsWith(char)
          );
          if (matchIdx !== -1) {
            setFocusedOptionIndex(matchIdx);
          } else {
            // wrap around
            const wrapIdx = options.findIndex((opt) => opt.label.toLowerCase().startsWith(char));
            if (wrapIdx !== -1) setFocusedOptionIndex(wrapIdx);
          }
        }
        break;
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-activedescendant={isOpen && focusedOptionIndex >= 0 ? `${optionIdPrefix}-opt-${focusedOptionIndex}` : undefined}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className="w-full px-3 py-2.5 text-sm font-semibold transition-all appearance-none cursor-pointer outline-none flex items-center justify-between touch-target rounded-xl text-left"
        style={{
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border-default)',
          color: 'var(--heading-color)',
          boxShadow: isOpen ? '0 0 0 3px rgba(99, 102, 241, 0.08)' : 'none',
        }}
      >
        <div className="truncate flex-1 text-center flex items-center justify-center gap-3">
          {buttonIcon && (
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              {React.createElement(buttonIcon, {
                className: "w-4 h-4",
                color: buttonIconColor,
                style: { color: buttonIconColor || 'var(--icon-color)' }
              })}
            </div>
          )}
          {selectedOption?.icon && !buttonIcon && (
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              {React.createElement(selectedOption.icon, {
                className: "w-4 h-4",
                color: selectedOption.iconColor,
                style: { color: selectedOption.iconColor || 'var(--icon-color)' }
              })}
            </div>
          )}
          <span className="truncate">{displayLabel}</span>
        </div>
        <ChevronDown
          size={18}
          className={`ml-3 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--icon-color)' }}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 top-full mt-2 z-[9999] w-full rounded-xl"
          style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border-default)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',
            maxHeight: '270px',
            overflowY: 'auto',
          }}
        >
          <div className="p-1">
            {options.map((option, index) => {
              const isFocused = index === focusedOptionIndex;
              const isSelected = option.value === value;
              const isDisabled = option.disabled || false;
              return (
                <div
                  key={option.value}
                  id={`${optionIdPrefix}-opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={isDisabled}
                  onClick={() => !isDisabled && handleSelect(option.value)}
                  onMouseEnter={() => !isDisabled && setFocusedOptionIndex(index)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-left text-sm rounded-lg transition-all touch-target"
                  style={{
                    color: isDisabled ? 'var(--app-muted)' : isSelected ? 'var(--button-primary)' : 'var(--body-text)',
                    fontWeight: isSelected ? 600 : 500,
                    background: isFocused && !isDisabled ? 'var(--surface-subtle)' : isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                    marginTop: index > 0 ? '1px' : '0',
                    outline: isFocused && !isDisabled ? '2px solid var(--button-primary)' : 'none',
                    outlineOffset: '-2px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1
                  }}
                >
                  <div className="flex-1 flex items-center justify-center gap-3 min-w-0">
                    {option.icon ? (
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <option.icon 
                          className="w-4 h-4" 
                          color={option.iconColor}
                          style={{ color: option.iconColor || (isSelected ? 'var(--button-primary)' : 'var(--icon-color)') }} 
                        />
                      </div>
                    ) : hasIcons ? (
                      <div className="w-5 h-5 shrink-0"></div>
                    ) : null}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && (
                    <Check 
                      size={18} 
                      className="shrink-0 ml-2" 
                      style={{ color: 'var(--button-primary)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
