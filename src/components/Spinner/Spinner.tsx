import React from 'react';
import './Spinner.scss';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Spinner({ size = 'md', className = '' }: Props) {
  return <span className={`spinner spinner--${size} ${className}`} aria-hidden="true" />;
}
