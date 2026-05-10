import productLatte from '@/assets/product-latte.jpg';
import productFrappe from '@/assets/product-frappe.jpg';
import productCheesecake from '@/assets/product-cheesecake.jpg';
import productSoftserve from '@/assets/product-softserve.jpg';
import productMochi from '@/assets/product-mochi.jpg';
import productSmoothie from '@/assets/product-smoothie.jpg';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'drink' | 'dessert';
  order_count?: number;
}

export const products: Product[] = [
  { id: 1, name: 'มัทฉะ ลาเต้', price: 75, image: productLatte, category: 'drink' },
  { id: 2, name: 'มัทฉะ แฟรปเป้', price: 85, image: productFrappe, category: 'drink' },
  { id: 3, name: 'มัทฉะ ชีสเค้ก', price: 120, image: productCheesecake, category: 'dessert' },
  { id: 4, name: 'มัทฉะ ซอฟท์เสิร์ฟ', price: 65, image: productSoftserve, category: 'dessert' },
  { id: 5, name: 'มัทฉะ โมจิ', price: 90, image: productMochi, category: 'dessert' },
  { id: 6, name: 'มัทฉะ สมูทตี้โบว์ล', price: 95, image: productSmoothie, category: 'drink' },
  { id: 7, name: 'มัทฉะ อเมริกาโน่', price: 70, image: productLatte, category: 'drink' },
  { id: 8, name: 'มัทฉะ คาปูชิโน่', price: 78, image: productLatte, category: 'drink' },
  { id: 9, name: 'มัทฉะ นมสดร้อน', price: 72, image: productLatte, category: 'drink' },
  { id: 10, name: 'มัทฉะ คุกกี้แฟรปเป้', price: 88, image: productFrappe, category: 'drink' },
  { id: 11, name: 'มัทฉะ สตรอว์เบอร์รี', price: 92, image: productSmoothie, category: 'drink' },
  { id: 12, name: 'มัทฉะ โยเกิร์ตปั่น', price: 89, image: productSmoothie, category: 'drink' },
  { id: 13, name: 'มัทฉะ ชาไทยปั่น', price: 80, image: productFrappe, category: 'drink' },
  { id: 14, name: 'มัทฉะ น้ำผึ้งมะนาว', price: 82, image: productSmoothie, category: 'drink' },
  { id: 15, name: 'มัทฉะ พุดดิ้ง', price: 55, image: productSoftserve, category: 'dessert' },
  { id: 16, name: 'มัทฉะ บราวนี่', price: 95, image: productCheesecake, category: 'dessert' },
  { id: 17, name: 'มัทฉะ ทิรามิสุ', price: 115, image: productCheesecake, category: 'dessert' },
  { id: 18, name: 'มัทฉะ ครัวซองต์', price: 68, image: productMochi, category: 'dessert' },
  { id: 19, name: 'มัทฉะ วาฟเฟิล', price: 88, image: productSoftserve, category: 'dessert' },
  { id: 20, name: 'มัทฉะ พานาคอตต้า', price: 105, image: productCheesecake, category: 'dessert' },
  { id: 21, name: 'มัทฉะ ไอศกรีมโคน', price: 58, image: productSoftserve, category: 'dessert' },
  { id: 22, name: 'มัทฉะ ชูครีม', price: 62, image: productSoftserve, category: 'dessert' },
  { id: 23, name: 'มัทฉะ บิงซู', price: 135, image: productSmoothie, category: 'dessert' },
  { id: 24, name: 'มัทฉะ โรลเค้ก', price: 98, image: productCheesecake, category: 'dessert' },
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
