# แผนการพัฒนาระบบ Matchaweb 2.0 (ระบบจัดการออเดอร์และเดลิเวอรี่)

## 📌 ภาพรวม (Overview)
ขยายระบบจัดการออเดอร์ของ Matchaweb ให้เป็นระบบเดลิเวอรี่เต็มรูปแบบ โดยเพิ่ม Role การทำงาน (Rider, Manager) พร้อมระบบติดตามสถานะแบบ Real-time และ Dashboard เชิงลึกสำหรับการวิเคราะห์ข้อมูล

## 1. หน้าประวัติการสั่งซื้อและการติดตาม (User)
- หน้าประวัติ (`/orders`):** แสดงรายการคำสั่งซื้อทั้งหมด เรียงจากล่าสุดไปเก่าสุด พร้อมใช้ Skeleton Loading ระหว่างรอโหลดข้อมูล
- การติดตามแบบ Real-time (`/tracking/:id`):** เมื่อกดปุ่ม "ติดตามออเดอร์" ระบบต้องเชื่อมต่อกับ Supabase Realtime เพื่อให้สถานะอัปเดตทันที (เช่น จาก "กำลังเตรียม" เป็น "กำลังจัดส่ง") โดยที่ผู้ใช้ไม่ต้องรีเฟรชหน้าจอ
- การนำทาง: หลังชำระเงินเสร็จสิ้น ให้เปลี่ยนหน้า (Redirect) ไปที่หน้า Tracking อัตโนมัติ และแสดงไอคอนประวัติการสั่งซื้อไว้ที่ Navbar

## 2. ระบบ Role และ Flow สถานะ (User / Rider / Manager / Admin)
- การจัดการสิทธิ์: เพิ่ม enum `app_role` ให้รองรับ `rider` และ `manager` นอกเหนือจาก `user` และ `admin`
- ระบบความปลอดภัย (RLS):** ตั้งค่า Row Level Security ให้ Manager สามารถดูและแก้ไขได้ทุกออเดอร์ ส่วน Rider จะมองเห็นเฉพาะออเดอร์ที่ถูกส่งเข้ากองกลาง หรือออเดอร์ที่ตัวเองรับผิดชอบเท่านั้น
- Flow สถานะที่ชัดเจน (order_status):** ปรับปรุงลำดับสถานะให้ครอบคลุม ได้แก่ `pending` (รอรับออเดอร์), `preparing` (กำลังชง), `ready_for_delivery` (รอไรเดอร์รับงาน), `out_for_delivery` (กำลังจัดส่ง), และ `delivered` (ส่งสำเร็จ)

## 3. ระบบจัดการและ Dashboard (Admin/Manager)
- กระดานสรุปผล (Real-time Cards):** แสดงตัวเลขยอดรวมออเดอร์แยกตามสถานะปัจจุบัน เพื่อให้ Manager จัดการคิวได้ทันที
- การวิเคราะห์ข้อมูล:** ใช้ Recharts สร้างแผนภูมิ LineChart แสดงยอดขายย้อนหลัง 7 วัน และ BarChart แสดง 5 อันดับเมนูขายดี
- ระบบจัดการสิทธิ์ (User Management):** Admin สามารถปรับสิทธิ์ให้ User ธรรมดากลายเป็น Rider หรือ Manager ผ่านหน้าแดชบอร์ดได้โดยตรง

## 4. หน้าจอการทำงานของ Rider
- หน้าศูนย์รวมงาน (`/rider/jobs`):** แสดงออเดอร์ที่มีสถานะ `ready_for_delivery` เพื่อให้ Rider สามารถกดปุ่ม "รับงาน" ได้
- หน้างานปัจจุบัน (`/rider/active`):** แสดงออเดอร์ที่รับมาแล้ว (สถานะ `out_for_delivery`) พร้อมรายละเอียดที่อยู่ของลูกค้า
- การปิดงาน (Proof of Delivery):** เมื่อจัดส่งสำเร็จ Rider ต้องกดปุ่ม "ส่งสำเร็จ" (สถานะ `delivered`) โดยอาจมีฟังก์ชันเสริมสำหรับอัปโหลดรูปภาพยืนยันการส่งในอนาคต

## 5. รายละเอียดเชิงเทคนิค (Technical Specs)
- Database Migration:** เพิ่มคอลัมน์ `rider_id` (UUID) ในตาราง `orders` เพื่อผูกข้อมูลไรเดอร์กับคำสั่งซื้อ
- TypeScript Interfaces:** อัปเดต Type ของ Order ให้รองรับฟิลด์ใหม่ๆ อย่างเข้มงวด เพื่อดักจับข้อผิดพลาดระหว่างเขียนโค้ด
- Hooks Optimization:** ปรับปรุง `useOrders` ให้รองรับพารามิเตอร์การกรองข้อมูล (เช่น `filterByStatus`, `filterByRider`)
- Route Guards:** สร้าง Component สำหรับห่อหุ้มหน้าเว็บ (เช่น `<ProtectedRoute allowedRoles={['admin', 'manager']} />`) เพื่อป้องกันไม่ให้ User ธรรมดาเข้าถึงหน้าของ Rider หรือ Admin ได้

## 6. โครงสร้างไฟล์ที่ต้องเพิ่มและอัปเดต
- `src/pages/Orders.tsx` (สำหรับผู้ใช้ทั่วไป)
- `src/pages/OrderTracking.tsx` (ติดตามสถานะ Real-time)
- `src/pages/rider/JobPool.tsx` (กระดานรับงานของไรเดอร์)
- `src/pages/rider/ActiveDelivery.tsx` (งานที่กำลังจัดส่ง)
- `src/layouts/RiderLayout.tsx` (โครงร่างหน้าตาสำหรับไรเดอร์)
- `src/components/auth/ProtectedRoute.tsx` (ระบบป้องกันหน้าเว็บ)
- `src/services/api/orderService.ts` (แยกฟังก์ชันจัดการออเดอร์ของ Supabase ออกมาให้เป็นระเบียบ)
- อัปเดต `App.tsx`, `Navbar.tsx`, `useOrders.ts` และ Dashboard เดิม