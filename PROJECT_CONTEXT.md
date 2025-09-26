# PROJECT_CONTEXT.md

## Project: Inventory & Low‑Stock Alerts (Hackathon)
เว็บแอปแบบเบาสำหรับติดตามสต็อกสินค้า บันทึกความเคลื่อนไหวสต็อก (IN/OUT) และแจ้งเตือนสินค้าใกล้หมด พร้อมปุ่มขอคำแนะนำจำนวนสั่งซื้อ (Mock AI) เพื่อช่วยตัดสินใจเติมสต็อกอย่างรวดเร็ว

---

## Objectives
- เก็บข้อมูลสินค้า (SKU, ชื่อ, หน่วย, เกณฑ์สั่งซื้อซ้ำขั้นต่ำ, ยอดคงเหลือ)
- บันทึก IN/OUT แบบธุรกรรม เพื่อให้ `stock_on_hand` ถูกต้องเสมอ
- แสดงรายการ **Low‑Stock** และ **Recent Movements** บนแดชบอร์ด
- ปุ่ม **Reorder Suggestion (Mock AI)** แสดงจำนวนแนะนำ + เหตุผลอ้างอิง (basis)

---

## Roles & Audience
- **Inventory Officer**: จัดการสินค้า, บันทึก IN/OUT
- **Manager**: ดูแดชบอร์ด, ตรวจ Low‑Stock, ขอ Reorder Suggestion
- **Viewer/Staff**: ดูข้อมูลตามที่อนุญาต

---

## Success Criteria (High‑level)
- IN/OUT อัปเดต `stock_on_hand` ถูกต้อง, **OUT ไม่ทำให้ติดลบ**
- Low‑Stock = `stock_on_hand < reorder_level`
- Dashboard แสดง Low‑Stock หลายรายการ + Movements ล่าสุดอย่างน้อย 10 รายการ (จาก seed)
- Reorder Suggestion คืนจำนวนแนะนำ (จำนวนเต็ม ≥ 0) พร้อม basis

---

## Non‑Goals (ในเวลาฮัคกาธอน)
- ไม่มีระบบ login/permission จริง (ถ้าไม่ทัน)
- ไม่ทำรายงานเชิงซับซ้อน, กราฟขั้นสูง, หรือ workflow PO เต็มรูปแบบ
- ไม่ต้องมีการแก้ไขย้อนหลัง Movement

---

## Architecture & Codebase
- **Monorepo**: Rails API + Angular App
- **Backend (Rails 7.1.5.2 / Ruby 3.3.3)**  
  - DB: PostgreSQL (`hackaton_project_ai_development` ฯลฯ)  
  - Core gems: `pg`, `puma`, `bootsnap`, `kaminari` (พร้อมใช้)  
  - Dev/Test: `debug`, `rubocop`, `rubocop-rails`, `rspec-rails`  
  - มี Products API (index + filter + sort + paginate, create, update) พร้อม serializer/migrations/seeds
  - มี Stock Movements API + service transaction (IN/OUT, prevents negative) และ serializer
  - Authentication: Devise (JSON-only sessions), Rolify roles (manager/inventory_officer/viewer), CanCanCan abilities
- **Frontend (Angular 17.3 @ stockApp/)**  
  - Key deps: PrimeNG 17.3, PrimeIcons 6, Bootstrap 5.3, Font Awesome 7, RxJS 7.8  
  - AppModule ครอบคลุม Router + Table/Dialog/Dropdown/InputNumber/Toast พร้อม proxy dev server 
  - AppComponent = shell + top navigation (`/dashboard`, `/products`, `/movements`)
  - ProductsPageComponent = Products dashboard (search, low-stock toggle, server sort/paginate, create/edit modal)
  - StockMovementsPageComponent + StockMovementsPanel = IN/OUT form + recent table w/ product filter + toast feedback
  - DashboardPageComponent = Low-stock & recent movement widgets + refresh CTA
- **Tooling & Runtime**  
  - `Procfile.dev`: Rails:3000 + Angular:4200  
  - Dockerfile (multi‑stage) พร้อมรันแบบ non‑root

---

## Data Model (Minimum)
**products**  
- `sku` (uniq, req), `name` (req), `unit`, `reorder_level` (int, default 10), `stock_on_hand` (int, default 0)

**stock_movements**  
- `product_id` (FK), `kind` ("IN"|"OUT"), `quantity` (int > 0), `reference` (str), `moved_at` (datetime)

**Domain Rules**
- บันทึก Movement ทุกครั้งแบบธุรกรรม; **OUT** ที่ทำให้ `stock_on_hand < 0` → ปฏิเสธ
- Low‑Stock เมื่อต่ำกว่า `reorder_level`

---

## API (Target Contract)
`/api/v1/products?low_stock=true|false&query=` — รายการสินค้า, ค้นหา, เฉพาะ low‑stock  
`POST /api/v1/products` — สร้างสินค้าใหม่  
`PUT /api/v1/products/:id` — อัปเดตชื่อ/หน่วย/reorder_level  
`/api/v1/stock_movements?product_id=&limit=20` — ประวัติความเคลื่อนไหวล่าสุด  
`POST /api/v1/stock_movements` — บันทึก IN/OUT (อัปเดตสต็อกแบบอะตอมมิก)  
`GET /api/v1/dashboard/stock` — `{ low_stock: [...], recent_movements: [...] }`  
`POST /api/v1/products/reorder_suggestion` — แนะนำจำนวนสั่งซื้อ (Mock heuristic)  
`POST /api/v1/login` / `DELETE /api/v1/logout` — จัดการ session (JSON)  
`POST /api/v1/register` — สมัครผู้ใช้ใหม่

**Error 422 (format)**
```json
{ "error": { "code": "validation_error", "message": "OUT would go negative", "details": { "stock_on_hand": 2, "request_out": 5 } } }
```

---

## User Stories (ย่อ)
1) **จัดการสินค้า (Products)** — สร้าง/อัปเดตข้อมูลสินค้า; ตารางพร้อมค้นหา + toggle Low‑Stock; SKU ต้องไม่ซ้ำ  
2) **บันทึก IN/OUT (Movements)** — ฟอร์ม IN/OUT + ตารางล่าสุด; อัปเดต `stock_on_hand` และห้ามติดลบ  
3) **แดชบอร์ด (Dashboard)** — วิดเจ็ต Low‑Stock + Recent Movements; ปุ่ม Suggest ต่อสินค้า  
4) **Reorder Suggestion (Mock AI)** — โมดัลแสดงจำนวนแนะนำ + basis แม้ไม่มี OUT ล่าสุด

> ฉบับเต็ม (TH) อยู่ในไฟล์ `Inventory_Low_Stock_User_Stories_TH.md` ที่แนบก่อนหน้า

---

## Setup & Run (Local)
```bash
# API & UI พร้อมกัน
foreman start -f Procfile.dev
# API: http://localhost:3000
# UI : http://localhost:4200
```

> ถ้า API ยังไม่มีตาราง ให้เพิ่ม models/migrations และ seed ตามแผน hackathon

---

## Demo Path (แนะนำ)
0) Login ด้วย Manager (`manager@example.com` / `Password123!`) → session cookie/headers พร้อมเรียก API  
1) เปิด **/products** → ค้นหา SKU/ชื่อ → เปิด toggle Low‑Stock เห็นรายการใกล้หมด  
2) ไป **/movements** → เลือกสินค้าที่ใกล้หมด → ทำ **IN 15** (ref: PO‑1001) → ตารางล่าสุดมีแถวใหม่  
3) กลับ **/products** → สถานะ Low → OK ตามยอดคงเหลือใหม่ + ทดลองปุ่ม **Suggest**  
4) เปิด **/dashboard** → แสดง Low‑Stock + Movements แบบสรุป  
5) ลอง **OUT เกินยอดคงเหลือ** → ได้ Error 422 ชัดเจน

---

## Quality Notes
- มีสถานะ **loading/empty/error** ในแต่ละหน้า
- จัดการ edge cases: OUT ติดลบ, SKU ซ้ำ, ค้นหาแล้วว่างเปล่า
- โค้ดแยกชั้น service/validator/readable naming เพื่อรีวิวง่าย
- UI ซ่อน/disable action ตามบทบาท (manager/officer/viewer) ให้สอดคล้องกับสิทธิ์

---

## Next Steps (หลัง Hackathon)
- เพิ่ม Auth/Role จริง, Reorder Workflow, Charts, Export/Import CSV
- ต่อยอด Mock AI → ต่อ LLM จริงพร้อม caching/logging

---

## Feature Checklist (สำหรับตรวจงานตาม PROJECT_CONTEXT)

### Products (จัดการสินค้า)
- [x] ตารางสินค้า: SKU / Name / Unit / Stock on Hand / Reorder Level / Status (Low|OK) + sort/paginate 10 ต่อหน้า
- [x] ค้นหา SKU/ชื่อ (ทำงานร่วมกับตัวกรองอื่น)
- [x] Toggle “Low‑Stock only” (`stock_on_hand < reorder_level`)
- [x] Badge สถานะ Low/OK แสดงถูกต้อง
- [x] สร้างสินค้าใหม่ (SKU ไม่ซ้ำ, name บังคับ, reorder_level ≥ 0)
- [x] แก้ไขสินค้า: name / unit / reorder_level (ห้ามแก้ Stock on Hand ตรง ๆ)
- [x] แสดง error ชัดเจนเมื่อ SKU ซ้ำ/ฟิลด์ไม่ถูกต้อง
- [x] สถานะ loading/empty/error ครบ

### Stock Movements (IN/OUT)
- [x] ฟอร์ม IN/OUT: product, kind(IN|OUT), quantity>0, reference, moved_at(default=now)
- [x] บันทึก movement แล้วอัปเดต `stock_on_hand` แบบธุรกรรม
- [x] ป้องกัน OUT ติดลบ → ตอบ 422 + ข้อความผิดพลาด
- [x] Recent Movements ≥ 20 แถว: เวลา, สินค้า, ประเภท, จำนวน, reference
- [x] หลัง submit สำเร็จ: เคลียร์ฟอร์ม + รีเฟรช recent และสถานะใน Products
- [x] Toast/snackbar แจ้งผลสำเร็จ/ล้มเหลว

### Dashboard
- [x] Low‑Stock widget: แสดงสินค้าที่ `stock_on_hand < reorder_level` (≥ 5 ถ้ามี)
- [x] Recent Movements widget: แสดง ≥ 10 รายการล่าสุด
- [x] ปุ่ม “Suggest” ต่อสินค้า → เปิดโมดัล Reorder Suggestion
- [x] สถานะ loading/empty/error ครบสอง widget

### Authentication & Roles
- [x] Devise JSON login (`POST /api/v1/login`), logout (`DELETE /api/v1/logout`), register (`POST /api/v1/register`)
- [x] Rolify roles: `manager`, `inventory_officer`, `viewer`
- [x] CanCanCan abilitiesครอบคลุม Products/StockMovements/Dashboard/Suggestion (manager = manage all, inventory_officer = manage movements + suggestions, viewer = read-only)

### Reorder Suggestion (Mock AI)
- [x] `POST /api/v1/products/reorder_suggestion` ด้วย product_id/sku
- [x] โมดัลแสดง: Suggested Quantity (จำนวนเต็ม ≥ 0) + Basis (weekly_out, reorder_level, stock_on_hand)
- [x] ปุ่มปิด/ยกเลิก + disable ระหว่างโหลด
- [x] จัดการข้อผิดพลาด API ชัดเจน
- [x] ปิดโมดัลแล้วไม่แก้ไขข้อมูลจริง

- [x] `GET /products` รองรับ `low_stock`, `query` (JSON ตามสัญญา)
- [x] `POST /products` / `PUT /products/:id` ตรวจ validation + error 422 มาตรฐาน
- [x] `GET /stock_movements` รองรับ `product_id`, `limit` (default 20)
- [x] `POST /stock_movements` ใช้ service; 201 เมื่อสำเร็จ, 422 เมื่อจะติดลบ
- [x] `GET /dashboard/stock` คืน `{ low_stock: [...], recent_movements: [...] }`
- [x] `POST /products/reorder_suggestion` คืน `{ product, suggestion: { quantity }, basis: {...} }`
- [x] Error 422 รูปแบบ:
  ```json
  { "error": { "code": "validation_error", "message": "...", "details": { } } }
  ```

### Validation/Domain Rules
- [x] Product: sku uniq+required, name required, reorder_level ≥ 0, stock_on_hand ≥ 0
- [x] StockMovement: kind ∈ {IN, OUT}, quantity > 0
- [x] ใช้ transaction ครอบ update สต็อก (rollback เมื่อผิดพลาด)
- [x] Index: products.sku(unique), stock_movements.moved_at

### UX/Quality
- [x] Loading/Empty/Error states ครบทุกหน้า
- [x] ฟีดแบ็กผู้ใช้ชัดเจน (toast, error text)
- [x] UI ไม่หน่วงกับ seed data
- [x] โครงสร้างโค้ดอ่านง่าย แยก service/validator

### Seeds & Data
- [x] สินค้า 10–12 รายการ (อย่างน้อย 3–5 รายการ Low‑Stock)
- [x] Movements ~30 รายการใน 14 วันที่ผ่านมา (ผสม IN/OUT)
- [x] Seed idempotent (รันซ้ำได้)
- [x] ผู้ใช้ตัวอย่าง 3 บทบาท (manager/officer/viewer) รหัสเริ่มต้น `Password123!`

### Testing (ขั้นต่ำ)
- [x] Rails service spec: ป้องกัน OUT ติดลบ + อัปเดตยอดถูกต้อง + dashboard snapshot
- [x] Angular unit: แสดง badge “Low” เมื่อ `stock_on_hand < reorder_level` + IN/OUT component + dashboard widgets
- [x] curl/smoke: /products, /stock_movements, /dashboard/stock, /products/reorder_suggestion (`scripts/smoke.sh`)

### Operational Notes & Recent Fixes
- ✅ `POST` จาก Angular ไปยัง `/api/v1/**` เคยโดน `protect_from_forgery` ตัด session ทำให้เรียก Reorder Suggestion แล้วเด้ง 401 แม้ล็อกอินแล้ว → แก้โดย skip CSRF check ใน `Api::V1::BaseController` (session ไม่ถูกรีเซ็ตอีก)
- ⚠️ เครื่องที่ยังเป็น Ruby 2.6 จะรัน `bundle exec` ไม่ได้เพราะ Bundler 2.6 ต้องการ Ruby ≥ 3.1 → ติดตั้ง Ruby 3.3.3 (ดู `.ruby-version`) ก่อน

### Demo Readiness
- [x] เคส Low‑Stock พร้อมโชว์ (seed data + dashboard widget)
- [x] เคส OUT เกินยอดแสดง 422 (service + request spec ครอบคลุม)
- [x] ลำดับเดโม: Products → Movements → Products → Dashboard → Suggest (ดู `README` + บันทึกนี้)
- [ ] ภาพสำรอง 2–3 รูป เผื่อเน็ตช้า
