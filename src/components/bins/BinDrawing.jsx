import { useId } from "react";
import { ITEM_BY_KEY } from "@/lib/loadModel";
import { buildExampleLoad, packBinLoad } from "@/lib/binModel";

// Copied from the Base44 app. Skip and hook bin drawing, items packed two rows deep.
export default function BinDrawing({
  bin, placedItems, pxPerM, viewBoxW = 760, viewBoxH = 300, cx = 380, groundY = 282, outlineW = 4,
  fillOpacity = 0.22, outlineColor = "#1B1B1B", showItems = true, svgClassName = "w-full",
  preserveAspectRatio = "xMidYMid meet", title,
}) {
  const clipId = `bin-clip-${useId().replace(/:/g, "")}`;
  const items = placedItems && placedItems.length > 0 ? placedItems : buildExampleLoad(bin);
  const isHook = bin.kind === "hook";
  const topW = bin.topLength * pxPerM;
  const binH = bin.height * pxPerM;
  const topY = groundY - binH;

  let binShape, insideW, binLeft;
  if (!isHook) {
    const botW = topW * 0.68;
    const tL = cx - topW / 2, tR = cx + topW / 2, bL = cx - botW / 2, bR = cx + botW / 2;
    binShape = `M ${tL} ${topY} L ${tR} ${topY} L ${bR} ${groundY} L ${bL} ${groundY} Z`;
    insideW = botW;
    binLeft = cx - insideW / 2;
  } else {
    const left = cx - topW / 2, right = cx + topW / 2;
    const cut = Math.min(30, topW * 0.1);
    binShape = `M ${left} ${topY} L ${right} ${topY} L ${right} ${groundY} L ${left + cut} ${groundY} L ${left} ${groundY - cut} Z`;
    insideW = topW;
    binLeft = left;
  }

  const positions = packBinLoad(items, insideW, binH, pxPerM);
  const backOffset = Math.min(0.08 * binH, 10);
  const rimH = Math.max(3, binH * 0.05);
  const eyeR = Math.max(1.5, binH * 0.025);
  const footW = Math.max(5, binH * 0.08);
  const footH = Math.max(4, binH * 0.05);

  return (
    <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} className={svgClassName} preserveAspectRatio={preserveAspectRatio} style={{ display: "block" }} role="img" aria-label={title || `${bin.size} cubic metre ${isHook ? "hook bin" : "skip"} drawing`}>
      <defs><clipPath id={clipId}><path d={binShape} /></clipPath></defs>
      <line x1={0} y1={groundY} x2={viewBoxW} y2={groundY} stroke={outlineColor} strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" />
      <path d={binShape} fill="white" fillOpacity={fillOpacity} stroke={outlineColor} strokeWidth={outlineW} strokeLinejoin="round" />
      {showItems && (
        <g clipPath={`url(#${clipId})`}>
          {positions.filter((p) => p.index % 2 === 0).map((p) => {
            const item = ITEM_BY_KEY[p.key];
            if (!item) return null;
            const rot = ((p.index * 37) % 3) - 1;
            const x = binLeft + p.leftPx;
            const y = topY + p.topPx - backOffset;
            return (
              <g key={p.id}>
                <image href={item.image} x={x} y={y} width={p.w} height={p.h} preserveAspectRatio="xMidYMid meet" transform={`rotate(${rot} ${x + p.w / 2} ${y + p.h})`} />
                <rect x={x} y={y} width={p.w} height={p.h} fill="white" fillOpacity={0.28} />
              </g>
            );
          })}
          {positions.filter((p) => p.index % 2 !== 0).map((p) => {
            const item = ITEM_BY_KEY[p.key];
            if (!item) return null;
            const rot = ((p.index * 37) % 3) - 1;
            const x = binLeft + p.leftPx;
            const y = topY + p.topPx;
            return <image key={p.id} href={item.image} x={x} y={y} width={p.w} height={p.h} preserveAspectRatio="xMidYMid meet" transform={`rotate(${rot} ${x + p.w / 2} ${y + p.h})`} />;
          })}
        </g>
      )}
      {!isHook && (
        <>
          <rect x={cx - topW / 2 - 8} y={topY - rimH} width={topW + 16} height={rimH} fill={outlineColor} />
          <circle cx={cx - topW / 2 + 10} cy={topY - rimH / 2} r={eyeR} fill={outlineColor} />
          <circle cx={cx + topW / 2 - 10} cy={topY - rimH / 2} r={eyeR} fill={outlineColor} />
          <rect x={cx - (topW * 0.68) / 2} y={groundY - footH} width={footW} height={footH} fill={outlineColor} />
          <rect x={cx + (topW * 0.68) / 2 - footW} y={groundY - footH} width={footW} height={footH} fill={outlineColor} />
        </>
      )}
      {isHook && (
        <>
          <path d={`M ${cx - topW / 2} ${topY + binH * 0.35} L ${cx - topW / 2 - 28} ${topY - 18}`} stroke={outlineColor} strokeWidth={outlineW} fill="none" strokeLinecap="round" />
          <circle cx={cx - topW / 2 - 30} cy={topY - 22} r={Math.max(3, outlineW * 1.2)} fill="none" stroke={outlineColor} strokeWidth={outlineW} />
          <rect x={cx - topW / 2 + Math.min(30, topW * 0.1)} y={groundY - 4} width={topW - Math.min(30, topW * 0.1)} height={4} fill={outlineColor} />
          <circle cx={cx + topW / 2 - 12} cy={groundY - 8} r={Math.max(5, outlineW * 2)} fill={outlineColor} />
        </>
      )}
    </svg>
  );
}
