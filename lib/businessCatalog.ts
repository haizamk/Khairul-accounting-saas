export interface BusinessUnit {
  id: number;
  name: string;
  shortCode: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface BusinessProduct {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  businessId: string;
  categoryId: number;
  categoryName: string;
  unitId: number;
  unitCode: string;
  costPrice: number;
  price: number;
  stock: number;
  minStock: number;
  status: string;
}

export interface BusinessVertical {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  badgeColor: string;
  description: string;
  categories: string[];
  defaultUnits: Array<{
    name: string;
    shortCode: string;
    description: string;
    isDefault: boolean;
  }>;
  products: BusinessProduct[];
}

export const BUSINESS_VERTICALS: BusinessVertical[] = [
  // 1. RETAIL STORES
  {
    id: 'retail',
    name: 'Kedai Runcit & Butik Pakaian (Retail Stores)',
    shortName: 'Retail Stores',
    icon: '🛍️',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    description: 'Pakaian, kasut, aksesori, gajet & barangan am. Menyokong variasi saiz, warna & pengimbas kod bar.',
    categories: ['Pakaian & Butik', 'Kasut & Beg', 'Gajet & Elektronik', 'Aksesori & Hadiah'],
    defaultUnits: [
      { name: 'Helai / Pieces', shortCode: 'PCS', description: 'Kiraan pakaian & baju', isDefault: true },
      { name: 'Pasang / Pair', shortCode: 'PSG', description: 'Kasut & stokin', isDefault: false },
      { name: 'Set Lengkap', shortCode: 'SET', description: 'Set pakaian & suit', isDefault: false },
      { name: 'Kotak / Box', shortCode: 'BOX', description: 'Kotak pembungkusan produk', isDefault: false },
    ],
    products: [
      {
        id: 201,
        name: 'T-Shirt Cotton Combed 24s Premium (Black)',
        sku: 'RTL-TSH-01',
        barcode: '95560010001',
        businessId: 'retail',
        categoryId: 11,
        categoryName: 'Pakaian & Butik',
        unitId: 21,
        unitCode: 'PCS',
        costPrice: 15.00,
        price: 39.90,
        stock: 45,
        minStock: 10,
        status: 'active'
      },
      {
        id: 202,
        name: 'Seluar Jeans Slim Fit Stretch Denim',
        sku: 'RTL-JNS-02',
        barcode: '95560010002',
        businessId: 'retail',
        categoryId: 11,
        categoryName: 'Pakaian & Butik',
        unitId: 21,
        unitCode: 'PCS',
        costPrice: 38.00,
        price: 89.00,
        stock: 22,
        minStock: 5,
        status: 'active'
      },
      {
        id: 203,
        name: 'Baju Kurung Moden Sulam Lace',
        sku: 'RTL-KRG-03',
        barcode: '95560010003',
        businessId: 'retail',
        categoryId: 11,
        categoryName: 'Pakaian & Butik',
        unitId: 23,
        unitCode: 'SET',
        costPrice: 65.00,
        price: 149.00,
        stock: 14,
        minStock: 4,
        status: 'active'
      },
      {
        id: 204,
        name: 'Kasut Sneakers Kasual Kanvas Unisex',
        sku: 'RTL-SNK-04',
        barcode: '95560010004',
        businessId: 'retail',
        categoryId: 12,
        categoryName: 'Kasut & Beg',
        unitId: 22,
        unitCode: 'PSG',
        costPrice: 32.00,
        price: 79.00,
        stock: 18,
        minStock: 5,
        status: 'active'
      },
      {
        id: 205,
        name: 'Beg Galas Laptop Kalis Air 15.6"',
        sku: 'RTL-BAG-05',
        barcode: '95560010005',
        businessId: 'retail',
        categoryId: 12,
        categoryName: 'Kasut & Beg',
        unitId: 21,
        unitCode: 'PCS',
        costPrice: 28.00,
        price: 65.00,
        stock: 12,
        minStock: 3,
        status: 'active'
      },
      {
        id: 206,
        name: 'Kabel Fast Charging USB-C to Type-C 65W',
        sku: 'RTL-CBL-06',
        barcode: '95560010006',
        businessId: 'retail',
        categoryId: 13,
        categoryName: 'Gajet & Elektronik',
        unitId: 21,
        unitCode: 'PCS',
        costPrice: 6.50,
        price: 25.00,
        stock: 35,
        minStock: 10,
        status: 'active'
      },
      {
        id: 207,
        name: 'Powerbank Wireless Fast Charge 10,000mAh',
        sku: 'RTL-PBK-07',
        barcode: '95560010007',
        businessId: 'retail',
        categoryId: 13,
        categoryName: 'Gajet & Elektronik',
        unitId: 21,
        unitCode: 'PCS',
        costPrice: 35.00,
        price: 75.00,
        stock: 8,
        minStock: 10,
        status: 'active'
      },
      {
        id: 208,
        name: 'Payung Lipat UV Auto Open/Close',
        sku: 'RTL-UMB-08',
        barcode: '95560010008',
        businessId: 'retail',
        categoryId: 14,
        categoryName: 'Aksesori & Hadiah',
        unitId: 21,
        unitCode: 'PCS',
        costPrice: 8.50,
        price: 22.00,
        stock: 25,
        minStock: 5,
        status: 'active'
      }
    ]
  },

  // 2. RESTAURANTS
  {
    id: 'restaurant',
    name: 'Restoran & Makanan Segera (Restaurants)',
    shortName: 'Restaurants',
    icon: '🍽️',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    description: 'Restoran masakan panas, tomyam, nasi ayam & western. Integrasi Meja Open Tickets & Skrin Dapur (KDS).',
    categories: ['Hidangan Utama', 'Western & Grill', 'Seafood & Bakar', 'Minuman & Pencuci Mulut'],
    defaultUnits: [
      { name: 'Set Hidangan', shortCode: 'SET', description: 'Set makanan lengkap', isDefault: true },
      { name: 'Pinggan / Mangkuk', shortCode: 'PGN', description: 'Kiraan hidangan', isDefault: false },
      { name: 'Gelas / Cawan', shortCode: 'GLS', description: 'Minuman sejuk/panas', isDefault: false },
      { name: 'Ekor / Porsi', shortCode: 'EKOR', description: 'Ikan / lauk segar', isDefault: false },
    ],
    products: [
      {
        id: 301,
        name: 'Nasi Lemak Ayam Goreng Berempah Crispy',
        sku: 'RES-NLM-01',
        barcode: '95560020001',
        businessId: 'restaurant',
        categoryId: 21,
        categoryName: 'Hidangan Utama',
        unitId: 31,
        unitCode: 'SET',
        costPrice: 4.80,
        price: 12.90,
        stock: 80,
        minStock: 15,
        status: 'active'
      },
      {
        id: 302,
        name: 'Set Nasi Ayam Penyet Sambal Gesek Kaw',
        sku: 'RES-NYM-02',
        barcode: '95560020002',
        businessId: 'restaurant',
        categoryId: 21,
        categoryName: 'Hidangan Utama',
        unitId: 31,
        unitCode: 'SET',
        costPrice: 5.20,
        price: 13.50,
        stock: 65,
        minStock: 12,
        status: 'active'
      },
      {
        id: 303,
        name: 'Grilled Chicken Chop Black Pepper & Fries',
        sku: 'RES-WST-03',
        barcode: '95560020003',
        businessId: 'restaurant',
        categoryId: 22,
        categoryName: 'Western & Grill',
        unitId: 31,
        unitCode: 'SET',
        costPrice: 7.50,
        price: 18.90,
        stock: 40,
        minStock: 8,
        status: 'active'
      },
      {
        id: 304,
        name: 'Ribeye Steak Meltique Garlic Butter 200g',
        sku: 'RES-WST-04',
        barcode: '95560020004',
        businessId: 'restaurant',
        categoryId: 22,
        categoryName: 'Western & Grill',
        unitId: 31,
        unitCode: 'SET',
        costPrice: 19.00,
        price: 45.00,
        stock: 20,
        minStock: 5,
        status: 'active'
      },
      {
        id: 305,
        name: 'Ikan Siakap Stim Limau / Bakar Petai',
        sku: 'RES-SEA-05',
        barcode: '95560020005',
        businessId: 'restaurant',
        categoryId: 23,
        categoryName: 'Seafood & Bakar',
        unitId: 34,
        unitCode: 'EKOR',
        costPrice: 16.00,
        price: 38.00,
        stock: 15,
        minStock: 5,
        status: 'active'
      },
      {
        id: 306,
        name: 'Tomyam Seafood Kelapa Mangkuk Panas',
        sku: 'RES-TOM-06',
        barcode: '95560020006',
        businessId: 'restaurant',
        categoryId: 23,
        categoryName: 'Seafood & Bakar',
        unitId: 32,
        unitCode: 'PGN',
        costPrice: 6.50,
        price: 16.00,
        stock: 50,
        minStock: 10,
        status: 'active'
      },
      {
        id: 307,
        name: 'Air Sirap Bandung Cincau Soda Ice',
        sku: 'RES-DRK-07',
        barcode: '95560020007',
        businessId: 'restaurant',
        categoryId: 24,
        categoryName: 'Minuman & Pencuci Mulut',
        unitId: 33,
        unitCode: 'GLS',
        costPrice: 1.20,
        price: 4.50,
        stock: 120,
        minStock: 20,
        status: 'active'
      }
    ]
  },

  // 3. FOOD TRUCKS
  {
    id: 'food_truck',
    name: 'Food Truck Bergerak (Food Trucks)',
    shortName: 'Food Trucks',
    icon: '🚚',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    description: 'Perniagaan mudah alih, burger bakar, takoyaki, loaded fries, boba & snek jalanan.',
    categories: ['Burger Bakar & Hotdog', 'Snek & Takoyaki', 'Crispy Chicken & Bites', 'Minuman Sejuk Cup'],
    defaultUnits: [
      { name: 'Pek / Porsi', shortCode: 'PKT', description: 'Pek makanan bawa pulang', isDefault: true },
      { name: 'Set Hidangan', shortCode: 'SET', description: 'Set burger + fries + drink', isDefault: false },
      { name: 'Cawan / Cup', shortCode: 'CUP', description: 'Cawan minuman sejuk', isDefault: false },
      { name: 'Kotak / Box', shortCode: 'BOX', description: 'Kotak hidangan takoyaki / bites', isDefault: false },
    ],
    products: [
      {
        id: 401,
        name: 'Burger Daging Bakar Lava Double Cheese',
        sku: 'FT-BGR-01',
        barcode: '95560030001',
        businessId: 'food_truck',
        categoryId: 31,
        categoryName: 'Burger Bakar & Hotdog',
        unitId: 42,
        unitCode: 'SET',
        costPrice: 5.50,
        price: 13.90,
        stock: 55,
        minStock: 10,
        status: 'active'
      },
      {
        id: 402,
        name: 'Hotdog Jumbo Cheese Melt & Crispy Onion',
        sku: 'FT-HDG-02',
        barcode: '95560030002',
        businessId: 'food_truck',
        categoryId: 31,
        categoryName: 'Burger Bakar & Hotdog',
        unitId: 41,
        unitCode: 'PKT',
        costPrice: 3.80,
        price: 9.50,
        stock: 40,
        minStock: 8,
        status: 'active'
      },
      {
        id: 403,
        name: 'Takoyaki Sotong Giant Special (6 pcs)',
        sku: 'FT-TKO-03',
        barcode: '95560030003',
        businessId: 'food_truck',
        categoryId: 32,
        categoryName: 'Snek & Takoyaki',
        unitId: 44,
        unitCode: 'BOX',
        costPrice: 4.20,
        price: 10.00,
        stock: 60,
        minStock: 15,
        status: 'active'
      },
      {
        id: 404,
        name: 'Cheesy Loaded Fries Beef Bacon Bits',
        sku: 'FT-FRS-04',
        barcode: '95560030004',
        businessId: 'food_truck',
        categoryId: 32,
        categoryName: 'Snek & Takoyaki',
        unitId: 41,
        unitCode: 'PKT',
        costPrice: 3.50,
        price: 8.50,
        stock: 50,
        minStock: 12,
        status: 'active'
      },
      {
        id: 405,
        name: 'Korean Yangnyeom Crispy Chicken Popcorn',
        sku: 'FT-CHK-05',
        barcode: '95560030005',
        businessId: 'food_truck',
        categoryId: 33,
        categoryName: 'Crispy Chicken & Bites',
        unitId: 44,
        unitCode: 'BOX',
        costPrice: 4.80,
        price: 11.90,
        stock: 35,
        minStock: 8,
        status: 'active'
      },
      {
        id: 406,
        name: 'Brown Sugar Pearl Fresh Milk (Cup 22oz)',
        sku: 'FT-BBA-06',
        barcode: '95560030006',
        businessId: 'food_truck',
        categoryId: 34,
        categoryName: 'Minuman Sejuk Cup',
        unitId: 43,
        unitCode: 'CUP',
        costPrice: 2.20,
        price: 7.90,
        stock: 90,
        minStock: 20,
        status: 'active'
      },
      {
        id: 407,
        name: 'Lemonade Mint Mojito Sparkling (Cup 22oz)',
        sku: 'FT-MJO-07',
        barcode: '95560030007',
        businessId: 'food_truck',
        categoryId: 34,
        categoryName: 'Minuman Sejuk Cup',
        unitId: 43,
        unitCode: 'CUP',
        costPrice: 1.50,
        price: 6.50,
        stock: 100,
        minStock: 25,
        status: 'active'
      }
    ]
  },

  // 4. GROCERY STORES
  {
    id: 'grocery',
    name: 'Pasar Mini & Barangan Dapur (Grocery Stores)',
    shortName: 'Grocery Stores',
    icon: '🛒',
    badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    description: 'Kedai runcit, pasar mini, barangan asas harian, beras, minyak, rempah & produk tin.',
    categories: ['Beras & Bijirin', 'Minyak & Perasa', 'Telur & Tenusu', 'Makanan Kering & Roti'],
    defaultUnits: [
      { name: 'Beg / Karung', shortCode: 'BEG', description: 'Beg beras atau tepung', isDefault: true },
      { name: 'Botol / Bottle', shortCode: 'BTL', description: 'Minyak & sos', isDefault: false },
      { name: 'Sarang (30 biji)', shortCode: 'SRG', description: 'Sarang telur ayam', isDefault: false },
      { name: 'Tin / Can', shortCode: 'TIN', description: 'Susu pekat & sardin tin', isDefault: false },
      { name: 'Kilogram', shortCode: 'KG', description: 'Timbangan bawang & gula', isDefault: false },
    ],
    products: [
      {
        id: 501,
        name: 'Beras Wangi Super Import Jasmine 10KG',
        sku: 'GRC-RIC-01',
        barcode: '95560040001',
        businessId: 'grocery',
        categoryId: 41,
        categoryName: 'Beras & Bijirin',
        unitId: 51,
        unitCode: 'BEG',
        costPrice: 38.00,
        price: 44.50,
        stock: 30,
        minStock: 8,
        status: 'active'
      },
      {
        id: 502,
        name: 'Minyak Masak Sawit Seri Murni 5KG Botol',
        sku: 'GRC-OIL-02',
        barcode: '95560040002',
        businessId: 'grocery',
        categoryId: 42,
        categoryName: 'Minyak & Perasa',
        unitId: 52,
        unitCode: 'BTL',
        costPrice: 28.50,
        price: 32.90,
        stock: 24,
        minStock: 6,
        status: 'active'
      },
      {
        id: 503,
        name: 'Telur Ayam Segar Gred A (Sarang 30 Biji)',
        sku: 'GRC-EGG-03',
        barcode: '95560040003',
        businessId: 'grocery',
        categoryId: 43,
        categoryName: 'Telur & Tenusu',
        unitId: 53,
        unitCode: 'SRG',
        costPrice: 12.80,
        price: 15.50,
        stock: 40,
        minStock: 10,
        status: 'active'
      },
      {
        id: 504,
        name: 'Gula Pasir Kasar CSR 1KG Paket',
        sku: 'GRC-SGR-04',
        barcode: '95560040004',
        businessId: 'grocery',
        categoryId: 42,
        categoryName: 'Minyak & Perasa',
        unitId: 55,
        unitCode: 'KG',
        costPrice: 2.50,
        price: 2.85,
        stock: 60,
        minStock: 15,
        status: 'active'
      },
      {
        id: 505,
        name: 'Susu Pekat Manis Krimer F&N 500g',
        sku: 'GRC-MLK-05',
        barcode: '95560040005',
        businessId: 'grocery',
        categoryId: 43,
        categoryName: 'Telur & Tenusu',
        unitId: 54,
        unitCode: 'TIN',
        costPrice: 3.20,
        price: 4.10,
        stock: 48,
        minStock: 12,
        status: 'active'
      },
      {
        id: 506,
        name: 'Kicap Lemak Manis Kipas Udang Habhal 645ml',
        sku: 'GRC-SOY-06',
        barcode: '95560040006',
        businessId: 'grocery',
        categoryId: 42,
        categoryName: 'Minyak & Perasa',
        unitId: 52,
        unitCode: 'BTL',
        costPrice: 8.20,
        price: 10.50,
        stock: 18,
        minStock: 5,
        status: 'active'
      },
      {
        id: 507,
        name: 'Roti Putih Jumbo Gardenia 600g',
        sku: 'GRC-BRD-07',
        barcode: '95560040007',
        businessId: 'grocery',
        categoryId: 44,
        categoryName: 'Makanan Kering & Roti',
        unitId: 51,
        unitCode: 'BEG',
        costPrice: 3.60,
        price: 4.30,
        stock: 25,
        minStock: 5,
        status: 'active'
      }
    ]
  },

  // 5. BEAUTY SALONS & BARBERSHOP
  {
    id: 'beauty_salon',
    name: 'Salun Kecantikan & Barbershop (Beauty Salons)',
    shortName: 'Beauty Salons',
    icon: '💇',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    description: 'Salun rambut, barbershop moden, facial, spa, manicure & produk penjagaan diri.',
    categories: ['Servis Gunting & Styling', 'Rawatan & Hair Spa', 'Facial & Manicure', 'Produk Penjagaan & Pomade'],
    defaultUnits: [
      { name: 'Sesi / Session', shortCode: 'SESI', description: 'Sesi rawatan & gunting rambut', isDefault: true },
      { name: 'Botol / Bottle', shortCode: 'BTL', description: 'Serum & tonik rambut', isDefault: false },
      { name: 'Bekas / Tub', shortCode: 'TUB', description: 'Pomade & clay rambut', isDefault: false },
      { name: 'Pakej Bulanan', shortCode: 'PKG', description: 'Pakej rawatan kombo', isDefault: false },
    ],
    products: [
      {
        id: 601,
        name: 'Gunting Rambut Fade + Wash + Hair Tonic (Lelaki)',
        sku: 'BS-CUT-01',
        barcode: '95560050001',
        businessId: 'beauty_salon',
        categoryId: 51,
        categoryName: 'Servis Gunting & Styling',
        unitId: 61,
        unitCode: 'SESI',
        costPrice: 4.00,
        price: 25.00,
        stock: 999, // Service item
        minStock: 10,
        status: 'active'
      },
      {
        id: 602,
        name: 'Gunting Rambut Wanita + Wash & Blow Styling',
        sku: 'BS-CUT-02',
        barcode: '95560050002',
        businessId: 'beauty_salon',
        categoryId: 51,
        categoryName: 'Servis Gunting & Styling',
        unitId: 61,
        unitCode: 'SESI',
        costPrice: 8.00,
        price: 45.00,
        stock: 999,
        minStock: 10,
        status: 'active'
      },
      {
        id: 603,
        name: 'Rawatan Scalp Detox & Korean Hair Spa 60 Min',
        sku: 'BS-SPA-03',
        barcode: '95560050003',
        businessId: 'beauty_salon',
        categoryId: 52,
        categoryName: 'Rawatan & Hair Spa',
        unitId: 61,
        unitCode: 'SESI',
        costPrice: 20.00,
        price: 88.00,
        stock: 999,
        minStock: 5,
        status: 'active'
      },
      {
        id: 604,
        name: 'Warna Rambut Balayage + Treatment Masque',
        sku: 'BS-CLR-04',
        barcode: '95560050004',
        businessId: 'beauty_salon',
        categoryId: 52,
        categoryName: 'Rawatan & Hair Spa',
        unitId: 61,
        unitCode: 'SESI',
        costPrice: 45.00,
        price: 180.00,
        stock: 999,
        minStock: 5,
        status: 'active'
      },
      {
        id: 605,
        name: 'Facial Glowing Hydra-Peel & Extraction 75 Min',
        sku: 'BS-FCL-05',
        barcode: '95560050005',
        businessId: 'beauty_salon',
        categoryId: 53,
        categoryName: 'Facial & Manicure',
        unitId: 61,
        unitCode: 'SESI',
        costPrice: 25.00,
        price: 120.00,
        stock: 999,
        minStock: 5,
        status: 'active'
      },
      {
        id: 606,
        name: 'Serum Rambut Moroccan Argan Oil 100ml',
        sku: 'BS-OIL-06',
        barcode: '95560050006',
        businessId: 'beauty_salon',
        categoryId: 54,
        categoryName: 'Produk Penjagaan & Pomade',
        unitId: 62,
        unitCode: 'BTL',
        costPrice: 22.00,
        price: 55.00,
        stock: 15,
        minStock: 4,
        status: 'active'
      },
      {
        id: 607,
        name: 'Pomade Strong Hold Matte Clay 150g',
        sku: 'BS-PMD-07',
        barcode: '95560050007',
        businessId: 'beauty_salon',
        categoryId: 54,
        categoryName: 'Produk Penjagaan & Pomade',
        unitId: 63,
        unitCode: 'TUB',
        costPrice: 12.00,
        price: 32.00,
        stock: 28,
        minStock: 6,
        status: 'active'
      }
    ]
  },

  // 6. CAFES & BAKERY
  {
    id: 'cafe',
    name: 'Kafe Kopi Khas & Bakeri (Cafes)',
    shortName: 'Cafes',
    icon: '☕',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    description: 'Espresso bar, latte art, pastri Perancis, croissant, kek kepingan & hidangan sarapan kafe.',
    categories: ['Kopi Espresso Panas & Sejuk', 'Minuman Non-Kopi & Teh', 'Pastri & Croissant', 'Kek & Pencuci Mulut'],
    defaultUnits: [
      { name: 'Cawan / Cup', shortCode: 'CUP', description: 'Minuman kopi & artisan', isDefault: true },
      { name: 'Keping / Piece', shortCode: 'PCS', description: 'Croissant & muffin', isDefault: false },
      { name: 'Potong / Slice', shortCode: 'SLC', description: 'Kek potong & pai', isDefault: false },
      { name: 'Buku / Loaf', shortCode: 'LF', description: 'Roti Sourdough segar', isDefault: false },
    ],
    products: [
      {
        id: 701,
        name: 'Iced Spanish Latte Espresso Caramel',
        sku: 'CFE-COF-01',
        barcode: '95560060001',
        businessId: 'cafe',
        categoryId: 61,
        categoryName: 'Kopi Espresso Panas & Sejuk',
        unitId: 71,
        unitCode: 'CUP',
        costPrice: 3.20,
        price: 13.90,
        stock: 120,
        minStock: 25,
        status: 'active'
      },
      {
        id: 702,
        name: 'Hot Flat White with Oat Milk Double Shot',
        sku: 'CFE-COF-02',
        barcode: '95560060002',
        businessId: 'cafe',
        categoryId: 61,
        categoryName: 'Kopi Espresso Panas & Sejuk',
        unitId: 71,
        unitCode: 'CUP',
        costPrice: 2.80,
        price: 12.50,
        stock: 95,
        minStock: 20,
        status: 'active'
      },
      {
        id: 703,
        name: 'Matcha Frappuccino Cream Top (Uji Matcha)',
        sku: 'CFE-TEA-03',
        barcode: '95560060003',
        businessId: 'cafe',
        categoryId: 62,
        categoryName: 'Minuman Non-Kopi & Teh',
        unitId: 71,
        unitCode: 'CUP',
        costPrice: 3.50,
        price: 14.50,
        stock: 75,
        minStock: 15,
        status: 'active'
      },
      {
        id: 704,
        name: 'Artisanal Butter Croissant Flaky French 70g',
        sku: 'CFE-BAK-04',
        barcode: '95560060004',
        businessId: 'cafe',
        categoryId: 63,
        categoryName: 'Pastri & Croissant',
        unitId: 72,
        unitCode: 'PCS',
        costPrice: 2.80,
        price: 8.50,
        stock: 30,
        minStock: 8,
        status: 'active'
      },
      {
        id: 705,
        name: 'Pain Au Chocolat Belgian Dark Melt',
        sku: 'CFE-BAK-05',
        barcode: '95560060005',
        businessId: 'cafe',
        categoryId: 63,
        categoryName: 'Pastri & Croissant',
        unitId: 72,
        unitCode: 'PCS',
        costPrice: 3.20,
        price: 9.90,
        stock: 25,
        minStock: 6,
        status: 'active'
      },
      {
        id: 706,
        name: 'Basque Burnt Cheesecake Creamy Slice',
        sku: 'CFE-CAK-06',
        barcode: '95560060006',
        businessId: 'cafe',
        categoryId: 64,
        categoryName: 'Kek & Pencuci Mulut',
        unitId: 73,
        unitCode: 'SLC',
        costPrice: 4.50,
        price: 15.00,
        stock: 18,
        minStock: 5,
        status: 'active'
      }
    ]
  },

  // 7. KIOSK & GERAI
  {
    id: 'kiosk',
    name: 'Kiosk Stesen & Gerai Santai (Kiosk)',
    shortName: 'Kiosk',
    icon: '🍿',
    badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    description: 'Kiosk stesen MRT/Mall, waffle rangup, jagung cawan manis, popcorn, ais krim & snek cepat.',
    categories: ['Waffle & Bakeri Kiosk', 'Jagung & Snek Panas', 'Popcorn & Manisan', 'Ais Krim & Air Balang'],
    defaultUnits: [
      { name: 'Keping / Piece', shortCode: 'PCS', description: 'Waffle & kepingan', isDefault: true },
      { name: 'Cawan / Cup', shortCode: 'CUP', description: 'Jagung cawan & air balang', isDefault: false },
      { name: 'Balang / Tub', shortCode: 'TUB', description: 'Popcorn karamel tub', isDefault: false },
      { name: 'Cucuk / Stick', shortCode: 'STK', description: 'Sosej & bebola cucuk', isDefault: false },
    ],
    products: [
      {
        id: 801,
        name: 'Waffle Crispy Coklat + Peanut Butter',
        sku: 'KSK-WFL-01',
        barcode: '95560070001',
        businessId: 'kiosk',
        categoryId: 71,
        categoryName: 'Waffle & Bakeri Kiosk',
        unitId: 81,
        unitCode: 'PCS',
        costPrice: 1.50,
        price: 5.50,
        stock: 85,
        minStock: 20,
        status: 'active'
      },
      {
        id: 802,
        name: 'Jagung Cawan Manis Mentega Susu Extra Cheese',
        sku: 'KSK-CRN-02',
        barcode: '95560070002',
        businessId: 'kiosk',
        categoryId: 72,
        categoryName: 'Jagung & Snek Panas',
        unitId: 82,
        unitCode: 'CUP',
        costPrice: 1.20,
        price: 4.50,
        stock: 100,
        minStock: 25,
        status: 'active'
      },
      {
        id: 803,
        name: 'Popcorn Karamel Crispy Jumbo Tub',
        sku: 'KSK-POP-03',
        barcode: '95560070003',
        businessId: 'kiosk',
        categoryId: 73,
        categoryName: 'Popcorn & Manisan',
        unitId: 83,
        unitCode: 'TUB',
        costPrice: 2.20,
        price: 8.00,
        stock: 45,
        minStock: 10,
        status: 'active'
      },
      {
        id: 804,
        name: 'Ais Krim Soft Serve Vanilla Sundae Cone',
        sku: 'KSK-ICM-04',
        barcode: '95560070004',
        businessId: 'kiosk',
        categoryId: 74,
        categoryName: 'Ais Krim & Air Balang',
        unitId: 81,
        unitCode: 'PCS',
        costPrice: 0.80,
        price: 3.00,
        stock: 150,
        minStock: 30,
        status: 'active'
      },
      {
        id: 805,
        name: 'Keropok Lekor Crispy Terengganu + Sos Thai',
        sku: 'KSK-LKR-05',
        barcode: '95560070005',
        businessId: 'kiosk',
        categoryId: 72,
        categoryName: 'Jagung & Snek Panas',
        unitId: 81,
        unitCode: 'PCS',
        costPrice: 2.00,
        price: 6.00,
        stock: 50,
        minStock: 10,
        status: 'active'
      }
    ]
  },

  // 8. CAR WASHES & AUTO DETAILING
  {
    id: 'car_wash',
    name: 'Cucian Kereta & Detailing (Car Washes)',
    shortName: 'Car Washes',
    icon: '🚗',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    description: 'Pusat cucian kereta automatik & manual, snow wash, vacuum, polish, wax & detailing.',
    categories: ['Pakej Cuci Snow Wash', 'Wax & Polish Detailing', 'Rawatan Dalaman & Kusyen', 'Aksesori & Pewangi Kereta'],
    defaultUnits: [
      { name: 'Sebuah Kereta', shortCode: 'KRT', description: 'Cucian per kenderaan', isDefault: true },
      { name: 'Sesi Rawatan', shortCode: 'SESI', description: 'Servis detailing / coating', isDefault: false },
      { name: 'Botol / Can', shortCode: 'BTL', description: 'Pewangi & car care spray', isDefault: false },
      { name: 'Pakej Lengkap', shortCode: 'PKG', description: 'Pakej kombo cucian & polish', isDefault: false },
    ],
    products: [
      {
        id: 901,
        name: 'Snow Wash + Interior Vacuum + Tyre Shine (Sedan)',
        sku: 'CW-WSH-01',
        barcode: '95560080001',
        businessId: 'car_wash',
        categoryId: 81,
        categoryName: 'Pakej Cuci Snow Wash',
        unitId: 91,
        unitCode: 'KRT',
        costPrice: 3.50,
        price: 18.00,
        stock: 999, // Service
        minStock: 10,
        status: 'active'
      },
      {
        id: 902,
        name: 'Snow Wash + Interior Vacuum + Tyre Shine (SUV/MPV/4x4)',
        sku: 'CW-WSH-02',
        barcode: '95560080002',
        businessId: 'car_wash',
        categoryId: 81,
        categoryName: 'Pakej Cuci Snow Wash',
        unitId: 91,
        unitCode: 'KRT',
        costPrice: 4.50,
        price: 25.00,
        stock: 999,
        minStock: 10,
        status: 'active'
      },
      {
        id: 903,
        name: 'Hydrophobic Ceramic Wax + Water Mark Removal',
        sku: 'CW-WAX-03',
        barcode: '95560080003',
        businessId: 'car_wash',
        categoryId: 82,
        categoryName: 'Wax & Polish Detailing',
        unitId: 92,
        unitCode: 'SESI',
        costPrice: 15.00,
        price: 65.00,
        stock: 999,
        minStock: 5,
        status: 'active'
      },
      {
        id: 904,
        name: '3-Step Paint Correction Polish & Scratch Removal',
        sku: 'CW-POL-04',
        barcode: '95560080004',
        businessId: 'car_wash',
        categoryId: 82,
        categoryName: 'Wax & Polish Detailing',
        unitId: 92,
        unitCode: 'SESI',
        costPrice: 40.00,
        price: 180.00,
        stock: 999,
        minStock: 5,
        status: 'active'
      },
      {
        id: 905,
        name: 'Nano Mist Antibacterial Disinfection Cabin Treatment',
        sku: 'CW-SAN-05',
        barcode: '95560080005',
        businessId: 'car_wash',
        categoryId: 83,
        categoryName: 'Rawatan Dalaman & Kusyen',
        unitId: 92,
        unitCode: 'SESI',
        costPrice: 5.00,
        price: 30.00,
        stock: 999,
        minStock: 5,
        status: 'active'
      },
      {
        id: 906,
        name: 'Pewangi Kereta Organik Premium Vanilla Leaf',
        sku: 'CW-ACC-06',
        barcode: '95560080006',
        businessId: 'car_wash',
        categoryId: 84,
        categoryName: 'Aksesori & Pewangi Kereta',
        unitId: 93,
        unitCode: 'BTL',
        costPrice: 4.50,
        price: 12.00,
        stock: 35,
        minStock: 8,
        status: 'active'
      }
    ]
  },

  // 9. AYAM SEGAR & SEJUK BEKU (KHAIRUL FRESH ORIGINAL)
  {
    id: 'chicken_frozen',
    name: 'Ayam Segar & Sejuk Beku (Khairul Fresh POS)',
    shortName: 'Ayam & Sejuk Beku',
    icon: '🍗',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    description: 'Perniagaan ayam segar timbang kilo, bahagian potongan, daging lembu & produk sejuk beku burger/nugget.',
    categories: ['Ayam Segar', 'Sejuk Beku', 'Daging & Makanan Laut', 'Rempah & Bahan Segar'],
    defaultUnits: [
      { name: 'Kilogram', shortCode: 'KG', description: 'Berat timbangan ayam & daging', isDefault: true },
      { name: 'Ekor', shortCode: 'EKOR', description: 'Kiraan ekor ayam hidup/potong', isDefault: false },
      { name: 'Paket / Bungkus', shortCode: 'PKT', description: 'Produk sejuk beku terbungkus', isDefault: false },
      { name: 'Kotak / Karton', shortCode: 'BOX', description: 'Kotak pukal karton', isDefault: false }
    ],
    products: [
      {
        id: 101,
        name: 'Ayam Segar (Dipotong 12)',
        sku: 'AYM-001',
        barcode: '95550001001',
        businessId: 'chicken_frozen',
        categoryId: 1,
        categoryName: 'Ayam Segar',
        unitId: 1,
        unitCode: 'KG',
        costPrice: 6.80,
        price: 9.80,
        stock: 45.5,
        minStock: 10.0,
        status: 'active'
      },
      {
        id: 102,
        name: 'Dada Ayam Fillet Boneless',
        sku: 'AYM-002',
        barcode: '95550001002',
        businessId: 'chicken_frozen',
        categoryId: 1,
        categoryName: 'Ayam Segar',
        unitId: 1,
        unitCode: 'KG',
        costPrice: 11.50,
        price: 15.50,
        stock: 8.2, // Low stock
        minStock: 15.0,
        status: 'active'
      },
      {
        id: 103,
        name: 'Ayam Daging utuh (Pencuci)',
        sku: 'AYM-003',
        barcode: '95550001003',
        businessId: 'chicken_frozen',
        categoryId: 1,
        categoryName: 'Ayam Segar',
        unitId: 2,
        unitCode: 'EKOR',
        costPrice: 12.00,
        price: 16.00,
        stock: 14.0,
        minStock: 5.0,
        status: 'active'
      },
      {
        id: 104,
        name: 'Nugget Tempura Ramly 1KG',
        sku: 'FRZ-001',
        barcode: '95550002001',
        businessId: 'chicken_frozen',
        categoryId: 2,
        categoryName: 'Sejuk Beku',
        unitId: 3,
        unitCode: 'PKT',
        costPrice: 11.00,
        price: 14.50,
        stock: 28.0,
        minStock: 8.0,
        status: 'active'
      },
      {
        id: 105,
        name: 'Daging Lembu Pejal Tempatan Segar',
        sku: 'FRZ-BEEF-05',
        barcode: '95550002005',
        businessId: 'chicken_frozen',
        categoryId: 3,
        categoryName: 'Daging & Makanan Laut',
        unitId: 1,
        unitCode: 'KG',
        costPrice: 28.00,
        price: 36.00,
        stock: 18.0,
        minStock: 5.0,
        status: 'active'
      }
    ]
  },

  // 10. LAIN-LAIN (BENGKEL, DOBI, PET SHOP)
  {
    id: 'other_services',
    name: 'Lain-Lain & Perkhidmatan (Bengkel, Dobi, Pet Shop)',
    shortName: 'Lain-Lain / Services',
    icon: '🔧',
    badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    description: 'Servis penukaran minyak bengkel, perkhidmatan dobi basuh lipat, makanan haiwan peliharaan.',
    categories: ['Servis Bengkel Automotif', 'Dobi & Dry Clean', 'Pet Shop & Haiwan'],
    defaultUnits: [
      { name: 'Sesi Servis', shortCode: 'SESI', description: 'Servis penyelenggaraan', isDefault: true },
      { name: 'Beg / Load', shortCode: 'BEG', description: 'Kiraan dobi pakaian / pek makanan kucing', isDefault: false },
      { name: 'Helai / Pcs', shortCode: 'PCS', description: 'Dry clean blazer / aksesori', isDefault: false },
      { name: 'Botol / Liter', shortCode: 'BTL', description: 'Minyak enjin 4T/4L', isDefault: false },
    ],
    products: [
      {
        id: 1001,
        name: 'Servis Tukar Minyak Enjin Fully Synthetic 4L + Oil Filter',
        sku: 'SRV-ENG-01',
        barcode: '95560090001',
        businessId: 'other_services',
        categoryId: 91,
        categoryName: 'Servis Bengkel Automotif',
        unitId: 101,
        unitCode: 'SESI',
        costPrice: 85.00,
        price: 150.00,
        stock: 999,
        minStock: 5,
        status: 'active'
      },
      {
        id: 1002,
        name: 'Dobi Basuh, Kering & Lipat Rapi 10KG Load',
        sku: 'SRV-LND-02',
        barcode: '95560090002',
        businessId: 'other_services',
        categoryId: 92,
        categoryName: 'Dobi & Dry Clean',
        unitId: 102,
        unitCode: 'BEG',
        costPrice: 5.00,
        price: 22.00,
        stock: 999,
        minStock: 5,
        status: 'active'
      },
      {
        id: 1003,
        name: 'Makanan Kucing Premium Royal Canin Fit 32 (2KG)',
        sku: 'SRV-PET-03',
        barcode: '95560090003',
        businessId: 'other_services',
        categoryId: 93,
        categoryName: 'Pet Shop & Haiwan',
        unitId: 102,
        unitCode: 'BEG',
        costPrice: 52.00,
        price: 72.00,
        stock: 16,
        minStock: 4,
        status: 'active'
      },
      {
        id: 1004,
        name: 'Pasir Kucing Tofu Clumping Scented 7L',
        sku: 'SRV-PET-04',
        barcode: '95560090004',
        businessId: 'other_services',
        categoryId: 93,
        categoryName: 'Pet Shop & Haiwan',
        unitId: 102,
        unitCode: 'BEG',
        costPrice: 14.00,
        price: 24.00,
        stock: 22,
        minStock: 5,
        status: 'active'
      }
    ]
  }
];

export function getAllCatalogProducts(): BusinessProduct[] {
  return BUSINESS_VERTICALS.flatMap(b => b.products);
}

export function getProductsForBusiness(businessId: string): BusinessProduct[] {
  if (businessId === 'all') {
    return getAllCatalogProducts();
  }
  const found = BUSINESS_VERTICALS.find(b => b.id === businessId);
  return found ? found.products : [];
}

export function getUnitsForBusiness(businessId: string): BusinessUnit[] {
  const found = BUSINESS_VERTICALS.find(b => b.id === businessId) || BUSINESS_VERTICALS[0];
  return found.defaultUnits.map((u, idx) => ({
    id: idx + 1,
    name: u.name,
    shortCode: u.shortCode,
    description: u.description,
    isDefault: u.isDefault,
    isActive: true
  }));
}
