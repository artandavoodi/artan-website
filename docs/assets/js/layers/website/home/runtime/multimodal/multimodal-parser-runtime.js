/* =============================================================================
   MULTIMODAL PARSER RUNTIME
============================================================================= */

export function classifyHomeMultimodalFile(file) {
  const type = String(file?.type || '').toLowerCase();

  if (type.startsWith('image/')) {
    return 'image';
  }

  if (type.startsWith('audio/')) {
    return 'audio';
  }

  if (type.includes('pdf')) {
    return 'pdf';
  }

  if (
    type.includes('json') ||
    type.includes('javascript') ||
    type.includes('typescript') ||
    type.includes('text')
  ) {
    return 'text';
  }

  return 'unknown';
}

export async function parseHomeMultimodalFile(file) {
  const category = classifyHomeMultimodalFile(file);

  return {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    type: file.type,
    category,
    lastModified: file.lastModified,
    file
  };
}
