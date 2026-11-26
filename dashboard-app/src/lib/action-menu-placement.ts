/** Open action menus upward for the last two rows to keep them inside scrollable tables. */
export function shouldOpenActionMenuUp(rowIndex: number, rowCount: number): boolean {
  return rowCount > 0 && rowIndex >= rowCount - 2;
}
