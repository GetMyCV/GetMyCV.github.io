/**
 * Turns an uploaded image into a small square JPEG data: URL (centre-cropped,
 * 360 px), so it fits comfortably in localStorage and prints sharply at the
 * sizes the templates use.
 */
export async function photoToDataUrl(file: File, size = 360): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file (JPG or PNG).');
  if (file.size > 15 * 1024 * 1024) throw new Error('That image is over 15 MB. Please choose a smaller one.');

  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not process the image.');
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  );
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.86);
}
