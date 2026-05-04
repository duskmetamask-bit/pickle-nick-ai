'use client';

import React from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

export function Input({
  label,
  error,
  helperText,
  iconLeft,
  iconRight,
  inputSize = 'md',
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  const wrapperClasses = [
    styles.wrapper,
    error ? styles.error : '',
    styles[inputSize],
    className,
  ].filter(Boolean).join(' ');

  const inputClasses = [
    styles.input,
    iconLeft ? styles.hasIconLeft : '',
    iconRight ? styles.hasIconRight : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
        <input id={inputId} className={inputClasses} {...props} />
        {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
      {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  const wrapperClasses = [
    styles.wrapper,
    error ? styles.error : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div classClassName={styles.inputWrapper}>
        <textarea
          id={inputId}
          className={`${styles.input} ${styles.textarea}`}
          {...props}
        />
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
      {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}

export default Input;
