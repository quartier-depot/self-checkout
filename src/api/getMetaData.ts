export function getMetaData(key: string, dto: any): string {
    return dto.meta_data.find((meta: {
        key: string,
        value: string
    }) => meta.key === key)?.value ?? "";
}