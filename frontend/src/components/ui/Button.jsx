/**
 * Button — reusable CTA component
 * Variants: primary | secondary | ghost | whatsapp
 * Sizes: md (default) | sm
 */
import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    onClick,
    type = 'button',
    href,
    target,
    rel,
    className = '',
    ...props
}) => {
    const classes = [
        'btn',
        variant === 'primary' && 'btn-primary',
        variant === 'secondary' && 'btn-secondary',
        variant === 'ghost' && 'btn-ghost',
        variant === 'whatsapp' && 'btn-whatsapp',
        size === 'sm' && 'btn-sm',
        fullWidth && 'btn-full',
        loading && 'loading',
        className,
    ].filter(Boolean).join(' ');

    if (href) {
        return (
            <a
                href={href}
                target={target}
                rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
                className={classes}
                {...props}
            >
                {children}
            </a>
        );
    }

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            aria-busy={loading}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
