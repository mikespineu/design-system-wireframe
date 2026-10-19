import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const Button = ({ variant = 'primary', className, type = 'button', ...rest }: ButtonProps) => (
  <button
    type={type}
    className={['ds-button', `ds-button--${variant}`, className].filter(Boolean).join(' ')}
    {...rest}
  />
);
