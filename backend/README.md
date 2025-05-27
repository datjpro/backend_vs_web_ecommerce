# Ecommerce Backend - Microservices Architecture

## 📋 Tổng quan

Backend sử dụng kiến trúc microservices với 12 services độc lập, mỗi service chạy trên port riêng biệt.

## 🚀 Cách chạy tất cả services

### 1. Chạy tất cả services cùng lúc (Recommended)

```bash
# Từ thư mục backend
npm run start-all-dev
```

### 2. Chạy tất cả services (không có màu sắc)

```bash
# Từ thư mục backend
npm run start-all
```

### 3. Chạy bằng file batch (Windows)

```bash
# Từ thư mục backend
start-all.bat
```

### 4. Chạy từng service riêng biệt

```bash
# Service 1: Order Service
cd order-service && node index.js

# Service 2: OrderDetails Service
cd orderDetails-service && node index.js

# Service 3: Product Service
cd product-service && node index.js

# Service 4: User Service
cd user-service && node index.js

# Service 5: Customer Service
cd customer-service && node index.js

# Service 6: Seller Service
cd seller-service && node index.js

# Service 7: Category Service
cd category-service && node index.js

# Service 8: Cart Service
cd cart-service && node index.js

# Service 9: Payment Service
cd payment-service && node index.js

# Service 10: Transport Service
cd transport-service && node index.js

# Service 11: Review Service
cd review-service && node index.js

# Service 12: Discount Service
cd discount-service && node index.js
```

## 🔌 Danh sách Services và Ports

| Service          | Port | Endpoint Base                          | Mô tả             |
| ---------------- | ---- | -------------------------------------- | ----------------- |
| **Order**        | 4000 | http://localhost:4000/api/order        | Quản lý đơn hàng  |
| **OrderDetails** | 4001 | http://localhost:4001/api/orderDetails | Chi tiết đơn hàng |
| **Discount**     | 4002 | http://localhost:4002/api/discount     | Mã giảm giá       |
| **Product**      | 4003 | http://localhost:4003/api/product      | Sản phẩm          |
| **Review**       | 4004 | http://localhost:4004/api/review       | Đánh giá          |
| **User**         | 4005 | http://localhost:4005/api/user         | Người dùng        |
| **Category**     | 3001 | http://localhost:3001/api/category     | Danh mục          |
| **Customer**     | 3002 | http://localhost:3002/api/customer     | Khách hàng        |
| **Cart**         | 3003 | http://localhost:3003/api/cart         | Giỏ hàng          |
| **Transport**    | 3005 | http://localhost:3005/api/transport    | Vận chuyển        |
| **Seller**       | 3006 | http://localhost:3006/api/seller       | Người bán         |
| **Payment**      | 3007 | http://localhost:3007/api/payment      | Thanh toán        |

## 📝 Các API Endpoints chính

### Order Service (Port 4000)

```
POST   /api/order/create           - Tạo đơn hàng mới
GET    /api/order/user/{userId}    - Lấy đơn hàng theo user
GET    /api/order/all              - Lấy tất cả đơn hàng
GET    /api/order/{id}             - Lấy đơn hàng theo ID
PUT    /api/order/update/{id}      - Cập nhật đơn hàng
DELETE /api/order/delete/{id}      - Xóa đơn hàng
```

### OrderDetails Service (Port 4001)

```
POST   /api/orderDetails/create                    - Tạo chi tiết đơn hàng
GET    /api/orderDetails/all                       - Lấy tất cả chi tiết đơn hàng
GET    /api/orderDetails/seller/{sellerId}         - Lấy theo seller
GET    /api/orderDetails/user/{userId}             - Lấy theo user
GET    /api/orderDetails/customer/{customerId}     - Lấy theo customer
PUT    /api/orderDetails/update/{id}               - Cập nhật trạng thái
DELETE /api/orderDetails/delete/{id}               - Xóa chi tiết đơn hàng
```

### Product Service (Port 4003)

```
GET    /api/product/all            - Lấy tất cả sản phẩm
GET    /api/product/{id}           - Lấy sản phẩm theo ID
POST   /api/product/create         - Tạo sản phẩm mới
PUT    /api/product/update/{id}    - Cập nhật sản phẩm
DELETE /api/product/delete/{id}    - Xóa sản phẩm
```

### User Service (Port 4005)

```
POST   /api/user/register          - Đăng ký user
POST   /api/user/login             - Đăng nhập
GET    /api/user/profile           - Lấy thông tin profile
PUT    /api/user/update            - Cập nhật profile
```

## 🛠 Cài đặt và Khởi tạo

### 1. Cài đặt dependencies

```bash
# Từ thư mục backend
npm install

# Hoặc cài đặt cho từng service
cd order-service && npm install
cd ../orderDetails-service && npm install
# ... tiếp tục cho các service khác
```

### 2. Cấu hình environment variables

Tạo file `.env` trong mỗi service hoặc sử dụng file `.env` chung:

```env
MONGODB_URI=mongodb+srv://admin:ecommerceshopee@cluster0.q3i7p88.mongodb.net/ecommerce
JWT_SECRET=mySuperSecretKey123
PORT=4000
```

### 3. Kiểm tra kết nối database

Tất cả services sử dụng cùng một MongoDB database nhưng có thể có collections riêng biệt.

## 🧪 Testing với Postman

### 1. Test Order Service

```
GET http://localhost:4000/api/order/user/6821d8beac81a5ddf96daf0b
```

### 2. Test OrderDetails Service

```
GET http://localhost:4001/api/orderDetails/seller/681f0f9817c3229963b3a4f1
```

### 3. Test Product Service

```
GET http://localhost:4003/api/product/all
```

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **Port đã được sử dụng:**

   ```bash
   netstat -ano | findstr :4000
   taskkill /PID <PID> /F
   ```

2. **MongoDB connection failed:**

   - Kiểm tra connection string
   - Đảm bảo network access trong MongoDB Atlas

3. **Service không start:**
   - Kiểm tra file `index.js` trong từng service
   - Kiểm tra dependencies đã được cài đặt

### MongoDB Warnings (có thể bỏ qua):

```
useNewUrlParser và useUnifiedTopology đã deprecated
Cloudinary circular dependency warnings
```

## 📦 Package Scripts

```json
{
  "scripts": {
    "start": "node index.js",
    "start-all-dev": "concurrently với tất cả services",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## 🌟 Architecture Overview

```
Frontend (React/Vue)
    ↓
Backend Gateway/Proxy (Optional)
    ↓
┌─────────────────────────────────────────┐
│           Microservices                 │
├─────────────────────────────────────────┤
│ Order(4000) ←→ OrderDetails(4001)       │
│ Product(4003) ←→ Category(3001)         │
│ User(4005) ←→ Customer(3002)            │
│ Cart(3003) ←→ Payment(3007)             │
│ Seller(3006) ←→ Transport(3005)         │
│ Review(4004) ←→ Discount(4002)          │
└─────────────────────────────────────────┘
    ↓
MongoDB Atlas Database
```

## 📝 Notes

- Tất cả services sử dụng Express.js
- Database: MongoDB Atlas
- Authentication: JWT Token
- File upload: Cloudinary (cho một số services)
- CORS enabled cho frontend integration

---

**📧 Contact:** Your contact information
**📅 Last updated:** May 26, 2025
