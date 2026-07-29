export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Tote' | 'Clutch' | 'Shoulder Bag' | 'Crossbody';
  image: string;
  description: string;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

