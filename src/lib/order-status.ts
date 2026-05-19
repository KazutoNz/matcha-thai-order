import type { OrderStatus } from '@/hooks/useOrders';

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'รอดำเนินการ',
  confirmed: 'ยืนยันรับออเดอร์',
  preparing: 'กำลังเตรียม',
  ready: 'พร้อมจัดส่ง',
  out_for_delivery: 'กำลังจัดส่ง',
  delivered: 'ส่งถึงแล้ว',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
};

export const STATUS_BADGE: Record<OrderStatus, string> = {
  pending:          'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  confirmed:        'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
  preparing:        'bg-blue-100 text-blue-800 hover:bg-blue-100',
  ready:            'bg-purple-100 text-purple-800 hover:bg-purple-100',
  out_for_delivery: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  delivered:        'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  completed:        'bg-green-100 text-green-800 hover:bg-green-100',
  cancelled:        'bg-red-100 text-red-800 hover:bg-red-100',
};

export const STATUS_TO_STEP: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  ready: 3,
  out_for_delivery: 4,
  delivered: 5,
  completed: 5,
  cancelled: 0,
};

export const ALL_STATUSES: OrderStatus[] = [
  'pending','confirmed','preparing','ready','out_for_delivery','delivered','completed','cancelled',
];
