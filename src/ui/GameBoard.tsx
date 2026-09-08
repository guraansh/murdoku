import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ChevronDown, ChevronUp, Compass, Crosshair, X } from 'lucide-react-native';
import { coordinate } from '../game/engine';
import { GameSession, Puzzle } from '../game/types';
import { FurnitureArt, Portrait } from './Illustrations';
import { Eyebrow, Type } from './primitives';
import { colors, fonts } from './theme';

export function GameBoard({
  puzzle,
  session,
  selected,
  mode,
  onCell,
  highlight,
}: {
  puzzle: Puzzle;
  session: GameSession;
  selected: string | null;
  mode: 'place' | 'mark';
  onCell: (cell: number) => void;
  highlight?: number;
}) {
  const [available, setAvailable] = useState(360);
  const [showObjects, setShowObjects] = useState(true);
  const small = useWindowDimensions().width < 500;
  const boardSize = Math.max(puzzle.size * 44, Math.min(available - 24, 400));
  const tileSize = boardSize / puzzle.size;
  const furnitureSize = Math.min(tileSize * 0.82, tileSize - 4);
  const blockedCells = new Set([
    ...puzzle.furniture.map((item) => item.cell),
    ...Object.values(session.placements),
  ]);
  const roomLabels = puzzle.rooms.map((room) => {
    const cells = puzzle.layout.flatMap((row, r) =>
      row.flatMap((roomId, c) =>
        roomId === room.id ? [{ cell: r * puzzle.size + c, row: r, column: c }] : [],
      ),
    );
    const centerRow = cells.reduce((sum, item) => sum + item.row, 0) / cells.length;
    const centerColumn = cells.reduce((sum, item) => sum + item.column, 0) / cells.length;
    const runs: Array<{ row: number; startColumn: number; length: number }> = [];
    for (let row = 0; row < puzzle.size; row += 1) {
      let startColumn: number | null = null;
      for (let column = 0; column <= puzzle.size; column += 1) {
        const cell = row * puzzle.size + column;
        const open =
          column < puzzle.size && puzzle.layout[row][column] === room.id && !blockedCells.has(cell);
        if (open && startColumn === null) startColumn = column;
        if ((!open || column === puzzle.size) && startColumn !== null) {
          runs.push({ row, startColumn, length: column - startColumn });
          startColumn = null;
        }
      }
    }
    if (!runs.length) {
      for (let row = 0; row < puzzle.size; row += 1) {
        let startColumn: number | null = null;
        for (let column = 0; column <= puzzle.size; column += 1) {
          const open = column < puzzle.size && puzzle.layout[row][column] === room.id;
          if (open && startColumn === null) startColumn = column;
          if ((!open || column === puzzle.size) && startColumn !== null) {
            runs.push({ row, startColumn, length: column - startColumn });
            startColumn = null;
          }
        }
      }
    }
    const labelRun = runs.reduce((best, run) => {
      const score =
        run.length * 100 -
        Math.abs(run.row - centerRow) * 2 -
        Math.abs(run.startColumn + (run.length - 1) / 2 - centerColumn);
      const bestScore =
        best.length * 100 -
        Math.abs(best.row - centerRow) * 2 -
        Math.abs(best.startColumn + (best.length - 1) / 2 - centerColumn);
      return score > bestScore ? run : best;
    });
    return {
      ...room,
      left: labelRun.startColumn * tileSize + 4,
      top: labelRun.row * tileSize + 4,
      width: labelRun.length * tileSize - 8,
    };
  });
  const placedByCell = Object.fromEntries(
    Object.entries(session.placements).map(([person, cell]) => [cell, person]),
  );
  return (
    <View style={[s.card, small && { padding: 14 }]}>
      <View style={s.top}>
        <View>
          <Eyebrow>THE CRIME SCENE</Eyebrow>
          <Type style={s.location}>{puzzle.location}</Type>
        </View>
        <View style={s.compass}>
          <Compass size={24} strokeWidth={1.3} color={colors.muted} />
          <Type style={s.north}>N</Type>
        </View>
      </View>
      <View style={s.boardOuter} onLayout={(event) => setAvailable(event.nativeEvent.layout.width)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={boardSize + 24 > available}
          style={{ width: '100%' }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: boardSize + 24 > available ? 'flex-start' : 'center',
          }}
        >
          <View style={{ width: boardSize + 24 }}>
            <View style={{ flexDirection: 'row', marginLeft: 22, marginBottom: 7 }}>
              {Array.from({ length: puzzle.size }, (_, column) => (
                <Type key={column} style={[s.axis, { width: tileSize }]}>
                  {String.fromCharCode(65 + column)}
                </Type>
              ))}
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 22 }}>
                {Array.from({ length: puzzle.size }, (_, row) => (
                  <View key={row} style={{ height: tileSize, justifyContent: 'center' }}>
                    <Type style={s.axis}>{row + 1}</Type>
                  </View>
                ))}
              </View>
              <View style={[s.board, { width: boardSize + 2, height: boardSize + 2 }]}>
                {puzzle.layout.map((row, r) => (
                  <View key={r} style={{ flexDirection: 'row' }}>
                    {row.map((roomId, c) => {
                      const cell = r * puzzle.size + c;
                      const room = puzzle.rooms.find((item) => item.id === roomId)!;
                      const object = puzzle.furniture.find((item) => item.cell === cell);
                      const occupant = puzzle.people.find((item) => item.id === placedByCell[cell]);
                      const selectedHere = occupant && occupant.id === selected;
                      const rowTaken = Object.entries(session.placements).some(
                        ([id, position]) =>
                          id !== selected &&
                          (Math.floor(position / puzzle.size) === r ||
                            position % puzzle.size === c),
                      );
                      const isHint = highlight === cell;
                      const marked = session.marks.includes(cell);
                      const rightWall = c < puzzle.size - 1 && row[c + 1] !== roomId;
                      const bottomWall = r < puzzle.size - 1 && puzzle.layout[r + 1][c] !== roomId;
                      return (
                        <Pressable
                          key={c}
                          accessibilityRole="button"
                          accessibilityLabel={`${coordinate(cell, puzzle.size)}, ${room.name}${object ? `, ${object.name}` : occupant ? `, ${occupant.name}` : marked ? ', marked empty' : ', empty'}`}
                          testID={`cell-${cell}`}
                          onPress={() => onCell(cell)}
                          style={({ pressed }) => [
                            s.tile,
                            {
                              width: tileSize,
                              height: tileSize,
                              backgroundColor: room.color,
                              borderRightWidth: rightWall ? 3 : c === puzzle.size - 1 ? 0 : 1.25,
                              borderBottomWidth: bottomWall ? 3 : r === puzzle.size - 1 ? 0 : 1.25,
                              borderRightColor: rightWall ? '#59634F' : '#A49D7E',
                              borderBottomColor: bottomWall ? '#59634F' : '#A49D7E',
                              opacity: pressed ? 0.65 : 1,
                            },
                          ]}
                        >
                          {!occupant && !object && rowTaken && mode === 'place' && (
                            <View
                              style={[
                                StyleSheet.absoluteFill,
                                s.conflict,
                                { pointerEvents: 'none' },
                              ]}
                            >
                              <X
                                size={Math.max(18, tileSize * 0.38)}
                                color="#B83F35"
                                strokeWidth={2.3}
                              />
                            </View>
                          )}
                          {object && (
                            <FurnitureArt
                              kind={object.kind}
                              color={room.ink}
                              size={furnitureSize}
                            />
                          )}
                          {occupant && (
                            <Portrait
                              person={occupant}
                              size={tileSize * 0.82}
                              faded={occupant.id === puzzle.victim}
                            />
                          )}
                          {!occupant && !object && marked && (
                            <X size={tileSize * 0.3} color={room.ink} strokeWidth={1.4} />
                          )}
                          {selectedHere && (
                            <View
                              style={[
                                StyleSheet.absoluteFill,
                                {
                                  borderColor: colors.green,
                                  borderWidth: 2.5,
                                  margin: 2,
                                  borderRadius: 7,
                                  pointerEvents: 'none',
                                },
                              ]}
                            />
                          )}
                          {isHint && !occupant && (
                            <View
                              style={[StyleSheet.absoluteFill, s.hint, { pointerEvents: 'none' }]}
                            >
                              <Crosshair size={22} color={colors.rust} />
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
                <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                  {roomLabels.map((label) => (
                    <View
                      key={label.id}
                      testID={`room-label-${label.id}`}
                      style={[
                        s.roomLabel,
                        {
                          left: label.left,
                          top: label.top,
                          width: label.width,
                          borderColor: `${label.ink}55`,
                        },
                      ]}
                    >
                      <Type
                        numberOfLines={2}
                        adjustsFontSizeToFit
                        minimumFontScale={0.65}
                        style={[s.roomLabelText, { color: label.ink }]}
                      >
                        {label.name}
                      </Type>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
      {boardSize + 24 > available + 1 && (
        <Type style={{ fontSize: 10, color: colors.muted, textAlign: 'center', marginTop: 5 }}>
          Slide the floor plan to see every column.
        </Type>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Furniture key"
        accessibilityState={{ expanded: showObjects }}
        aria-expanded={showObjects}
        onPress={() => setShowObjects(!showObjects)}
        style={s.keyToggle}
      >
        <View style={s.keyToggleCopy}>
          <Eyebrow>FURNITURE KEY</Eyebrow>
          <Type style={s.keyToggleLabel}>
            {showObjects
              ? 'Names and coordinates'
              : `${puzzle.furniture.length} objects on this plan`}
          </Type>
        </View>
        {showObjects ? (
          <ChevronUp size={18} color={colors.secondary} />
        ) : (
          <ChevronDown size={18} color={colors.secondary} />
        )}
      </Pressable>
      {showObjects && (
        <View style={[s.objectKey, small && s.objectKeySmall]}>
          {puzzle.furniture.map((object) => (
            <View key={object.id} style={[s.objectKeyItem, !small && s.objectKeyItemWide]}>
              <View style={s.objectIcon}>
                <FurnitureArt kind={object.kind} color={colors.secondary} size={29} />
              </View>
              <Type style={s.objectName}>{object.name}</Type>
              <Type style={s.objectCoordinate}>{coordinate(object.cell, puzzle.size)}</Type>
            </View>
          ))}
        </View>
      )}
      <View style={s.rule}>
        <View style={s.ruleDot} />
        <Type style={s.ruleText}>One person per row. One person per column.</Type>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 22,
    boxShadow: '0 3px 0 #DEDCCC55',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  location: { fontFamily: fonts.title, fontSize: 20, lineHeight: 28, marginTop: 2 },
  compass: { width: 34, alignItems: 'center', gap: 1 },
  north: { fontFamily: fonts.bold, fontSize: 8, lineHeight: 10, color: colors.muted },
  boardOuter: { width: '100%', alignItems: 'center', paddingBottom: 4 },
  axis: {
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.muted,
    lineHeight: 15,
  },
  board: {
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#59634F',
    borderRadius: 5,
    overflow: 'hidden',
  },
  tile: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  conflict: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomLabel: {
    position: 'absolute',
    minHeight: 18,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: '#FFFEF9CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomLabelText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    lineHeight: 11,
    textAlign: 'center',
  },
  keyToggle: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 9,
    backgroundColor: colors.background,
  },
  keyToggleCopy: { gap: 2 },
  keyToggleLabel: { fontSize: 11, color: colors.secondary, lineHeight: 16 },
  objectKey: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 9,
    backgroundColor: colors.paper,
  },
  objectKeySmall: { gap: 6 },
  objectKeyItem: {
    width: '100%',
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderRadius: 7,
    backgroundColor: colors.background,
  },
  objectKeyItemWide: { width: '48%' },
  objectIcon: {
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: colors.paper,
  },
  objectName: { flex: 1, fontSize: 11, lineHeight: 16, color: colors.secondary },
  objectCoordinate: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.secondary,
    fontFamily: fonts.bold,
  },
  rule: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  ruleDot: { height: 4, width: 4, borderRadius: 2, backgroundColor: colors.gold },
  ruleText: { fontSize: 11, color: colors.secondary, textAlign: 'center' },
  hint: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.rust,
    margin: 3,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
