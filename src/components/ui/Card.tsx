import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import './Card.css'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode
  footer?: ReactNode
  children?: ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { header, footer, children, className = '', ...rest },
  ref,
) {
  const classes = ['card', className].filter(Boolean).join(' ')

  return (
    <div ref={ref} className={classes} {...rest}>
      {header != null && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer != null && <div className="card-footer">{footer}</div>}
    </div>
  )
})
