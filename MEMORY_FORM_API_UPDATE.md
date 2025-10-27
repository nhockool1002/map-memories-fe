# Cập nhật Memory Form để sử dụng API Memory-Location mới

## Tổng quan

Đã cập nhật MemoryForm để sử dụng API memory-location mới thay vì API cũ. API mới cho phép tạo memory và location cùng lúc với khả năng upload tối đa 5 hình ảnh.

## Các thay đổi chính

### 1. Types mới trong `src/types/api.ts`

- `MemoryImage`: Interface cho hình ảnh memory
- `CreateMemoryLocationRequest`: Request tạo memory và location
- `UpdateMemoryLocationRequest`: Request cập nhật memory và location  
- `MemoryLocationResponse`: Response từ API mới

### 2. API methods mới trong `src/lib/api.ts`

- `createMemoryLocation()`: Tạo memory và location cùng lúc
- `getMemoryLocationDetail()`: Lấy chi tiết memory với location
- `updateMemoryLocation()`: Cập nhật memory và location
- `deleteMemoryLocation()`: Xóa memory (sẽ xóa luôn location và images)
- `fileToBase64()`: Helper convert file thành base64

### 3. MemoryForm được cập nhật hoàn toàn

#### Schema validation mới:
```typescript
const memorySchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(255, 'Tiêu đề quá dài'),
  location_name: z.string().min(1, 'Tên địa điểm không được để trống'),
  location_description: z.string().optional(),
  latitude: z.string().min(1, 'Vĩ độ không được để trống'),
  longitude: z.string().min(1, 'Kinh độ không được để trống'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  content: z.string().min(1, 'Nội dung không được để trống'),
  visit_date: z.string().optional(),
  tags: z.array(z.string()).default([]),
  is_public: z.boolean().default(false),
  marker_item: z.number().optional(),
});
```

#### Các trường mới trong form:
- **Tên địa điểm**: Input cho tên location
- **Mô tả địa điểm**: Textarea cho mô tả location
- **Vĩ độ/Kinh độ**: Hidden fields - tự động lấy từ preselectedLocation
- **Địa chỉ**: Input cho địa chỉ chi tiết
- **Thành phố/Quốc gia**: Input cho thông tin địa lý

#### Tọa độ tự động:
- Các trường latitude/longitude được ẩn khỏi form
- Giá trị tọa độ được tự động lấy từ `preselectedLocation`
- Hiển thị tọa độ đã chọn trong ô xanh ở đầu form
- Validation cho tọa độ được bỏ qua khi có preselectedLocation
- **Giới hạn số chữ số thập phân**: Latitude và longitude được format với `.toFixed(6)` để phù hợp với validation của API (tối đa 10-11 chữ số)

#### Upload hình ảnh:
- Giới hạn tối đa 5 hình ảnh
- Chỉ hỗ trợ file hình ảnh (JPG, PNG, GIF)
- Convert file thành base64 trước khi gửi
- Hiển thị số lượng ảnh đã chọn (x/5)

### 4. Trang test

Tạo 2 trang test để kiểm tra:
- `/test-memory-form`: Test form cơ bản
- `/test-memory-form-with-location`: Test form với preselected location

### 5. Sửa lỗi TypeScript

- Cập nhật `UserItemsDisplay` để hỗ trợ cả `UserItem` và `UserShopItem`
- Sửa `Button` component để tránh conflict với Framer Motion
- Sửa login requests trong test pages để sử dụng `username` thay vì `email`

### 6. Tính năng Marker Detail với Modal

Tạo tính năng mới cho phép click vào marker trên map để mở popup với form tạo/chỉnh sửa kỷ niệm:

#### MemoryModal Component:
- Modal component để hiển thị form tạo kỷ niệm
- Hỗ trợ cả tạo mới và chỉnh sửa kỷ niệm
- Tự động đổ dữ liệu từ marker được chọn vào form
- Tích hợp marker selection cho địa điểm

#### Cập nhật LeafletMap:
- Thêm nút "Thêm kỷ niệm" trong popup của location markers
- Thêm nút "Chỉnh sửa" trong popup của memory markers
- Tự động mở MemoryModal khi click vào các nút này
- Truyền dữ liệu location/memory vào form

#### Tính năng chính:
- **Click marker location**: Mở popup với thông tin địa điểm và nút "Thêm kỷ niệm"
- **Click marker memory**: Mở popup với thông tin kỷ niệm và nút "Chỉnh sửa"
- **Form tự động điền**: Dữ liệu từ marker được đổ vào form
- **Marker selection**: Tự động tích vào marker đang được chọn
- **Update marker**: Khi submit sẽ update lại marker đó

#### Trang test mới:
- `/test-map-memory-modal`: Trang test để kiểm tra tính năng marker detail với modal

## So sánh API cũ và mới

### API CŨ:
```typescript
// Tạo location trước
const location = await apiClient.createLocation(locationData);

// Sau đó tạo memory
const memory = await apiClient.createMemory({
  title: "Kỷ niệm",
  content: "Nội dung",
  location_id: location.id,
  // ...
});

// Upload media riêng biệt
await apiClient.uploadMedia(memory.id, file);
```

### API MỚI:
```typescript
// Tạo memory và location cùng lúc
const memory = await apiClient.createMemoryLocation({
  // Location fields
  location_name: "Hồ Hoàn Kiếm",
  latitude: "21.0285",
  longitude: "105.8542",
  // ...
  
  // Memory fields
  title: "Kỷ niệm",
  content: "Nội dung",
  // ...
  
  // Images
  images: [
    {
      image_base64: "data:image/jpeg;base64,...",
      caption: "Hình ảnh",
      order: 0
    }
  ]
});
```

## Lợi ích của API mới

1. **Đơn giản hóa**: Chỉ cần 1 API call thay vì 3-4 calls
2. **Hiệu suất tốt hơn**: Giảm số lượng request
3. **Tính nhất quán**: Memory và location được tạo cùng lúc
4. **Upload hình ảnh tích hợp**: Không cần upload riêng biệt
5. **Validation đầy đủ**: Validation cho tất cả fields

## Cách sử dụng

### Tạo memory mới:
```typescript
const memory = await apiClient.createMemoryLocation({
  location_name: "Hồ Hoàn Kiếm",
  latitude: "21.0285", 
  longitude: "105.8542",
  title: "Kỷ niệm đẹp",
  content: "Nội dung kỷ niệm",
  images: [
    {
      image_base64: "data:image/jpeg;base64,...",
      caption: "Hình ảnh",
      order: 0
    }
  ]
});
```

### Cập nhật memory:
```typescript
const updatedMemory = await apiClient.updateMemoryLocation(memoryId, {
  title: "Tiêu đề mới",
  content: "Nội dung mới",
  images: [
    {
      image_base64: "data:image/jpeg;base64,...",
      caption: "Hình ảnh mới",
      order: 0
    }
  ]
});
```

## Lưu ý quan trọng

1. **UUID**: API mới không trả về uuid, chỉ trả về id
2. **Base64**: Hình ảnh được lưu dưới dạng base64 trong database
3. **Validation**: Tối đa 5 hình ảnh, mỗi file tối đa 50MB
4. **Xóa**: Khi xóa memory sẽ xóa luôn location và tất cả images
5. **Backward compatibility**: Form vẫn trả về Memory object để tương thích với code cũ

## Testing

Để test API mới:

1. Truy cập `/test-memory-form` để test form cơ bản
2. Truy cập `/test-memory-form-with-location` để test với preselected location
3. Kiểm tra console để xem response từ API
4. Verify rằng memory và location được tạo thành công
5. Kiểm tra hình ảnh được upload đúng cách

## Build Status

✅ **Build thành công** - Tất cả TypeScript errors đã được sửa và project build thành công.

## Files đã được cập nhật

1. `src/types/api.ts` - Thêm types mới cho API memory-location
2. `src/lib/api.ts` - Thêm API methods mới và helper function
3. `src/components/memories/MemoryForm.tsx` - Cập nhật hoàn toàn để sử dụng API mới
4. `src/app/memories/create/page.tsx` - Cập nhật handleSuccess
5. `src/components/ui/UserItemsDisplay.tsx` - Hỗ trợ UserShopItem
6. `src/components/ui/Button.tsx` - Sửa conflict với Framer Motion
7. `src/app/test-auth/page.tsx` - Sửa login request
8. `src/app/test-flow/page.tsx` - Sửa login request
9. `src/components/memories/MemoryModal.tsx` - Tạo modal component mới
10. `src/components/map/LeafletMap.tsx` - Cập nhật để sử dụng MemoryModal
11. `src/components/map/Map.tsx` - Thêm prop onMemoryUpdated
12. `src/app/page.tsx` - Sửa MemoryModal usage
13. `src/components/map/MapboxMap.tsx` - Sửa MemoryModal usage
14. Tạo trang test mới: `/test-memory-form`, `/test-memory-form-with-location`, `/test-map-memory-modal` 