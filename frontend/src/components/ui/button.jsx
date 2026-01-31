import React from 'react';

export const Button = React.forwardRef(({ className = '', ...props }, ref) => (
  <button
    ref={ref}
    className={`px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 ${className}`}
    {...props}
  />
));

Button.displayName = 'Button';
