import { forwardRef, type ButtonHTMLAttributes } from 'react'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'domain'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className = '', children, ...rest },
  ref,
) {
  const sizeClass = size !== 'md' ? `btn-${size}` : ''
  const classes = ['btn', `btn-${variant}`, sizeClass, className].filter(Boolean).join(' ')

  return (
    <button ref={ref} className={classes} {...rest}>
      {children}
    </button>
  )
})
