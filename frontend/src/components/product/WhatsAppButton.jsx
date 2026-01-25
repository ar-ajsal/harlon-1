import { FaWhatsapp } from 'react-icons/fa';
import { buildWhatsAppUrl } from '../../config/constants';
import './WhatsAppButton.css';

/**
 * WhatsApp Order Button Component
 * @param {Object} props
 * @param {Object} props.product - Product object with name, price
 * @param {string} props.selectedSize - Selected size (optional)
 * @param {boolean} props.disabled - Disable button
 * @param {string} props.className - Additional CSS classes
 */
export default function WhatsAppButton({
    product,
    selectedSize = '',
    disabled = false,
    className = '',
    fullWidth = true
}) {
    const handleClick = () => {
        if (disabled) return;

        const url = buildWhatsAppUrl({
            productName: product.name,
            size: selectedSize,
            price: product.price
        });

        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled || !product}
            className={`whatsapp-btn ${fullWidth ? 'full-width' : ''} ${className}`}
            aria-label="Buy on WhatsApp"
        >
            <FaWhatsapp size={24} />
            <span>Buy on WhatsApp</span>
        </button>
    );
}
