งานนี้ค่อนข้างใหญ่ ผมจะแบ่งเป็น 2 เฟสเพื่อให้คุมคุณภาพได้ดี และไม่ใช้ token เกินจำเป็น

## Phase 1 (ทำในรอบนี้)

### 1. เปิด Lovable Cloud + สร้างฐานข้อมูล
ตาราง:
- `profiles` — id (FK auth.users), full_name, customer_code (auto), reward_points int default 0, created_at
- `user_roles` — id, user_id, role enum('admin','user') + ฟังก์ชัน `has_role()` (security definer)
- `products` — id, name, price, image_url, category, order_count int default 0, created_at
- `orders` — id, user_id, total, status, created_at
- `order_items` — id, order_id, product_id, qty, price
- Trigger: เมื่อ user signup → สร้าง row ใน `profiles` พร้อม customer_code อัตโนมัติ (`MM-XXXXXX`)
- Trigger/RPC: เมื่อสั่งออเดอร์ → bump `products.order_count` และ `profiles.reward_points`
- RLS ครบทุกตาราง (user เห็นเฉพาะของตน, admin เห็นทั้งหมด)

### 2. Authentication จริง
- Login/Signup page เชื่อม `supabase.auth` (email/password, ปิด confirm email เพื่อทดสอบเร็ว)
- `useAuth` hook + `onAuthStateChange` listener
- Navbar: ถ้า login → Avatar dropdown (ชื่อ, Profile, Logout); ถ้าไม่ → ปุ่มเดิม
- หน้า `/profile` แสดง: ชื่อ / Customer ID / วันสมัคร / Reward Points

### 3. Best Seller badge
- หน้า `/menu` ดึง products จาก DB เรียงตาม `order_count` desc
- Top 3 → แสดง badge "ขายดี" สีทองที่มุมการ์ด พร้อม animation

### 4. Theme Customization
- `ThemeProvider` (next-themes pattern เอง) — light/dark + เลือก primary จาก preset 5 สี (matcha green, sakura pink, ocean blue, sunset orange, lavender)
- ปุ่ม Settings ใน Navbar (icon Palette) เปิด popover ให้เลือก
- เก็บใน localStorage ต่อเครื่อง

### 5. Checkout เชื่อม DB
- กดสั่ง → insert `orders` + `order_items` → trigger bump order_count + reward points
- ถ้ายังไม่ login → redirect `/login`

## Phase 2 (รอบถัดไป — เลือกได้ว่าจะทำต่อ)

### 6. Auto-Image (Lovable AI / Gemini image)
- หน้า admin `/admin/products` ฟอร์มเพิ่มสินค้า: กรอกชื่อ → กดปุ่ม "สร้างรูปอัตโนมัติ"
- เรียก edge function `generate-product-image` ใช้ `google/gemini-2.5-flash-image` พร้อม prompt: "professional food photo of {name}, matcha cafe aesthetic, soft lighting"
- บันทึก base64 → upload ไป Storage bucket `product-images` → เก็บ URL ใน `products.image_url`
- มี loading state + retry

แยกเฟสเพราะ image gen ต้องเทสรอบ generate จริง และเปลือง credits ถ้าทำพร้อมส่วนอื่น

## หมายเหตุเทคนิค
- จะใช้ shadcn dropdown-menu + popover ที่มีอยู่แล้ว
- เก็บ logic auth ใน `src/hooks/useAuth.tsx` (context)
- Theme tokens อยู่ใน `index.css` อยู่แล้ว — จะ override `--primary` ผ่าน `data-theme` attribute บน `<html>`
- products mock ปัจจุบัน (`src/lib/products.ts`) จะ seed เข้า DB แล้วสลับ Menu ไปอ่านจาก DB

หากเห็นด้วย กด Approve เพื่อเริ่ม Phase 1 ครับ