import {
  FiSmartphone, FiMonitor, FiTablet, FiHeadphones, FiWatch, FiCpu,
  FiZap, FiTv, FiRepeat, FiPercent, FiTag
} from 'react-icons/fi';

// Thông tin cửa hàng — sửa tại đây
export const STORE = {
  name: 'SkyShop',
  hotline: '1800 1234',
  email: 'support@skyshop.vn',
  address: 'TP. Hồ Chí Minh',
  hours: '8:00 – 21:30 (cả tuần)'
};

export const FREE_SHIP_TEXT = 'Miễn phí vận chuyển toàn quốc';

export function formatVND(n) {
  return (Number(n) || 0).toLocaleString('vi-VN') + '₫';
}

export function formatDate(ms, withTime = true) {
  if (!ms) return '';
  const d = new Date(ms);
  return withTime ? d.toLocaleString('vi-VN') : d.toLocaleDateString('vi-VN');
}

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#e2e8f0"/></svg>');

// Ảnh lưu dạng base64 (không có tiền tố) -> tự nhận diện định dạng
export function imgSrc(b64) {
  if (!b64) return PLACEHOLDER;
  if (b64.startsWith('data:') || b64.startsWith('http')) return b64;
  let mime = 'image/jpeg';
  if (b64.startsWith('PHN2') || b64.startsWith('PD94')) mime = 'image/svg+xml';
  else if (b64.startsWith('iVBOR')) mime = 'image/png';
  else if (b64.startsWith('R0lG')) mime = 'image/gif';
  else if (b64.startsWith('UklG')) mime = 'image/webp';
  return 'data:' + mime + ';base64,' + b64;
}

export function isNewProduct(p) {
  return !!(p && p.cdate && Date.now() - p.cdate < 7 * 24 * 60 * 60 * 1000);
}

export const ORDER_STATUS = {
  PENDING: { label: 'Chờ duyệt', cls: 'pending' },
  APPROVED: { label: 'Đã duyệt', cls: 'approved' },
  CANCELED: { label: 'Đã huỷ', cls: 'canceled' }
};

export const PRICE_RANGES = [
  { key: 'u5', label: 'Dưới 5 triệu', min: null, max: 5000000 },
  { key: '5-15', label: '5 – 15 triệu', min: 5000000, max: 15000000 },
  { key: '15-25', label: '15 – 25 triệu', min: 15000000, max: 25000000 },
  { key: 'o25', label: 'Trên 25 triệu', min: 25000000, max: null }
];

export const SORTS = [
  { key: 'newest', label: 'Mới nhất' },
  { key: 'price_asc', label: 'Giá tăng dần' },
  { key: 'price_desc', label: 'Giá giảm dần' },
  { key: 'name', label: 'Tên A → Z' }
];

const ICONS = {
  iphone: FiSmartphone,
  macbook: FiMonitor,
  ipad: FiTablet,
  'tai nghe': FiHeadphones,
  'đồng hồ': FiWatch,
  pc: FiCpu,
  'phụ kiện': FiZap,
  tivi: FiTv,
  'thu cũ đổi mới': FiRepeat,
  'khuyến mãi': FiPercent
};

export function CategoryIcon({ name, ...rest }) {
  const Icon = ICONS[(name || '').toLowerCase().trim()] || FiTag;
  return <Icon {...rest} />;
}

export function authConfig(token) {
  return { headers: { 'x-access-token': token } };
}
