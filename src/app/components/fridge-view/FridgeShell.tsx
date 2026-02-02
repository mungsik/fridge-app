import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface FridgeShellProps {
  fridgeContent: ReactNode;
  fridgeDoorContent: ReactNode;
  freezerContent: ReactNode;
  freezerDoorContent: ReactNode;
  openZones: Set<string>;
  onZoneClick: (zone: string) => void;
}

export function FridgeShell({
  fridgeContent,
  fridgeDoorContent,
  freezerContent,
  freezerDoorContent,
  openZones,
  onZoneClick,
}: FridgeShellProps) {
  const fridgeOpen = openZones.has('fridge');
  const freezerOpen = openZones.has('freezer');

  // 냉동실(위) 204px + 구분선 6px + 냉장실(아래) 310px = 520px
  const freezerH = 204;
  const dividerTop = freezerH;       // 204
  const fridgeTop = freezerH + 6;    // 210
  const fridgeH = 310;

  return (
    <div
      className="relative select-none"
      style={{ perspective: 1200 }}
    >
      {/* ===== 냉장고 본체 (내부 — 문 뒤에 숨겨짐) ===== */}
      <div
        style={{
          width: 280,
          height: 520,
          background: 'linear-gradient(180deg, #E8E8E8 0%, #D5D5D5 100%)',
          border: '4px solid #424242',
          borderRadius: 12,
          boxShadow: '4px 4px 0 #333, inset 2px 2px 0 rgba(255,255,255,0.4)',
          imageRendering: 'pixelated',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* 냉동실 내부 (상단) */}
        <div
          className="absolute"
          style={{ top: 0, left: 0, right: 0, height: freezerH, cursor: freezerOpen ? 'pointer' : 'default' }}
          onClick={() => freezerOpen && onZoneClick('freezer')}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, #E8EAF6 0%, #C5CAE9 100%)',
              padding: 8,
            }}
          >
            <div
              className="font-mono text-center mb-1"
              style={{ fontSize: 11, color: '#283593' }}
            >
              ❄ 냉동실 ❄
            </div>
            <div style={{ height: freezerH - 40 }}>{freezerContent}</div>
          </div>
        </div>

        {/* 칸 구분선 */}
        <div
          className="absolute"
          style={{
            top: dividerTop,
            left: 0,
            right: 0,
            height: 6,
            background: '#616161',
            borderTop: '2px solid #424242',
            borderBottom: '2px solid #757575',
            zIndex: 2,
          }}
        />

        {/* 냉장실 내부 (하단) */}
        <div
          className="absolute"
          style={{ top: fridgeTop, left: 0, right: 0, bottom: 0, cursor: fridgeOpen ? 'pointer' : 'default' }}
          onClick={() => fridgeOpen && onZoneClick('fridge')}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%)',
              padding: 8,
            }}
          >
            <div
              className="font-mono text-center mb-1"
              style={{ fontSize: 11, color: '#1565C0' }}
            >
              ❄ 냉장실 ❄
            </div>
            <div style={{ height: fridgeH - 40 }}>{fridgeContent}</div>
          </div>
        </div>
      </div>

      {/* ===== 냉동실 문 (상단 오버레이) ===== */}
      <motion.div
        animate={{ rotateY: freezerOpen ? 130 : 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 280,
          height: freezerH,
          transformOrigin: 'right center',
          transformStyle: 'preserve-3d',
          zIndex: freezerOpen ? 5 : 15,
          cursor: freezerOpen ? 'default' : 'pointer',
          pointerEvents: freezerOpen ? 'none' : 'auto',
        }}
        onClick={() => onZoneClick('freezer')}
      >
        {/* 문 앞면 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #EEEEEE 0%, #E0E0E0 100%)',
            border: '4px solid #424242',
            borderRadius: '12px 12px 0 0',
            boxShadow: 'inset -2px 2px 0 rgba(255,255,255,0.4)',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* 손잡이 */}
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 10,
              height: 40,
              background: 'linear-gradient(90deg, #9E9E9E, #BDBDBD)',
              borderRadius: 5,
              border: '2px solid #757575',
              boxShadow: '1px 1px 0 #555',
            }}
          />
          <div
            className="flex items-center justify-center h-full"
            style={{ fontFamily: 'monospace', color: '#888', fontSize: 14, letterSpacing: 3 }}
          >
            <div className="text-center">
              <div style={{ fontSize: 28, marginBottom: 4 }}>🧊</div>
              <div>냉동실</div>
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>클릭하여 열기</div>
            </div>
          </div>
        </div>

        {/* 문 뒷면 (문 안쪽 수납) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #FAFAFA 0%, #F0F0F0 100%)',
            border: '3px solid #757575',
            borderRadius: '8px 8px 0 0',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            pointerEvents: 'auto',
            padding: 8,
          }}
        >
          <div
            className="font-mono text-center mb-1"
            style={{ fontSize: 10, color: '#666' }}
          >
            문쪽 수납
          </div>
          <div style={{ borderBottom: '2px solid #E0E0E0', marginBottom: 4 }} />
          <div style={{ height: freezerH - 50 }}>{freezerDoorContent}</div>
        </div>
      </motion.div>

      {/* ===== 냉장실 문 (하단 오버레이) ===== */}
      <motion.div
        animate={{ rotateY: fridgeOpen ? 130 : 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        style={{
          position: 'absolute',
          top: fridgeTop,
          left: 0,
          width: 280,
          height: fridgeH,
          transformOrigin: 'right center',
          transformStyle: 'preserve-3d',
          zIndex: fridgeOpen ? 5 : 15,
          cursor: fridgeOpen ? 'default' : 'pointer',
          pointerEvents: fridgeOpen ? 'none' : 'auto',
        }}
        onClick={() => onZoneClick('fridge')}
      >
        {/* 문 앞면 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #F8F8F8 0%, #EEEEEE 100%)',
            border: '4px solid #424242',
            borderRadius: '0 0 12px 12px',
            boxShadow: 'inset -2px 2px 0 rgba(255,255,255,0.4)',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* 손잡이 */}
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 10,
              height: 50,
              background: 'linear-gradient(90deg, #9E9E9E, #BDBDBD)',
              borderRadius: 5,
              border: '2px solid #757575',
              boxShadow: '1px 1px 0 #555',
            }}
          />
          <div
            className="flex items-center justify-center h-full"
            style={{ fontFamily: 'monospace', color: '#888', fontSize: 14, letterSpacing: 3 }}
          >
            <div className="text-center">
              <div style={{ fontSize: 28, marginBottom: 4 }}>🧊</div>
              <div>냉장실</div>
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>클릭하여 열기</div>
            </div>
          </div>
        </div>

        {/* 문 뒷면 (문 안쪽 수납) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #FAFAFA 0%, #F0F0F0 100%)',
            border: '3px solid #757575',
            borderRadius: '0 0 8px 8px',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            pointerEvents: 'auto',
            padding: 8,
          }}
        >
          <div
            className="font-mono text-center mb-1"
            style={{ fontSize: 10, color: '#666' }}
          >
            문쪽 수납
          </div>
          <div style={{ borderBottom: '2px solid #E0E0E0', marginBottom: 4 }} />
          <div style={{ height: fridgeH - 50 }}>{fridgeDoorContent}</div>
        </div>
      </motion.div>

      {/* 문 사이 구분선 (항상 보임) */}
      <div
        style={{
          position: 'absolute',
          top: dividerTop,
          left: 0,
          width: 280,
          height: 6,
          background: '#616161',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
