export function moveItemInArray<T>(arr: T[], direction: 'up' | 'down', index: number): void {
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= arr.length) return
  const el = arr.splice(index, 1)[0]
  arr.splice(targetIndex, 0, el)
}
