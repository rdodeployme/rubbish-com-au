import { VEHICLES, ITEM_BY_KEY, packLoad, getVolume } from "@/lib/loadModel";

const STAGE_W = 1288;
const STAGE_H = 610;

export default function VehicleStage({ placedItems, vehicle, justAddedId }) {
  const v = VEHICLES[vehicle];
  const [lbL, lbT, lbR, lbB] = v.loadBox;
  const boxLeft = (lbL / STAGE_W) * 100;
  const boxTop = (lbT / STAGE_H) * 100;
  const boxW = ((lbR - lbL) / STAGE_W) * 100;
  const boxH = ((lbB - lbT) / STAGE_H) * 100;
  const positions = packLoad(placedItems, vehicle);
  const volume = getVolume(placedItems);
  const isEmpty = placedItems.length === 0;
  const overCapacity = volume > v.capacity;
  const bubbleX = (v.bubble[0] / STAGE_W) * 100;
  const bubbleY = (v.bubble[1] / STAGE_H) * 100;
  const overlayW = v.overlayWidth * 100;

  return (
    <div className="relative w-full" style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }}>
      <img
        src={v.image}
        alt=""
        draggable={false}
        className="absolute left-0 top-0 w-full h-full object-fill select-none"
        style={{ filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.25))" }}
      />
      <div
        className="absolute overflow-hidden"
        style={{ left: `${boxLeft}%`, top: `${boxTop}%`, width: `${boxW}%`, height: `${boxH}%` }}
      >
        {positions.map((p) => {
          const item = ITEM_BY_KEY[p.key];
          if (!item) return null;
          return (
            <div
              key={p.id}
              className={`absolute ${p.id === justAddedId ? "rubbish-drop-in" : ""}`}
              style={{ left: `${p.leftPct}%`, top: `${p.topPct}%`, width: `${p.widthPct}%`, height: `${p.heightPct}%`, zIndex: p.z }}
            >
              <img
                src={item.image}
                alt={item.name}
                draggable={false}
                className="w-full h-full object-contain select-none"
                style={{
                  transform: `rotate(${p.rotation}deg)`,
                  transformOrigin: "bottom center",
                  filter: "drop-shadow(0 5px 5px rgba(0,0,0,0.35))",
                }}
              />
            </div>
          );
        })}
      </div>
      <img
        src={v.overlay}
        alt=""
        draggable={false}
        className="absolute left-0 top-0 h-full object-fill select-none"
        style={{ width: `${overlayW}%` }}
      />
      {isEmpty && (
        <div className="absolute" style={{ left: `${bubbleX}%`, top: `${bubbleY}%`, transform: "translate(-50%, -50%)" }}>
          <div className="rubbish-bob">
            <span className="inline-block rounded-full bg-white/85 px-3 py-1.5 font-heading font-extrabold text-[12.5px] text-black whitespace-nowrap">
              Add items &#8595;
            </span>
          </div>
        </div>
      )}
      {overCapacity && (
        <div className="absolute" style={{ right: "2%", top: "2%" }}>
          <span className="inline-block rounded-full bg-black px-3 py-1.5 font-heading font-extrabold text-xs text-gold">
            Over a full truckload
          </span>
        </div>
      )}
    </div>
  );
}
