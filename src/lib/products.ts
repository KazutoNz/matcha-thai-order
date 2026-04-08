import productLatte from '@/assets/product-latte.jpg';
import productFrappe from '@/assets/product-frappe.jpg';
import productCheesecake from '@/assets/product-cheesecake.jpg';
import productSoftserve from '@/assets/product-softserve.jpg';
import productMochi from '@/assets/product-mochi.jpg';
import productSmoothie from '@/assets/product-smoothie.jpg';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: 'drink' | 'dessert';
}

export const products: Product[] = [
  { id: 1, name: 'มัทฉะ ลาเต้', price: 75, image: productLatte, category: 'drink' },
  { id: 2, name: 'มัทฉะ แฟรปเป้', price: 85, image: productFrappe, category: 'drink' },
  { id: 3, name: 'มัทฉะ ชีสเค้ก', price: 120, image: productCheesecake, category: 'dessert' },
  { id: 4, name: 'มัทฉะ ซอฟท์เสิร์ฟ', price: 65, image: productSoftserve, category: 'dessert' },
  { id: 5, name: 'มัทฉะ โมจิ', price: 90, image: productMochi, category: 'dessert' },
  { id: 6, name: 'มัทฉะ สมูทตี้โบว์ล', price: 95, image: productSmoothie, category: 'drink' },
];

export const TOPPING_PRICE = 15;
export const toppings = [
  { id: 'boba', name: 'ไข่มุก' },
  { id: 'redbean', name: 'ถั่วแดง' },
  { id: 'jelly', name: 'วุ้นมัทฉะ' },
];

export const sweetnessOptions: { value: string; label: string; hint: string }[] = [
  { value: '0%', label: 'ไม่หวาน', hint: 'เน้นรสมัทฉะเข้ม' },
  { value: '25%', label: 'หวานน้อย', hint: 'แบบญี่ปุ่น' },
  { value: '50%', label: 'กลางๆ', hint: 'สมดุล' },
  { value: '100%', label: 'หวานเต็ม', hint: 'เข้ากับนม' },
];

export const sweetnessLevels = sweetnessOptions.map((o) => o.value);
