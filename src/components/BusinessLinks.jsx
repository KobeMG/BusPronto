import { MapPin, ShoppingBag, MessageCircle } from 'lucide-react';
import { trackAdClick } from '../utils/adUtils';

const BusinessLinks = ({ ad, styles, containerClassName }) => {
  const links = [
    ad.whatsapp && {
      href: `https://wa.me/${ad.whatsapp.replace(/\D/g, '')}`,
      Icon: MessageCircle,
      label: 'WhatsApp',
      className: styles.whatsapp,
    },
    ad.uber_eats && {
      href: ad.uber_eats,
      Icon: ShoppingBag,
      label: 'Uber Eats',
      className: styles.uberEats,
    },
    ad.google_maps && {
      href: ad.google_maps,
      Icon: MapPin,
      label: 'Maps',
      className: styles.googleMaps,
    },
  ].filter(Boolean);

  if (links.length === 0) return null;

  return (
    <div className={containerClassName}>
      {links.map(({ href, Icon, label, className }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.businessLink} ${className}`}
          onClick={(e) => {
            e.stopPropagation();
            trackAdClick(ad.id);
          }}
        >
          <Icon size={14} />
          <span>{label}</span>
        </a>
      ))}
    </div>
  );
};

export default BusinessLinks;
