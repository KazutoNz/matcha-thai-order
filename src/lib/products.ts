export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'drink' | 'dessert';
  order_count?: number;
}

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
