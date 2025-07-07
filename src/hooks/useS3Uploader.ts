import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const ACCESS_KEY_ID = import.meta.env.VITE_APP_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = import.meta.env.VITE_APP_SECRET_ACCESS_KEY;
const REGION = import.meta.env.VITE_APP_REGION;
const NAME_BUCKET = import.meta.env.VITE_APP_NAME_BUCKET;


const useS3Uploader = () => {
  const s3 = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });

  const generateRandomString = (length = 6) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // Hàm tạo tên file duy nhất
  const generateUniqueFileName = (originalName: string) => {
    const timestamp = Date.now();
    const randomString = generateRandomString();
    const extension = originalName.substring(originalName.lastIndexOf('.')) || '';
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || 'file';
    return `${baseName}-${timestamp}-${randomString}${extension}`;
  };

  const getPresignedUrl = async (fileName: string, fileType: string): Promise<string> => {
    const sanitizedFileName = fileName.replace(/\s+/g, "");

    const command = new PutObjectCommand({
      Bucket: NAME_BUCKET,
      Key: `uploads/${sanitizedFileName}`,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    return signedUrl;
  };

  const uploadFileToS3 = async (file: File): Promise<string> => {
    const uniqueFileName = generateUniqueFileName(file.name);
    const presignedUrl = await getPresignedUrl(uniqueFileName, file.type);

    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });

    if (response.ok) {
      return presignedUrl.split('?')[0]; 
    } else {
      throw new Error('Failed to upload file to S3');
    }
  };

  const deleteFileFromS3 = async (fileUrl: string): Promise<void> => {
    try {
      // Tách key bằng phần sau domain
      const url = new URL(fileUrl);
      const fileKey = url.pathname.slice(1); // loại bỏ dấu '/' đầu
      console.log('hihi', fileKey)
      const command = new DeleteObjectCommand({
        Bucket: NAME_BUCKET,
        Key: fileKey,
      });

      await s3.send(command);
      console.log('File deleted successfully from S3');
    } catch (error) {
      console.error('Failed to delete file from S3', error);
      throw new Error('Failed to delete file from S3');
    }
  };

  const uploadSvgStringToS3 = async (svgString: string, fileName = 'image.svg'): Promise<string> => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });

    const file = new File([blob], fileName, { type: 'image/svg+xml' });

    const uploadedUrl = await uploadFileToS3(file); // <-- chính là hàm bạn đã có sẵn

    return uploadedUrl; // Đây là một đường dẫn .svg thực sự từ S3
  };

  return { uploadFileToS3, deleteFileFromS3, uploadSvgStringToS3 };
};

export default useS3Uploader;
