import React from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Puzzle } from '../game/types';
import { colors } from './theme';

/** A view of the actual scene, with furniture but no people or solution positions. */
export function CaseCover({ puzzle }: { puzzle: Puzzle }) {
  const tile = 112 / puzzle.size;
  return (
    <Svg width="100%" height={136} viewBox="0 0 280 136" accessible={false} aria-hidden>
      <Ellipse cx={139} cy={125} rx={75} ry={4} fill="#334638" opacity={0.08} />
      <G transform="translate(76 12) rotate(-4 56 56)">
        <Rect
          x={-6}
          y={-6}
          width={124}
          height={124}
          rx={3}
          fill={colors.paper}
          stroke="#D4D4C4"
          strokeWidth={0.6}
        />
        {puzzle.layout.map((row, r) =>
          row.map((roomId, c) => {
            const room = puzzle.rooms.find((item) => item.id === roomId)!;
            const object = puzzle.furniture.find((item) => item.cell === r * puzzle.size + c);
            return (
              <G key={`${r}-${c}`}>
                <Rect
                  x={c * tile}
                  y={r * tile}
                  width={tile}
                  height={tile}
                  fill={room.color}
                  stroke="#80765A25"
                  strokeWidth={0.3}
                />
                {object && (
                  <Rect
                    x={c * tile + tile * 0.29}
                    y={r * tile + tile * 0.29}
                    width={tile * 0.42}
                    height={tile * 0.42}
                    rx={1}
                    fill={room.ink}
                    opacity={0.65}
                  />
                )}
                {c < puzzle.size - 1 && row[c + 1] !== roomId && (
                  <Line
                    x1={(c + 1) * tile}
                    y1={r * tile}
                    x2={(c + 1) * tile}
                    y2={(r + 1) * tile}
                    stroke="#71775F"
                    strokeWidth={1}
                  />
                )}
                {r < puzzle.size - 1 && puzzle.layout[r + 1][c] !== roomId && (
                  <Line
                    x1={c * tile}
                    y1={(r + 1) * tile}
                    x2={(c + 1) * tile}
                    y2={(r + 1) * tile}
                    stroke="#71775F"
                    strokeWidth={1}
                  />
                )}
              </G>
            );
          })
        )}
        <Rect width={112} height={112} rx={1} fill="none" stroke="#71775F" strokeWidth={0.8} />
      </G>
      <G transform="translate(237 26)" stroke="#7A846E" fill="none" opacity={0.7}>
        <Circle r={11} strokeWidth={0.6} />
        <Path d="M0 -8 L3 5 L0 2 L-3 5 Z" fill="#7A846E" strokeWidth={0.6} />
      </G>
      <SvgText x={237} y={10} fill="#7A846E" fontSize={6} textAnchor="middle">
        N
      </SvgText>
      <G transform="translate(34 98) rotate(-9)" opacity={0.7}>
        <SvgText fill={colors.rust} fontFamily="serif" fontSize={18}>
          {puzzle.number}
        </SvgText>
        <Path d="M-1 5 Q 14 2 30 5" fill="none" stroke={colors.rust} strokeWidth={0.7} />
      </G>
      <Path
        d="M223 104 L248 104 M223 109 L242 109 M223 114 L245 114"
        stroke="#7A846E"
        opacity={0.3}
        strokeWidth={0.7}
      />
    </Svg>
  );
}
