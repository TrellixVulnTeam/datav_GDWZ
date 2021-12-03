export function flowDisplay(ctx, node) {
    ctx.beginPath();
    var offsetX = node.rect.width / 8;
    ctx.moveTo(node.rect.x + offsetX, node.rect.y);
    ctx.lineTo(node.rect.ex - offsetX, node.rect.y);
    ctx.bezierCurveTo(node.rect.ex + offsetX / 3, node.rect.y, node.rect.ex + offsetX / 3, node.rect.ey, node.rect.ex - offsetX, node.rect.ey);
    ctx.lineTo(node.rect.x + offsetX, node.rect.ey);
    ctx.lineTo(node.rect.x, node.rect.y + node.rect.height / 2);
    ctx.closePath();
    (node.fillStyle || node.bkType) && ctx.fill();
    ctx.stroke();
}
//# sourceMappingURL=display.js.map