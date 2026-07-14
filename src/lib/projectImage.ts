export async function prepareProjectImage(original: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(original.type)) throw new Error('Choose a JPEG, PNG, or WebP image.')
  if (original.size > 12_000_000) throw new Error('That image is too large. Choose one under 12 MB.')

  const bitmap = await createImageBitmap(original)
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error('We could not prepare that image.')
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86))
  if (!blob || blob.size > 5_000_000) throw new Error('We could not shrink that image enough. Try a smaller one.')
  return new File([blob], `project-${Date.now()}.webp`, { type: 'image/webp' })
}
