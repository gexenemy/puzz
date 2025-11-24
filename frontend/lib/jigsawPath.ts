// Генерация SVG path для одного пазла со случайными ушками/tab-blank.
// Синхронно на фронте не генерируем — путь приходит с бэка.
// Но тут оставлен helper для потенциальной локальной валидации/отрисовки.


export function pathToCanvas(ctx: CanvasRenderingContext2D, path: string) {
    const p = new Path2D(path)
    ctx.stroke(p)
}