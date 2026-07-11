// ─── Date & Time ──────────────────────────────────────────────────
export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'year',   secs: 31536000 },
    { label: 'month',  secs: 2592000  },
    { label: 'week',   secs: 604800   },
    { label: 'day',    secs: 86400    },
    { label: 'hour',   secs: 3600     },
    { label: 'minute', secs: 60       },
  ];
  for (const { label, secs } of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

export const hoursUntil = (date) => {
  if (!date) return null;
  const hours = (new Date(date) - new Date()) / (1000 * 60 * 60);
  return Math.round(hours * 10) / 10;
};

// ─── Food & Donation ──────────────────────────────────────────────
export const FOOD_TYPE_LABELS = {
  cooked_meal:    '🍛 Cooked Meal',
  raw_vegetables: '🥦 Raw Vegetables',
  fruits:         '🍎 Fruits',
  packaged_food:  '📦 Packaged Food',
  dairy:          '🥛 Dairy',
  bakery:         '🥖 Bakery',
  beverages:      '🧃 Beverages',
  grains_pulses:  '🌾 Grains & Pulses',
  snacks:         '🍿 Snacks',
  other:          '🍽️ Other',
};

export const STORAGE_LABELS = {
  room_temp:    'Room Temperature',
  refrigerated: 'Refrigerated',
  frozen:       'Frozen',
};

export const PACKAGING_LABELS = {
  sealed:           'Sealed',
  partially_open:   'Partially Open',
  open:             'Open',
};

export const DONATION_STATUS_CONFIG = {
  available:  { label: 'Available',    badgeClass: 'badge-success' },
  claimed:    { label: 'Claimed',      badgeClass: 'badge-info'    },
  picked_up:  { label: 'Picked Up',   badgeClass: 'badge-warning' },
  delivered:  { label: 'Delivered',   badgeClass: 'badge-success' },
  expired:    { label: 'Expired',     badgeClass: 'badge-danger'  },
  cancelled:  { label: 'Cancelled',   badgeClass: 'badge-muted'   },
};

export const CLAIM_STATUS_CONFIG = {
  pending:    { label: 'Pending',     badgeClass: 'badge-warning' },
  approved:   { label: 'Approved',   badgeClass: 'badge-info'    },
  picked_up:  { label: 'Picked Up',  badgeClass: 'badge-info'    },
  delivered:  { label: 'Delivered',  badgeClass: 'badge-success' },
  cancelled:  { label: 'Cancelled',  badgeClass: 'badge-muted'   },
};

export const QUALITY_LABEL_CONFIG = {
  Fresh:      { color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
  Good:       { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
  Borderline: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  Unsafe:     { color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
};

// ─── Role ─────────────────────────────────────────────────────────
export const ROLE_CONFIG = {
  donor:     { label: 'Donor',     color: '#34d399', icon: '🤲' },
  ngo:       { label: 'NGO',       color: '#60a5fa', icon: '🏢' },
  volunteer: { label: 'Volunteer', color: '#fbbf24', icon: '🙋' },
  admin:     { label: 'Admin',     color: '#f87171', icon: '🛡️' },
};

// ─── Numbers ──────────────────────────────────────────────────────
export const formatNumber = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
};

// ─── Validation ───────────────────────────────────────────────────
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isStrongPassword = (pwd) => pwd.length >= 6;
