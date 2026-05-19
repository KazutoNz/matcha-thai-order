## ภาพรวม
ขยายระบบจัดการออเดอร์และเพิ่ม role ใหม่ (Rider, Manager) พร้อม Dashboard และรายงานที่ละเอียดขึ้น

## 1. หน้าประวัติการสั่งซื้อ (User)
- สร้างหน้าใหม่ `/orders` แสดงประวัติทั้งหมดของผู้ใช้ พร้อมสถานะ
- เพิ่มปุ่ม "ติดตามออเดอร์" ในแต่ละรายการ → ลิงก์ไป `/tracking/:id`
- หลังกดสั่งซื้อใน Checkout redirect ไปหน้านี้แทน
- เพิ่มลิงก์ "ประวัติออเดอร์" ใน Navbar / Profile

## 2. ระบบ Role (User / Rider / Manager / Admin)
- เพิ่ม enum role: `rider`, `manager` (ปัจจุบันมี `user`, `admin`)
- อัปเดต RLS policies ให้ Manager/Admin จัดการได้, Rider เห็นเฉพาะออเดอร์ที่ต้องส่ง
- เพิ่ม column `rider_id` และ `delivery_status` (`confirmed`, `out_for_delivery`, `delivered`) ใน orders หรือใช้ status เดิมที่ขยาย enum

### ขยาย order_status enum
เพิ่ม: `confirmed`, `out_for_delivery`, `delivered`

## 3. Dashboard (Admin/Manager)
- การ์ดสถานะแบบ realtime: ยืนยันรับแล้ว / กำลังจัดส่ง / ส่งถึงที่แล้ว / เสร็จสิ้น
- กราฟยอดขายรายวัน (Recharts LineChart 7 วันล่าสุด)
- กราฟเมนูยอดนิยม (BarChart top 5 สินค้า)
- ตารางสรุปยอดขายต่อวัน

## 4. หน้า Rider
- เส้นทาง `/rider` แสดงออเดอร์ที่ admin/manager กดส่งให้แล้ว
- ปุ่ม "รับงาน" → status = `out_for_delivery`
- ปุ่ม "ส่งสำเร็จ" → status = `delivered`

## 5. รายละเอียดเชิงเทคนิค
- Migration: ขยาย `app_role` enum + `order_status` enum, เพิ่ม `rider_id uuid` ใน orders, ปรับ RLS
- Hook `useOrders` รับ filter เพิ่มเติม (by rider, by status)
- เพิ่ม route guards ตาม role ใน App.tsx
- ใช้ Recharts (ติดตั้งอยู่แล้วใน shadcn chart)
- คงธีม matcha minimalist เดิม

## โครงสร้างไฟล์ใหม่
- `src/pages/Orders.tsx` (ประวัติ user)
- `src/pages/rider/Deliveries.tsx`
- `src/layouts/RiderLayout.tsx`
- `src/hooks/useRole.ts`
- อัปเดต `src/pages/admin/Dashboard.tsx` ให้มีกราฟ
- อัปเดต `Checkout.tsx`, `Navbar.tsx`, `App.tsx`, `useOrders.ts`
