// Cloudinary utility functions
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;
const CLOUDINARY_API_URL = import.meta.env.VITE_CLOUDINARY_API_URL;
const CLOUDINARY_API_VERSION = import.meta.env.VITE_CLOUDINARY_API_VERSION;

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  etag: string;
  placeholder?: boolean;
  resource_type: string;
  type: string;
  version: number;
  version_id: string;
}

export interface CloudinaryError {
  message: string;
  http_code?: number;
}

class CloudinaryService {
  private readonly cloudName: string;
  private readonly uploadPreset: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly apiUrl: string;
  private readonly apiVersion: string;

  constructor() {
    if (!CLOUDINARY_CLOUD_NAME) {
      throw new Error('VITE_CLOUDINARY_CLOUD_NAME is required');
    }
    if (!CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('VITE_CLOUDINARY_UPLOAD_PRESET is required');
    }

    this.cloudName = CLOUDINARY_CLOUD_NAME;
    this.uploadPreset = CLOUDINARY_UPLOAD_PRESET;
    this.apiKey = CLOUDINARY_API_KEY || '';
    this.apiSecret = CLOUDINARY_API_SECRET || '';
    this.apiUrl = CLOUDINARY_API_URL;
    this.apiVersion = CLOUDINARY_API_VERSION;
  }

  private getApiUrl(): string {
    return `${this.apiUrl}/${this.apiVersion}/${this.cloudName}`;
  }

  /**
   * Upload ảnh lên Cloudinary
   * @param file - File object hoặc base64 string
   * @param folder - Folder trên Cloudinary (optional)
   * @param tags - Tags cho ảnh (optional)
   * @returns Promise<CloudinaryUploadResponse>
   */
  async uploadImage(
    file: File | string,
    folder?: string,
    tags?: string[]
  ): Promise<CloudinaryUploadResponse> {
    try {
      const formData = new FormData();
      
      if (typeof file === 'string') {
        formData.append('file', file);
      } else {
        formData.append('file', file);
      }
      
      formData.append('upload_preset', this.uploadPreset);
      
      if (folder) {
        formData.append('folder', folder);
      }
      
      if (tags && tags.length > 0) {
        formData.append('tags', tags.join(','));
      }

      // Tạo tên file unique nếu là File object
      if (file instanceof File) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const originalName = file.name.split('.')[0];
        const uniqueName = `${originalName}_${timestamp}_${randomString}`;
        formData.append('public_id', uniqueName);
      }

      const response = await fetch(
        `${this.getApiUrl()}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const result: CloudinaryUploadResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Upload failed'
      );
    }
  }

  /**
   * Xóa ảnh từ Cloudinary
   * @param publicId - Public ID của ảnh trên Cloudinary
   * @returns Promise<boolean>
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      if (!this.apiKey || !this.apiSecret) {
        console.warn('API Key và API Secret cần thiết để xóa ảnh');
        return false;
      }

      // Tạo signature cho delete request
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = await this.generateSignature({
        public_id: publicId,
        timestamp: timestamp.toString(),
      });

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', this.apiKey);
      formData.append('signature', signature);

      const response = await fetch(
        `${this.getApiUrl()}/image/destroy`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Delete failed');
      }

      const result = await response.json();
      return result.result === 'ok';
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return false;
    }
  }

  /**
   * Lấy URL ảnh với transformation
   * @param publicId - Public ID của ảnh
   * @param transformations - Các transformation (optional)
   * @returns string - URL của ảnh
   */
  getImageUrl(
    publicId: string,
    transformations?: {
      width?: number;
      height?: number;
      crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'limit' | 'mfit' | 'pad';
      quality?: 'auto' | number;
      format?: 'auto' | 'jpg' | 'png' | 'webp' | 'gif';
      gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
    }
  ): string {
    let transformationString = '';
    
    if (transformations) {
      const params: string[] = [];
      
      if (transformations.width) params.push(`w_${transformations.width}`);
      if (transformations.height) params.push(`h_${transformations.height}`);
      if (transformations.crop) params.push(`c_${transformations.crop}`);
      if (transformations.quality) params.push(`q_${transformations.quality}`);
      if (transformations.format) params.push(`f_${transformations.format}`);
      if (transformations.gravity) params.push(`g_${transformations.gravity}`);
      
      if (params.length > 0) {
        transformationString = `/${params.join(',')}`;
      }
    }

    return `https://res.cloudinary.com/${this.cloudName}/image/upload${transformationString}/${publicId}`;
  }

  /**
   * Lấy URL ảnh với kích thước cụ thể cho avatar
   * @param publicId - Public ID của ảnh
   * @param size - Kích thước (default: 150)
   * @returns string - URL của ảnh avatar
   */
  getAvatarUrl(publicId: string, size: number = 150): string {
    const config = {
      width: size,
      height: size,
      crop: 'fill' as const,
      gravity: 'face' as const,
      quality: 'auto' as const,
      format: 'auto' as const
    };
    
    return this.getImageUrl(publicId, config);
  }

  /**
   * Extract public_id từ Cloudinary URL
   * @param url - Cloudinary URL
   * @returns string - Public ID
   */
  extractPublicId(url: string): string {
    try {
      const regex = /\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp|svg)$/i;
      const match = url.match(regex);
      return match ? match[1] : '';
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return '';
    }
  }

  /**
   * Tạo signature cho API request (cần API Secret)
   * @private
   */
  private async generateSignature(params: Record<string, string>): Promise<string> {
    // Sắp xếp parameters theo alphabet
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    const stringToSign = `${sortedParams}${this.apiSecret}`;
    
    // Sử dụng Web Crypto API để tạo SHA1 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService();

// Export hook để sử dụng trong React components
export const useCloudinary = () => {
  return {
    uploadImage: cloudinaryService.uploadImage.bind(cloudinaryService),
    deleteImage: cloudinaryService.deleteImage.bind(cloudinaryService),
    getImageUrl: cloudinaryService.getImageUrl.bind(cloudinaryService),
    getAvatarUrl: cloudinaryService.getAvatarUrl.bind(cloudinaryService),
    extractPublicId: cloudinaryService.extractPublicId.bind(cloudinaryService),
  };
}; 