const MAX_DIMENSION = 1280; // Max width/height for images
const JPEG_QUALITY = 0.75; // 75% quality for compression

export const optimizeAndConvertToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = error => reject(error);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onerror = error => reject(error);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            if (width > height) {
                if (width > MAX_DIMENSION) {
                    height = Math.round(height * (MAX_DIMENSION / width));
                    width = MAX_DIMENSION;
                }
            } else {
                if (height > MAX_DIMENSION) {
                    width = Math.round(width * (MAX_DIMENSION / height));
                    height = MAX_DIMENSION;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              return reject(new Error('Could not get canvas context'));
            }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
        };
    };
  });