# Map Memories - Ứng dụng Lưu giữ Kỷ niệm trên Bản đồ

Map Memories là một ứng dụng web được xây dựng bằng NextJS cho phép người dùng lưu giữ và chia sẻ những kỷ niệm của họ trên bản đồ. Ứng dụng hỗ trợ đánh dấu địa điểm, viết bài kỷ niệm, upload media và tương tác với bản đồ.

## 🌟 Tính năng chính

- ✅ **Authentication**: Đăng ký, đăng nhập, quản lý profile
- ✅ **Interactive Map**: Sử dụng OpenStreetMap/Leaflet
- ✅ **Memory Management**: Tạo, chỉnh sửa, xóa kỷ niệm
- ✅ **Location Marking**: Đánh dấu và quản lý địa điểm
- ✅ **Media Upload**: Upload hình ảnh và video
- ✅ **Responsive Design**: Mobile-first, tối ưu cho mọi thiết bị
- ✅ **Search & Filter**: Tìm kiếm và lọc kỷ niệm
- ✅ **Animations**: Smooth transitions với Framer Motion

## 🛠 Công nghệ sử dụng

- **Framework**: NextJS 14 với App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS với custom theme xanh lá gradient
- **Map**: React-Leaflet với OpenStreetMap
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 🚀 Cài đặt và Chạy

### Yêu cầu hệ thống

- Node.js 18.x hoặc mới hơn
- npm hoặc yarn
- API Backend đang chạy trên `http://localhost:8222`

### Bước 1: Clone repository

```bash
git clone <your-repo-url>
cd map-memories
```

### Bước 2: Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

### Bước 3: Cấu hình environment

Tạo file `.env.local` trong thư mục root:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8222/api/v1

# App Configuration
NEXT_PUBLIC_APP_NAME="Map Memories"
NEXT_PUBLIC_APP_DESCRIPTION="Lưu giữ kỷ niệm trên bản đồ"
```

### Bước 4: Chạy development server

```bash
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

### Bước 5: Build cho production

```bash
npm run build
npm run start
# hoặc
yarn build
yarn start
```

## 📱 Thiết kế Responsive

Ứng dụng được thiết kế theo nguyên tắc **mobile-first**:

- **Mobile (< 640px)**: Layout 1 cột, navigation drawer
- **Tablet (640px - 1024px)**: Layout linh hoạt, responsive grid
- **Desktop (> 1024px)**: Layout 3 cột, full navigation

### Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

## 🎨 Design System

### Color Palette

Ứng dụng sử dụng theme màu xanh lá gradient:

```css
Primary Colors:
- primary-50: #f0fdf4   (Lightest)
- primary-500: #22c55e  (Base)
- primary-900: #14532d  (Darkest)

Gradients:
- gradient-primary: Linear gradient từ tối đến sáng
- gradient-dark: Gradient tối cho background
```

### Typography

- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive scaling từ mobile đến desktop

### Components

- **Button**: 4 variants (primary, secondary, ghost, danger)
- **Form**: Consistent styling với focus states
- **Card**: Shadow effects và hover animations
- **Loading**: Spinner với text support

## 🗺 Tích hợp API

Ứng dụng tích hợp với Map Memories API backend:

### API Client

```typescript
// src/lib/api.ts
import apiClient from '@/lib/api';

// Authentication
await apiClient.login({ email, password });
await apiClient.register({ username, email, password });

// Memories
await apiClient.getMemories({ page: 1, limit: 20 });
await apiClient.createMemory(memoryData);

// Locations
await apiClient.getLocations();
await apiClient.searchNearbyLocations({ lat, lng, radius });

// Media
await apiClient.uploadMedia(memoryId, file);
```

### Error Handling

API client tự động xử lý:
- Token refresh
- Error notifications
- Network timeouts
- Validation errors

## 🔧 Cấu trúc Project

```
src/
├── app/                    # NextJS App Router
│   ├── auth/              # Authentication pages
│   ├── memories/          # Memory management pages
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/             # Auth related components
│   ├── layout/           # Layout components
│   ├── map/              # Map components
│   ├── memories/         # Memory components
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and API client
├── styles/               # Global styles and CSS
└── types/                # TypeScript type definitions
```

## 🧩 Components chính

### Map Component

```typescript
<Map
  locations={locations}
  memories={memories}
  onLocationClick={handleLocationClick}
  onMapClick={handleMapClick}
  height="h-96"
/>
```

### Memory Form

```typescript
<MemoryForm
  memory={existingMemory}
  onSuccess={handleSuccess}
  onCancel={handleCancel}
  preselectedLocation={location}
/>
```

### Navigation

```typescript
<Navigation />
// Tự động responsive với mobile drawer
```

## 📊 Performance Optimizations

- **Dynamic Imports**: Map components load client-side only
- **Image Optimization**: NextJS Image component
- **Bundle Splitting**: Automatic code splitting
- **Caching**: API responses cached appropriately
- **Lazy Loading**: Components load on demand

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Zod schema validation
- **XSS Protection**: Sanitized inputs
- **CSRF Protection**: Secure cookies
- **File Upload Validation**: Size and type checks

## 🧪 Development

### Code Structure

- **TypeScript**: Type-safe development
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks (if configured)

### Custom Hooks

```typescript
// Authentication
const { user, login, logout, isAuthenticated } = useAuth();

// Loading states
const [loading, setLoading] = useState(false);
```

### Utilities

```typescript
// API client singleton
import apiClient from '@/lib/api';

// Type definitions
import { Memory, Location, User } from '@/types/api';
```

## 📝 API Endpoints

Ứng dụng tương tác với các endpoints sau:

- **Auth**: `/auth/login`, `/auth/register`, `/auth/profile`
- **Memories**: `/memories`, `/memories/{uuid}`
- **Locations**: `/locations`, `/locations/nearby`
- **Media**: `/media/upload`, `/media/{uuid}/file`

## 🌐 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables

Production cần các biến môi trường:

- `NEXT_PUBLIC_API_BASE_URL`: URL của backend API
- `NEXT_PUBLIC_APP_NAME`: Tên ứng dụng
- `NEXT_PUBLIC_APP_DESCRIPTION`: Mô tả ứng dụng

## 🐛 Troubleshooting

### Common Issues

1. **Map không hiển thị**
   - Kiểm tra network requests đến OpenStreetMap
   - Đảm bảo dynamic import hoạt động đúng

2. **API calls fail**
   - Kiểm tra backend server đang chạy
   - Verify CORS settings

3. **Build errors**
   - Clear `.next` folder và rebuild
   - Kiểm tra TypeScript errors

### Debug Mode

```bash
# Enable debug logs
DEBUG=* npm run dev

# Check network in DevTools
# Inspect Console for errors
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra documentation này
2. Search existing issues
3. Create new issue với detailed information

---

**Map Memories** - Lưu giữ kỷ niệm, chia sẻ câu chuyện 🗺️❤️