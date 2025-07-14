# Cloudinary Utility - Hướng dẫn sử dụng

## Cấu hình môi trường

Trước khi sử dụng, cần thêm các biến môi trường sau vào file `.env`:

```bash
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_CLOUDINARY_API_KEY=your_api_key (optional - chỉ cần cho delete)
VITE_CLOUDINARY_API_SECRET=your_api_secret (optional - chỉ cần cho delete)
```

**Lưu ý**: 
- `CLOUD_NAME` và `UPLOAD_PRESET` là bắt buộc cho upload
- `API_KEY` và `API_SECRET` chỉ cần khi muốn xóa ảnh

## Cách sử dụng

### 1. Import hook

```typescript
import { useCloudinary } from '@/utils/Cloudinary';
```

### 2. Trong component

```typescript
const YourComponent = () => {
  const { uploadImage, deleteImage, getImageUrl, getAvatarUrl, extractPublicId } = useCloudinary();

  // Upload ảnh
  const handleUpload = async (file: File) => {
    try {
      const result = await uploadImage(
        file,
        'avatars', // folder (optional)
        ['user_avatar', 'profile'] // tags (optional)
      );
      
      console.log('Upload success:', result.secure_url);
      console.log('Public ID:', result.public_id);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Xóa ảnh
  const handleDelete = async (publicId: string) => {
    try {
      const success = await deleteImage(publicId);
      if (success) {
        console.log('Delete success');
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Lấy URL ảnh với transformation
  const imageUrl = getImageUrl('your_public_id', {
    width: 300,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });

  // Lấy URL avatar
  const avatarUrl = getAvatarUrl('your_public_id', 150); // size 150x150

  // Extract public_id từ URL
  const publicId = extractPublicId('https://res.cloudinary.com/...');

  return (
    // Your JSX
  );
};
```

### 3. Ví dụ upload trong form

```typescript
const UploadForm = () => {
  const { uploadImage } = useCloudinary();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) return;

    setUploading(true);
    try {
      const result = await uploadImage(imageFile, 'products');
      setImageUrl(result.secure_url);
      toast.success('Upload thành công!');
    } catch (error) {
      toast.error('Upload thất bại!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
      />
      <button type="submit" disabled={!imageFile || uploading}>
        {uploading ? 'Đang upload...' : 'Upload'}
      </button>
      
      {imageUrl && (
        <img src={imageUrl} alt="Uploaded" style={{ width: 200 }} />
      )}
    </form>
  );
};
```

## API Reference

### `uploadImage(file, folder?, tags?)`
- **file**: File object hoặc base64 string
- **folder**: Thư mục trên Cloudinary (optional)
- **tags**: Array các tag (optional)
- **Returns**: Promise<CloudinaryUploadResponse>

### `deleteImage(publicId)`
- **publicId**: Public ID của ảnh trên Cloudinary
- **Returns**: Promise<boolean>

### `getImageUrl(publicId, transformations?)`
- **publicId**: Public ID của ảnh
- **transformations**: Object chứa các transformation (optional)
- **Returns**: string - URL của ảnh

### `getAvatarUrl(publicId, size?)`
- **publicId**: Public ID của ảnh
- **size**: Kích thước (default: 150)
- **Returns**: string - URL avatar với crop face

### `extractPublicId(url)`
- **url**: Cloudinary URL
- **Returns**: string - Public ID

## Transformations được hỗ trợ

```typescript
interface Transformations {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'limit' | 'mfit' | 'pad';
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'gif';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
}
```

## Đã áp dụng vào

- ✅ Modal Update Profile (`/src/partials/modals/profile/ModalUpdateProfile.tsx`)
  - Upload avatar của user
  - Tự động xóa ảnh cũ khi upload ảnh mới
  - Hiển thị avatar với transformation phù hợp

## Lưu ý

1. **Upload Preset**: Cần tạo upload preset trên Cloudinary dashboard với cấu hình phù hợp
2. **Signed Upload**: Để xóa ảnh cần API Key và Secret
3. **Error Handling**: Luôn wrap trong try-catch khi sử dụng
4. **File Size**: Cloudinary có giới hạn file size, nên validate trước khi upload
5. **Security**: Không expose API Secret trên frontend, chỉ dùng cho delete operation 