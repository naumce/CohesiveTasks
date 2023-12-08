export function togglePagination(total: number | 'none',table?:any) {
    let paginationElement: any = table ?
        table.querySelector(".tabulator-footer")
        : document.querySelector(".tabulator-footer");
    if(!paginationElement) return;

    if (total <= 50 || total === 'none') {
        paginationElement.style.display = 'none';
    } else {
        paginationElement.style.display = 'box';
    }
}