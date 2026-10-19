// Dữ liệu mẫu dùng chung cho: seed MongoDB và chế độ dự phòng (bộ nhớ trong)
// File này KHÔNG phụ thuộc mongoose để có thể dùng ở mọi nơi.

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const SAMPLE_ADMIN = { username: 'admin', password: 'admin123' };

const SAMPLE_CUSTOMER = {
  username: 'demo',
  password: 'demo123',
  name: 'Demo Customer',
  phone: '0900000001',
  email: 'demo@skyshop.local',
  active: 1
};

const SAMPLE_CATEGORIES = [
  'iPhone', 'Macbook', 'iPad', 'Tai nghe', 'Đồng hồ',
  'PC', 'Phụ kiện', 'Tivi', 'Thu cũ đổi mới', 'Khuyến mãi'
];

// ---------- ảnh minh hoạ SVG cho sản phẩm mẫu ----------
const SHAPES = {
  phone: `
    <rect x="150" y="70" width="100" height="200" rx="18" fill="#0f172a"/>
    <rect x="157" y="77" width="86" height="186" rx="13" fill="url(#scr)"/>
    <rect x="183" y="84" width="34" height="9" rx="4.5" fill="#0f172a"/>`,
  laptop: `
    <rect x="95" y="95" width="210" height="135" rx="10" fill="#1e293b"/>
    <rect x="103" y="103" width="194" height="119" rx="5" fill="url(#scr)"/>
    <path d="M70 232 h260 l-14 18 h-232 z" fill="#cbd5e1"/>
    <rect x="178" y="232" width="44" height="6" rx="3" fill="#94a3b8"/>`,
  tablet: `
    <rect x="125" y="65" width="150" height="210" rx="16" fill="#1e293b"/>
    <rect x="134" y="74" width="132" height="192" rx="9" fill="url(#scr)"/>`,
  headphones: `
    <path d="M120 200 v-40 a80 80 0 0 1 160 0 v40" fill="none" stroke="#0f172a" stroke-width="16" stroke-linecap="round"/>
    <rect x="100" y="185" width="50" height="80" rx="20" fill="#0f172a"/>
    <rect x="250" y="185" width="50" height="80" rx="20" fill="#0f172a"/>
    <rect x="110" y="195" width="30" height="60" rx="13" fill="url(#scr)"/>
    <rect x="260" y="195" width="30" height="60" rx="13" fill="url(#scr)"/>`,
  watch: `
    <rect x="170" y="60" width="60" height="60" rx="10" fill="#334155"/>
    <rect x="170" y="220" width="60" height="60" rx="10" fill="#334155"/>
    <rect x="145" y="105" width="110" height="130" rx="30" fill="#0f172a"/>
    <rect x="155" y="115" width="90" height="110" rx="22" fill="url(#scr)"/>
    <rect x="255" y="150" width="8" height="26" rx="4" fill="#475569"/>`,
  desktop: `
    <rect x="85" y="80" width="170" height="115" rx="8" fill="#1e293b"/>
    <rect x="92" y="87" width="156" height="101" rx="4" fill="url(#scr)"/>
    <rect x="155" y="195" width="30" height="35" fill="#475569"/>
    <rect x="125" y="228" width="90" height="10" rx="5" fill="#475569"/>
    <rect x="270" y="95" width="60" height="150" rx="8" fill="#0f172a"/>
    <circle cx="300" cy="125" r="10" fill="url(#scr)"/>
    <rect x="282" y="150" width="36" height="5" rx="2.5" fill="#334155"/>
    <rect x="282" y="162" width="36" height="5" rx="2.5" fill="#334155"/>`,
  hub: `
    <rect x="110" y="140" width="180" height="60" rx="18" fill="#1e293b"/>
    <rect x="128" y="160" width="22" height="12" rx="3" fill="url(#scr)"/>
    <rect x="160" y="160" width="22" height="12" rx="3" fill="url(#scr)"/>
    <rect x="192" y="160" width="22" height="12" rx="3" fill="url(#scr)"/>
    <rect x="224" y="160" width="12" height="12" rx="3" fill="url(#scr)"/>
    <rect x="246" y="160" width="26" height="12" rx="3" fill="url(#scr)"/>
    <path d="M110 170 h-30 q-20 0 -20 30 v30" fill="none" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>`,
  tv: `
    <rect x="60" y="80" width="280" height="165" rx="10" fill="#0f172a"/>
    <rect x="68" y="88" width="264" height="149" rx="5" fill="url(#scr)"/>
    <path d="M150 245 l-20 30 M250 245 l20 30" stroke="#334155" stroke-width="8" stroke-linecap="round"/>`,
  trade: `
    <rect x="95" y="90" width="80" height="160" rx="14" fill="#475569"/>
    <rect x="101" y="96" width="68" height="148" rx="10" fill="#94a3b8"/>
    <rect x="225" y="90" width="80" height="160" rx="14" fill="#0f172a"/>
    <rect x="231" y="96" width="68" height="148" rx="10" fill="url(#scr)"/>
    <path d="M185 150 h30 l-10 -10 M215 190 h-30 l10 10" fill="none" stroke="#0f172a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
  gift: `
    <rect x="115" y="150" width="170" height="115" rx="10" fill="#0f172a"/>
    <rect x="105" y="120" width="190" height="40" rx="8" fill="#1e293b"/>
    <rect x="190" y="120" width="20" height="145" fill="url(#scr)"/>
    <path d="M200 120 c-20 -40 -60 -30 -45 -5 c8 12 30 5 45 5 c15 0 37 7 45 -5 c15 -25 -25 -35 -45 5z" fill="url(#scr)"/>`
};

function productSvg(shape, c1, c2) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 340">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <linearGradient id="scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0f2fe"/><stop offset=".55" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
  </defs>
  <rect width="400" height="340" fill="url(#bg)" opacity=".28"/>
  <ellipse cx="200" cy="292" rx="130" ry="12" fill="#0f172a" opacity=".12"/>
  ${SHAPES[shape] || SHAPES.gift}
</svg>`;
  return Buffer.from(svg).toString('base64');
}

const SAMPLE_PRODUCTS = [
  { name: 'iPhone 15 Pro Max', price: 32990000, categoryName: 'iPhone', shape: 'phone', colors: ['#38bdf8', '#6366f1'], daysAgo: 1,
    description: 'Khung titan nhẹ và bền, chip A17 Pro mạnh mẽ, camera 48MP với zoom quang học 5x, cổng USB‑C tốc độ cao.' },
  { name: 'Macbook Air M3', price: 28990000, categoryName: 'Macbook', shape: 'laptop', colors: ['#a5b4fc', '#0ea5e9'], daysAgo: 2,
    description: 'Thiết kế mỏng nhẹ, chip Apple M3, màn hình Liquid Retina 13.6 inch, pin dùng cả ngày tới 18 giờ.' },
  { name: 'iPad Air 6', price: 17990000, categoryName: 'iPad', shape: 'tablet', colors: ['#f0abfc', '#818cf8'], daysAgo: 3,
    description: 'Chip M2, màn hình 11 inch sắc nét, hỗ trợ Apple Pencil Pro và Magic Keyboard — học tập và sáng tạo mọi lúc.' },
  { name: 'AirPods Pro 2', price: 5990000, categoryName: 'Tai nghe', shape: 'headphones', colors: ['#5eead4', '#0ea5e9'], daysAgo: 4,
    description: 'Chống ồn chủ động gấp đôi, âm thanh không gian cá nhân hoá, hộp sạc USB‑C có loa định vị.' },
  { name: 'Apple Watch Series 9', price: 9990000, categoryName: 'Đồng hồ', shape: 'watch', colors: ['#fda4af', '#f97316'], daysAgo: 5,
    description: 'Chip S9, thao tác chạm hai lần, màn hình sáng tới 2000 nit, theo dõi sức khoẻ và luyện tập toàn diện.' },
  { name: 'Gaming PC RTX 4070', price: 35990000, categoryName: 'PC', shape: 'desktop', colors: ['#86efac', '#14b8a6'], daysAgo: 6,
    description: 'Cấu hình chiến game 2K mượt mà: Intel Core i7, RTX 4070 12GB, RAM 32GB DDR5, SSD 1TB NVMe.' },
  { name: 'USB-C Hub 8 in 1', price: 1290000, categoryName: 'Phụ kiện', shape: 'hub', colors: ['#fde68a', '#f59e0b'], daysAgo: 7,
    description: 'Mở rộng 8 cổng: HDMI 4K, USB‑A 3.0, đọc thẻ SD/microSD, LAN gigabit và sạc PD 100W.' },
  { name: 'Samsung Smart TV 55 inch', price: 14990000, categoryName: 'Tivi', shape: 'tv', colors: ['#93c5fd', '#a855f7'], daysAgo: 8,
    description: 'Độ phân giải 4K UHD, màu sắc sống động, hệ điều hành Tizen với kho ứng dụng giải trí phong phú.' },
  { name: 'Thu cu doi moi iPhone 13', price: 13990000, categoryName: 'Thu cũ đổi mới', shape: 'trade', colors: ['#c4b5fd', '#22d3ee'], daysAgo: 9,
    description: 'Lên đời iPhone dễ dàng: định giá máy cũ minh bạch, trợ giá thu cũ và trả góp 0%.' },
  { name: 'Combo khuyen mai Apple', price: 21990000, categoryName: 'Khuyến mãi', shape: 'gift', colors: ['#fca5a5', '#ec4899'], daysAgo: 10,
    description: 'Combo tiết kiệm gồm iPad và AirPods kèm quà tặng phụ kiện — số lượng có hạn.' }
];

SAMPLE_PRODUCTS.forEach((p) => {
  p.image = productSvg(p.shape, p.colors[0], p.colors[1]);
});

const SAMPLE_ORDERS = [
  { status: 'APPROVED', daysAgo: 1, items: [
    { productName: 'iPhone 15 Pro Max', quantity: 1 },
    { productName: 'AirPods Pro 2', quantity: 2 },
    { productName: 'USB-C Hub 8 in 1', quantity: 1 }
  ] },
  { status: 'PENDING', daysAgo: 0, items: [
    { productName: 'Macbook Air M3', quantity: 1 },
    { productName: 'Apple Watch Series 9', quantity: 1 }
  ] }
];

module.exports = {
  DAY_IN_MS, SAMPLE_ADMIN, SAMPLE_CUSTOMER, SAMPLE_CATEGORIES, SAMPLE_PRODUCTS, SAMPLE_ORDERS, productSvg
};
