export function getMetaData(key: string, dto: any): string {
  if (!dto || !dto.meta_data || !Array.isArray(dto.meta_data)) {
    return '';
  }

  return (
    dto.meta_data.find((meta: { key: string; value: string }) => meta.key === key)?.value ?? ''
  );
}
