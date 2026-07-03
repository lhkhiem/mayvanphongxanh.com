export type ProductType = 'standard' | 'pre-packaged' | 'custom-build';

export interface PrePackagedVariant {
  id: string;
  name: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface CustomOptionChoice {
  id: string;
  name: string;
  priceModifier: number;
}

export interface CustomOptionGroup {
  name: string;
  choices: CustomOptionChoice[];
}

export interface Product {
  id: number;
  name: string;
  brand?: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  stock: number;
  description: string;
  includedItems?: string[];
  
  productType?: ProductType;
  attributes?: Record<string, string>;
  variants?: PrePackagedVariant[];
  basePrice?: number;
  customOptions?: CustomOptionGroup[];
}

// Mock product data
export const products: Product[] = [
  // Máy in (Printers)
  {
    id: 1,
    name: "Máy in màu InkJet Gia đình",
    brand: "HP",
    category: "Máy in",
    productType: "pre-packaged",
    price: 3500000,
    rating: 4.5,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eae6?w=500&h=500&fit=crop",
    stock: 45,
    description: "Máy in phun màu đa năng dành cho gia đình, tốc độ in nhanh, chất lượng bản in sắc nét.",
    includedItems: [
      "Bộ mực in chính hãng (đủ màu)",
      "Cáp kết nối USB",
      "Sách hướng dẫn & Đĩa Driver"
    ],
    attributes: { "Thương hiệu": "HP", "Loại máy": "Máy in phun màu" },
    variants: [
      {
        id: "inkjet-standard",
        name: "Bản Tiêu chuẩn",
        price: 3500000,
        originalPrice: 4200000,
        stock: 45,
        attributes: { "Mực đi kèm": "Mực tiêu chuẩn" }
      },
      {
        id: "inkjet-xl",
        name: "Bản Kèm Mực XL",
        price: 4500000,
        originalPrice: 5200000,
        stock: 20,
        attributes: { "Mực đi kèm": "Mực dung lượng cao XL" }
      }
    ]
  },
  {
    id: 2,
    name: "Máy in màu InkJet Gia đình",
    category: "Máy in",
    price: 3500000,
    originalPrice: 4200000,
    rating: 4.6,
    reviews: 145,
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&h=500&fit=crop",
    stock: 25,
    description: "Máy in phun màu sắc nét, thích hợp in ảnh và tài liệu."
  },
  {
    id: 3,
    name: "Máy in mã vạch (Label Printer)",
    category: "Máy in",
    price: 4500000,
    originalPrice: 5800000,
    rating: 4.8,
    reviews: 145,
    image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500&h=500&fit=crop",
    stock: 35,
    description: "Máy in nhãn nhiệt phục vụ vận chuyển và kiểm kho."
  },
  {
    id: 4,
    name: "Máy in Laser Đơn sắc Compact",
    category: "Máy in",
    price: 2200000,
    originalPrice: 2800000,
    rating: 4.7,
    reviews: 320,
    image: "https://images.unsplash.com/photo-1589311319760-496690ce1b88?w=500&h=500&fit=crop",
    stock: 40,
    description: "Máy in nhỏ gọn, tốc độ in nhanh cho văn phòng nhỏ."
  },
  {
    id: 5,
    name: "Máy in Khổ Lớn A3/A2",
    category: "Máy in",
    price: 35000000,
    originalPrice: 42000000,
    rating: 4.9,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1555529733-0e670560f7e1?w=500&h=500&fit=crop",
    stock: 5,
    description: "Thiết bị in bản vẽ kỹ thuật, đồ họa khổ lớn."
  },
  {
    id: 6,
    name: "Máy in hóa đơn nhiệt 80mm",
    category: "Máy in",
    price: 1800000,
    originalPrice: 2200000,
    rating: 4.8,
    reviews: 412,
    image: "https://images.unsplash.com/photo-1591522810850-58128c5fb089?w=500&h=500&fit=crop",
    stock: 80,
    description: "Máy in hóa đơn siêu tốc dành cho nhà hàng, siêu thị."
  },

  // Vật tư (Supplies)
  {
    id: 7,
    name: "Hộp mực in tương thích",
    category: "Vật tư",
    price: 1200000,
    originalPrice: 1800000,
    rating: 4.9,
    reviews: 512,
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop",
    stock: 250,
    description: "Hộp mực in dung lượng cao tương thích cho máy in văn phòng."
  },
  {
    id: 8,
    name: "Giấy in A4 (Thùng 10 ram)",
    category: "Vật tư",
    price: 850000,
    originalPrice: 1100000,
    rating: 4.7,
    reviews: 412,
    image: "https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=500&h=500&fit=crop",
    stock: 120,
    description: "Giấy in A4 trắng tinh khiết định lượng 80gsm, 10 ram mỗi thùng."
  },
  {
    id: 9,
    name: "Combo hộp mực in màu chính hãng",
    category: "Vật tư",
    price: 1950000,
    originalPrice: 2800000,
    rating: 4.6,
    reviews: 178,
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=500&fit=crop",
    stock: 89,
    description: "Combo hộp mực in màu CMYK chính hãng chất lượng cao."
  },
  {
    id: 10,
    name: "Cuộn giấy in hóa đơn nhiệt (100 cuộn)",
    category: "Vật tư",
    price: 650000,
    originalPrice: 850000,
    rating: 4.8,
    reviews: 320,
    image: "https://images.unsplash.com/photo-1621535497223-b67ea10f606d?w=500&h=500&fit=crop",
    stock: 150,
    description: "Giấy in nhiệt khổ 80mm chất lượng Nhật Bản."
  },
  {
    id: 11,
    name: "Bút bi văn phòng (Hộp 50 chiếc)",
    category: "Vật tư",
    price: 250000,
    rating: 4.7,
    reviews: 180,
    image: "https://images.unsplash.com/photo-1583485088034-697b5a624800?w=500&h=500&fit=crop",
    stock: 300,
    description: "Bút bi mực xanh 0.5mm nét mảnh, viết trơn."
  },
  {
    id: 12,
    name: "Bìa còng lưu trữ hồ sơ",
    category: "Vật tư",
    price: 45000,
    rating: 4.5,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1585435422896-e2e71c080eb2?w=500&h=500&fit=crop",
    stock: 500,
    description: "Bìa còng 7F nhựa xanh chắc chắn, bền đẹp."
  },

  // Hệ thống POS (POS Systems)
  {
    id: 13,
    name: "Hệ thống máy tính tiền POS cảm ứng",
    category: "Hệ thống POS",
    price: 28990000,
    originalPrice: 32500000,
    rating: 4.7,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop",
    stock: 8,
    description: "Hệ thống POS bán lẻ hoàn chỉnh với máy quét mã vạch và máy in hóa đơn."
  },
  {
    id: 14,
    name: "Ngăn kéo đựng tiền tự động",
    category: "Hệ thống POS",
    price: 950000,
    originalPrice: 1200000,
    rating: 4.8,
    reviews: 420,
    image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=500&h=500&fit=crop",
    stock: 65,
    description: "Ngăn kéo 5 hộc tiền giấy, kết nối trực tiếp máy in."
  },
  {
    id: 15,
    name: "Màn hình phụ hiển thị giá",
    category: "Hệ thống POS",
    price: 1500000,
    rating: 4.6,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=500&h=500&fit=crop",
    stock: 30,
    description: "Màn hình LED hiển thị giá tiền cho khách hàng."
  },
  {
    id: 16,
    name: "Máy POS quẹt thẻ cầm tay",
    category: "Hệ thống POS",
    price: 4500000,
    originalPrice: 5200000,
    rating: 4.9,
    reviews: 315,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=500&fit=crop",
    stock: 45,
    description: "Thanh toán mọi lúc mọi nơi qua Wifi/4G."
  },

  // Mạng viễn thông (Networking)
  {
    id: 17,
    name: "Bộ định tuyến mạng (Router Pro)",
    category: "Mạng viễn thông",
    price: 5500000,
    originalPrice: 7200000,
    rating: 4.6,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1563881803-37f591cbe0b3?w=500&h=500&fit=crop",
    stock: 42,
    description: "Bộ định tuyến không dây cấp doanh nghiệp dành cho mạng văn phòng."
  },
  {
    id: 18,
    name: "Switch Gigabit 24 port PoE",
    category: "Mạng viễn thông",
    price: 8500000,
    rating: 4.8,
    reviews: 120,
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&h=500&fit=crop",
    stock: 15,
    description: "Switch quản lý chuyên dụng có hỗ trợ cấp nguồn qua cổng mạng."
  },
  {
    id: 19,
    name: "Wifi Mesh Doanh nghiệp (Bộ 3 node)",
    category: "Mạng viễn thông",
    price: 12500000,
    originalPrice: 15000000,
    rating: 4.9,
    reviews: 230,
    image: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=500&h=500&fit=crop",
    stock: 22,
    description: "Phủ sóng Wifi diện rộng không điểm mù cho văn phòng lớn."
  },
  {
    id: 20,
    name: "Firewall Bảo mật mạng",
    category: "Mạng viễn thông",
    price: 25000000,
    rating: 4.7,
    reviews: 45,
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&h=500&fit=crop",
    stock: 8,
    description: "Tường lửa phần cứng bảo vệ an toàn dữ liệu công ty."
  },

  // Thiết bị (Equipment)
  {
    id: 21,
    name: "Máy hủy tài liệu",
    category: "Thiết bị",
    price: 7500000,
    originalPrice: 9900000,
    rating: 4.5,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1589939705066-5ec11cdc4fb2?w=500&h=500&fit=crop",
    stock: 12,
    description: "Máy hủy tài liệu công nghiệp công nghệ cắt chéo."
  },
  {
    id: 22,
    name: "Máy quét mã vạch 2D không dây",
    category: "Thiết bị",
    price: 3200000,
    originalPrice: 4500000,
    rating: 4.9,
    reviews: 267,
    image: "https://images.unsplash.com/photo-1574896369812-fd5986191042?w=500&h=500&fit=crop",
    stock: 58,
    description: "Máy quét mã vạch 2D không dây kèm đầu thu USB."
  },
  {
    id: 23,
    name: "Máy chấm công Vân tay & Khuôn mặt",
    category: "Thiết bị",
    price: 4800000,
    originalPrice: 5500000,
    rating: 4.8,
    reviews: 310,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=500&fit=crop",
    stock: 35,
    description: "Nhận diện khuôn mặt siêu tốc, chống vân tay giả."
  },
  {
    id: 24,
    name: "Máy chiếu Laser Phòng họp",
    category: "Thiết bị",
    price: 18500000,
    originalPrice: 22000000,
    rating: 4.7,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1533036814983-d9d306b3bc4f?w=500&h=500&fit=crop",
    stock: 10,
    description: "Độ sáng cao, hiển thị rõ nét ngay cả trong môi trường nhiều ánh sáng."
  },

  // Gói Dịch Vụ (Service Packages)
  {
    id: 25,
    name: "Trọn gói Nhà phố cơ bản 2 Tầng 3 Phòng ngủ",
    category: "Gói dịch vụ",
    price: 10866000,
    originalPrice: 15000000,
    rating: 5,
    reviews: 42,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=500&fit=crop",
    stock: 99,
    description: "Gói công trình lắp đặt nhà thông minh cơ bản. Cam kết sản phẩm chính hãng bảo hành 1 đổi 1 từ 6 đến 24 tháng.",
    includedItems: [
      "Đèn sân + phòng khách: 01 Công tắc Wifi 3 nút",
      "Đèn phòng ngủ 1 & 2: 02 Công tắc Wifi 2 nút",
      "Camera lắp trong nhà: 01 Icat Mini",
      "Điều hòa + TV phòng khách: 01 IR Smart Pro",
      "Cầu thang: 02 Cảm biến ST02",
      "Nhà vệ sinh: 02 Cảm biến hiện diện",
      "Cửa: 01 Bộ chuông cửa thông minh"
    ]
  },
  {
    id: 26,
    name: "Trọn gói Văn phòng An ninh - Chấm công",
    category: "Gói dịch vụ",
    price: 8500000,
    originalPrice: 10500000,
    rating: 4.8,
    reviews: 86,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=500&fit=crop",
    stock: 50,
    description: "Gói giải pháp an ninh toàn diện và quản lý nhân sự cho văn phòng dưới 50 nhân viên. Đã bao gồm công lắp đặt nội thành.",
    includedItems: [
      "Máy chấm công Khuôn mặt & Vân tay: 01 thiết bị cao cấp",
      "Camera an ninh: 03 Camera Dome góc rộng (Khu vực làm việc, Cửa ra vào)",
      "Đầu ghi hình 4 kênh: 01 Đầu ghi (Lưu trữ 30 ngày)",
      "Bộ kiểm soát cửa (Access Control): 01 Khóa từ thả chốt",
      "Phần mềm quản lý nhân sự: Giấy phép sử dụng 1 năm"
    ]
  },
  {
    id: 27,
    name: "Trọn gói Khai trương Quán Cafe / Nhà hàng",
    category: "Gói dịch vụ",
    price: 18500000,
    originalPrice: 22000000,
    rating: 4.9,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&h=500&fit=crop",
    stock: 20,
    description: "Bộ thiết bị cơ bản hoàn chỉnh nhất dành cho F&B (Nhà hàng, Quán Cafe). Đảm bảo vận hành mượt mà ngay ngày đầu khai trương.",
    includedItems: [
      "Hệ thống POS: 01 Máy POS cảm ứng 15 inch",
      "Máy in hóa đơn: 01 Máy in nhiệt 80mm",
      "Khu vực pha chế/bếp: 01 Máy in LAN",
      "Ngăn kéo đựng tiền: 01 Ngăn kéo tự động",
      "Hệ thống Wifi: 02 Router Mesh chuẩn AC",
      "Tặng kèm: 50 cuộn giấy in nhiệt + Miễn phí lắp đặt"
    ]
  },
  
  // Biến thể (Variants)
  {
    id: 28,
    name: "Laptop Dell Vostro 3510 (Pre-packaged)",
    brand: "Dell",
    category: "Thiết bị",
    productType: "pre-packaged",
    price: 13500000,
    rating: 4.8,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop",
    stock: 20,
    description: "Máy tính xách tay Dell Vostro 3510 dành cho doanh nghiệp và văn phòng.",
    attributes: { "Thương hiệu": "Dell", "Dòng máy": "Vostro" },
    variants: [
      {
        id: "v3510-i3-8",
        name: "Dell Vostro 3510 - Core i3 / 8GB / 256GB SSD",
        sku: "V3510-I3-8-256",
        price: 13500000,
        originalPrice: 15000000,
        stock: 12,
        attributes: { "CPU": "Core i3", "RAM": "8GB", "SSD": "256GB" }
      },
      {
        id: "v3510-i5-8",
        name: "Dell Vostro 3510 - Core i5 / 8GB / 512GB SSD",
        sku: "V3510-I5-8-512",
        price: 16500000,
        originalPrice: 18000000,
        stock: 8,
        attributes: { "CPU": "Core i5", "RAM": "8GB", "SSD": "512GB" }
      },
      {
        id: "v3510-i5-16",
        name: "Dell Vostro 3510 - Core i5 / 16GB / 512GB SSD",
        sku: "V3510-I5-16-512",
        price: 18500000,
        stock: 5,
        attributes: { "CPU": "Core i5", "RAM": "16GB", "SSD": "512GB" }
      }
    ]
  },
  {
    id: 29,
    name: "PC Văn Phòng OEM - Custom Build",
    brand: "Khác",
    category: "Thiết bị",
    productType: "custom-build",
    price: 5500000, // Hiển thị giá từ
    basePrice: 5500000,
    rating: 4.7,
    reviews: 120,
    image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500&h=500&fit=crop",
    stock: 50,
    description: "PC Lắp ráp chuyên dụng cho văn phòng, hỗ trợ tùy chọn cấu hình linh hoạt.",
    attributes: { "Loại SP": "PC Lắp ráp", "Vỏ Case": "Kính cường lực", "CPU": "Core i3", "RAM": "8GB", "SSD": "256GB" }, // Default attributes for filtering
    customOptions: [
      {
        name: "CPU (Vi xử lý)",
        choices: [
          { id: "cpu-i3", name: "Intel Core i3-12100", priceModifier: 0 },
          { id: "cpu-i5", name: "Intel Core i5-12400", priceModifier: 1500000 }
        ]
      },
      {
        name: "RAM (Bộ nhớ trong)",
        choices: [
          { id: "ram-8", name: "8GB DDR4 3200MHz", priceModifier: 0 },
          { id: "ram-16", name: "16GB DDR4 3200MHz", priceModifier: 600000 },
          { id: "ram-32", name: "32GB DDR4 3200MHz", priceModifier: 1500000 }
        ]
      },
      {
        name: "Ổ Cứng",
        choices: [
          { id: "ssd-256", name: "SSD 256GB NVMe", priceModifier: 0 },
          { id: "ssd-512", name: "SSD 512GB NVMe", priceModifier: 500000 }
        ]
      }
    ]
  }
];

export const categories = [
  { id: 1, name: "Máy in", icon: "🖨️", color: "#1b5e20" },
  { id: 2, name: "Vật tư", icon: "📦", color: "#43a047" },
  { id: 3, name: "Hệ thống POS", icon: "💳", color: "#7cb342" },
  { id: 4, name: "Mạng viễn thông", icon: "🌐", color: "#558b2f" },
  { id: 5, name: "Thiết bị", icon: "⚙️", color: "#2e7d32" },
  { id: 6, name: "Dịch vụ", icon: "🔧", color: "#1b5e20" },
  { id: 7, name: "Gói dịch vụ", icon: "🎁", color: "#ff8f00" },
];

export const testimonials = [
  {
    id: 1,
    name: "Lê Minh Tuấn",
    role: "Giám đốc CNTT, Tech Solutions Corp",
    content: "Thiết bị văn phòng của MVPX đã cải thiện hoàn toàn hệ thống của chúng tôi. Đội ngũ hỗ trợ vô cùng tuyệt vời.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  },
  {
    id: 2,
    name: "Trần Mai Hương",
    role: "Quản lý Vận hành, Global Retail",
    content: "Chúng tôi đã sử dụng hệ thống POS của họ được 2 năm. Không gặp vấn đề gì và dịch vụ khách hàng cực kỳ tốt!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
  },
  {
    id: 3,
    name: "Phạm Văn Nam",
    role: "Trưởng phòng Hành chính, Legal Associates",
    content: "Hợp đồng bảo trì giúp chúng tôi tiết kiệm hàng chục triệu mỗi năm. Chuyên nghiệp, nhanh chóng và đáng tin cậy.",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
  },
  {
    id: 4,
    name: "Nguyễn Thị Phương",
    role: "CEO, Business Solutions Inc",
    content: "Chất lượng sản phẩm xuất sắc với mức giá cạnh tranh. Máy Văn Phòng Xanh luôn là đối tác tin cậy của chúng tôi.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
  },
  {
    id: 5,
    name: "Hoàng Tùng",
    role: "Chủ chuỗi Cafe The Kof",
    content: "Nhờ có hệ thống máy tính tiền từ Máy Văn Phòng Xanh, chuỗi cửa hàng của tôi vận hành trơn tru hơn rất nhiều.",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop"
  },
  {
    id: 6,
    name: "Đặng Thu Thảo",
    role: "Trưởng phòng Kế toán, Vina Express",
    content: "Máy in laser và dịch vụ nạp mực ở đây là số 1. Giá tốt và nhân viên luôn có mặt trong vòng 2h.",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop"
  }
];

export const blogPosts = [
  {
    id: 1,
    title: "Tối ưu hóa hệ thống máy in văn phòng của bạn",
    excerpt: "Tìm hiểu cách cấu hình máy in văn phòng để đạt hiệu suất cao nhất và tiết kiệm chi phí tối đa.",
    date: "15/06/2024",
    category: "Thiết bị",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3af4abd8?w=400&h=300&fit=crop",
    slug: "toi-uu-hoa-may-in"
  },
  {
    id: 2,
    title: "Hệ thống POS mang lại thành công cho cửa hàng bán lẻ",
    excerpt: "Khám phá cách một hệ thống POS phù hợp có thể tối ưu vận hành và tăng doanh số cho doanh nghiệp bán lẻ.",
    date: "10/06/2024",
    category: "Kinh doanh",
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop",
    slug: "he-thong-pos-ban-le"
  },
  {
    id: 3,
    title: "Các phương pháp bảo mật mạng tối ưu",
    excerpt: "Bảo vệ doanh nghiệp của bạn bằng những mẹo bảo mật mạng thiết yếu và giải pháp mới nhất cho năm 2024.",
    date: "05/06/2024",
    category: "Công nghệ",
    image: "https://images.unsplash.com/photo-1563881803-37f591cbe0b3?w=400&h=300&fit=crop",
    slug: "huong-dan-bao-mat-mang"
  },
  {
    id: 4,
    title: "Cách xử lý kẹt giấy máy in nhanh chóng",
    excerpt: "Hướng dẫn từng bước khắc phục lỗi kẹt giấy cơ bản ở hầu hết các dòng máy in laser hiện nay.",
    date: "01/06/2024",
    category: "Thủ thuật",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=300&fit=crop",
    slug: "xu-ly-ket-giay-may-in"
  },
  {
    id: 5,
    title: "Mực in chính hãng vs Mực in tương thích: Chọn loại nào?",
    excerpt: "Phân tích ưu nhược điểm của hai loại mực in phổ biến để giúp bạn đưa ra lựa chọn sáng suốt.",
    date: "25/05/2024",
    category: "Vật tư",
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop",
    slug: "muc-in-chinh-hang-vs-tuong-thich"
  },
  {
    id: 6,
    title: "Xu hướng thanh toán không tiền mặt qua máy POS 2024",
    excerpt: "Công nghệ thanh toán đang thay đổi chóng mặt, cập nhật ngay các xu hướng mới nhất cho cửa hàng của bạn.",
    date: "18/05/2024",
    category: "Kinh doanh",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    slug: "xu-huong-thanh-toan-pos"
  },
  {
    id: 7,
    title: "Lắp đặt hệ thống Wifi Mesh cho văn phòng 100m2",
    excerpt: "Giải pháp mạng không dây tốc độ cao, độ trễ thấp và không điểm chết dành cho doanh nghiệp SME.",
    date: "10/05/2024",
    category: "Công nghệ",
    image: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&h=300&fit=crop",
    slug: "lap-dat-wifi-mesh-van-phong"
  },
  {
    id: 8,
    title: "Tầm quan trọng của Máy Hủy Tài Liệu",
    excerpt: "Bảo mật thông tin nội bộ và khách hàng là yếu tố sống còn. Đừng bỏ qua máy hủy tài liệu công nghiệp.",
    date: "02/05/2024",
    category: "Thiết bị",
    image: "https://images.unsplash.com/photo-1589939705066-5ec11cdc4fb2?w=400&h=300&fit=crop",
    slug: "tam-quan-trong-may-huy-tai-lieu"
  },
  {
    id: 9,
    title: "5 Mẫu máy chấm công vân tay đáng mua nhất",
    excerpt: "Đánh giá chi tiết top 5 dòng máy chấm công nhận diện khuôn mặt và vân tay ổn định nhất năm nay.",
    date: "25/04/2024",
    category: "Review",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    slug: "top-5-may-cham-cong"
  }
];

export const companyInfo = {
  name: "Giải pháp Máy Văn Phòng Xanh",
  tagline: "Thiết bị Văn phòng & Dịch vụ Kỹ thuật Chuyên nghiệp",
  description: "Thành lập từ năm 2010, Máy Văn Phòng Xanh là đối tác tin cậy của hàng nghìn doanh nghiệp cần thiết bị máy tính, mực in chính hãng và hỗ trợ kỹ thuật chuyên gia.",
  mission: "Trao quyền cho doanh nghiệp bằng các giải pháp thiết bị văn phòng chất lượng, dịch vụ tận tâm và giá cả cạnh tranh.",
  stats: [
    { label: "Máy in đã lắp đặt", value: "8.000+" },
    { label: "Khách hàng Doanh nghiệp", value: "2.500+" },
    { label: "Tỉnh thành phục vụ", value: "15+" },
    { label: "Năm kinh nghiệm", value: "14" },
  ]
};

export const projects = [
  {
    id: 1,
    title: "Hệ thống POS cho chuỗi Cafe 10 chi nhánh",
    client: "The Coffee House",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    category: "Hệ thống POS",
    description: "Triển khai đồng bộ phần mềm quản lý và máy tính tiền cảm ứng cho toàn bộ chuỗi."
  },
  {
    id: 2,
    title: "Mạng lưới Wifi Mesh Khách sạn 4 Sao",
    client: "Ocean View Resort",
    image: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600&h=400&fit=crop",
    category: "Mạng viễn thông",
    description: "Thiết lập hệ thống mạng không dây tốc độ cao phủ sóng toàn bộ khuôn viên 5000m2."
  },
  {
    id: 3,
    title: "Trang bị Máy in Đa chức năng Doanh nghiệp",
    client: "Techcombank",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=400&fit=crop",
    category: "Thiết bị Văn phòng",
    description: "Cung cấp và bảo trì 50 máy in laser công suất lớn cho trung tâm xử lý dữ liệu."
  }
];
