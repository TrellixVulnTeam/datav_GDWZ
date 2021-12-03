import { Store } from 'le5le-store';
export function circleSolid(ctx, from, to, size, fillStyle) {
    size += ctx.lineWidth * 3;
    var r = size / 2;
    if (ctx.lineWidth < 2) {
        ctx.lineWidth = 2;
    }
    ctx.translate(to.x, to.y);
    ctx.rotate(Math.atan2(to.y - from.y, to.x - from.x));
    ctx.translate(-to.x, -to.y - ctx.lineWidth / 10);
    ctx.arc(to.x - r - ctx.lineWidth / 2, to.y, r, 0, 2 * Math.PI);
    ctx.stroke();
    if (fillStyle) {
        ctx.fillStyle = fillStyle;
    }
    else {
        ctx.fillStyle = ctx.strokeStyle;
    }
    ctx.fill();
}
export function circle(ctx, from, to, size) {
    circleSolid(ctx, from, to, size, Store.get('LT:bkColor') || '#fff');
}
//# sourceMappingURL=circle.js.map