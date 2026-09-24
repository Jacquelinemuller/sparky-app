// imageUtils.js - Compresión de imágenes antes de guardarlas en localStorage

const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const QUALITY = 0.75; // Calidad JPG (0-1)

/**
 * Comprime una imagen (File) y devuelve una promesa con el base64 resultante.
 * Redimensiona si supera el máximo y comprime en JPG.
 */
export function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No hay archivo'));
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo no es una imagen'));
      return;
    }

    // Límite inicial (antes de comprimir) — 10MB
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('La imagen es muy pesada (máx 10MB)'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Calcular nuevas dimensiones manteniendo proporción
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Crear canvas para redibujar
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Fondo blanco (por si la imagen tiene transparencia)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a JPG base64
        try {
          const base64 = canvas.toDataURL('image/jpeg', QUALITY);
          resolve(base64);
        } catch (err) {
          reject(new Error('Error al comprimir la imagen'));
        }
      };

      img.onerror = () => reject(new Error('No se pudo leer la imagen'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Devuelve el peso aproximado en KB de un base64
 */
export function getBase64SizeKb(base64) {
  if (!base64) return 0;
  // Aprox: base64 pesa ~33% más que el binario
  const base64Length = base64.length - (base64.indexOf(',') + 1);
  const padding = (base64.charAt(base64.length - 2) === '=' ? 2 : base64.charAt(base64.length - 1) === '=' ? 1 : 0);
  const sizeInBytes = (base64Length * 3) / 4 - padding;
  return Math.round(sizeInBytes / 1024);
}
