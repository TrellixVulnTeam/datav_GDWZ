export function mindLine(ctx, node) {
    ctx.beginPath();
    ctx.moveTo(node.rect.x, node.rect.y + node.rect.height);
    ctx.lineTo(node.rect.x + node.rect.width, node.rect.y + node.rect.height);
    ctx.closePath();
    ctx.stroke();
}
//# sourceMappingURL=mindLine.js.map