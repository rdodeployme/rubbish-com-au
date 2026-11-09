// Copied from the Base44 app. Wheelie bin row drawing, black bins on a dotted ground line.
export default function WheelieDrawing({ count, binSize }) {
  const isLarge = binSize === 660 || binSize === 1100;
  const heights = { 120: 70, 240: 92, 360: 104, 660: 120, 1100: 132 };
  const h = heights[binSize];
  const w = isLarge ? h * 1.25 : h * 0.62;
  const gap = 10;
  const maxPerRow = isLarge ? 8 : 14;
  const maxRows = 2;
  const drawCount = Math.min(count, maxPerRow * maxRows);
  const rows = [];
  let rem = drawCount;
  for (let r = 0; r < maxRows && rem > 0; r++) {
    const inRow = Math.min(maxPerRow, rem);
    rows.push(inRow);
    rem -= inRow;
  }
  const extra = count - drawCount;
  const fullRowW = maxPerRow * w + (maxPerRow - 1) * gap;
  const scale = fullRowW > 740 ? 740 / fullRowW : 1;
  const sw = w * scale, sh = h * scale, sg = gap * scale;
  const groundY = 282;

  function BinShape({ x, baseline }) {
    const y = baseline - sh;
    const lidH = Math.max(3, sh * 0.08);
    const stripeH = Math.max(3, sh * 0.1);
    const stripeY = y + sh * 0.22;
    const wheelR = Math.max(3, sh * 0.07);
    return (
      <g>
        <rect x={x} y={y} width={sw} height={sh} rx={Math.max(2, sh * 0.04)} fill="#1B1B1B" />
        <rect x={x - 2} y={y - lidH} width={sw + 4} height={lidH} rx={2} fill="#1B1B1B" />
        <rect x={x} y={stripeY} width={sw} height={stripeH} fill="#FBC303" />
        {isLarge ? (
          <>
            <circle cx={x + sw * 0.25} cy={baseline - wheelR * 0.4} r={wheelR} fill="#1B1B1B" />
            <circle cx={x + sw * 0.75} cy={baseline - wheelR * 0.4} r={wheelR} fill="#1B1B1B" />
          </>
        ) : (
          <circle cx={x + sw * 0.82} cy={baseline - wheelR * 0.4} r={wheelR} fill="#1B1B1B" />
        )}
      </g>
    );
  }

  return (
    <svg viewBox="0 0 760 300" className="w-full" style={{ display: "block" }} role="img" aria-label={`${count} wheelie bins of ${binSize} litres`}>
      <line x1={0} y1={groundY} x2={760} y2={groundY} stroke="#1B1B1B" strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" />
      {rows.map((inRow, r) => {
        const baseline = groundY - r * (sh + 16);
        const rowW = inRow * sw + (inRow - 1) * sg;
        const startX = (760 - rowW) / 2;
        return Array.from({ length: inRow }).map((_, i) => <BinShape key={`${r}-${i}`} x={startX + i * (sw + sg)} baseline={baseline} />);
      })}
      {extra > 0 && rows.length > 0 && (() => {
        const r = rows.length - 1;
        const inRow = rows[r];
        const baseline = groundY - r * (sh + 16);
        const rowW = inRow * sw + (inRow - 1) * sg;
        const startX = (760 - rowW) / 2;
        const textX = Math.min(startX + rowW + sg + 4, 752);
        return (
          <text x={textX} y={baseline - sh / 2} fill="#1B1B1B" fontWeight={800} fontSize={Math.max(14, sh * 0.22)} fontFamily="Inter Tight, sans-serif" dominantBaseline="middle">+{extra} more</text>
        );
      })()}
    </svg>
  );
}
