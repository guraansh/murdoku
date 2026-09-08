import React, { useId } from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Rect, Defs, ClipPath } from 'react-native-svg';
import { FurnitureKind, Person } from '../game/types';

export function Portrait({
  person,
  size = 64,
  faded = false,
}: {
  person: Person;
  size?: number;
  faded?: boolean;
}) {
  const clip = `portrait${useId().replace(/:/g, '')}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" opacity={faded ? 0.65 : 1}>
      <Defs>
        <ClipPath id={clip}>
          <Circle cx="40" cy="40" r="38" />
        </ClipPath>
      </Defs>
      <Circle cx="40" cy="40" r="38" fill={person.color + '26'} />
      <G clipPath={`url(#${clip})`}>
        {(person.style === 'bob' || person.style === 'curls') && (
          <Path d="M17 49C11 18 25 8 41 10C59 8 70 28 63 58L19 58Z" fill={person.hair} />
        )}
        {person.style === 'bun' && (
          <>
            <Circle cx="41" cy="14" r="11" fill={person.hair} />
            <Ellipse cx="40" cy="31" rx="22" ry="24" fill={person.hair} />
          </>
        )}
        <Path d="M9 84Q8 59 31 56H49Q72 59 73 84Z" fill={person.color} />
        <Path d="M33 51V60L40 67L47 60V50" fill={person.skin} />
        <Path d="M30 57L40 66L34 73L25 60M50 57L40 66L46 73L55 60" fill="#FBF4E5" />
        <Path
          d="M23 29Q22 13 40 13Q58 13 57 29L56 44Q54 56 40 57Q26 56 24 44Z"
          fill={person.skin}
        />
        <Ellipse cx="23" cy="37" rx="3.5" ry="5" fill={person.skin} />
        <Ellipse cx="57" cy="37" rx="3.5" ry="5" fill={person.skin} />
        <Path d="M25 29Q35 30 40 19Q49 29 57 29Q56 12 39 13Q23 12 22 31Z" fill={person.hair} />
        {person.style === 'bob' && (
          <Path
            d="M22 25L23 53L17 52L17 30Q18 7 43 10Q65 11 64 37L61 53L55 51L57 29Q46 26 42 19Q32 30 22 25"
            fill={person.hair}
          />
        )}
        {person.style === 'curls' && (
          <G fill={person.hair}>
            {[
              [21, 24],
              [26, 16],
              [35, 13],
              [47, 13],
              [57, 20],
              [61, 30],
            ].map(([cx, cy], i) => (
              <Circle key={i} cx={cx} cy={cy} r="8" />
            ))}
          </G>
        )}
        <Path
          d="M28 33L34 32M46 32L52 33"
          stroke={person.hair}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Circle cx="32" cy="37" r="1.4" fill="#3D3931" />
        <Circle cx="48" cy="37" r="1.4" fill="#3D3931" />
        <Path
          d="M40 36L38 43H41"
          fill="none"
          stroke="#A77556"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <Path
          d="M36 48Q40 50 44 48"
          fill="none"
          stroke="#80583F"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {person.style === 'glasses' && (
          <G stroke="#3D4840" strokeWidth="1.7" fill="none">
            <Circle cx="31.5" cy="37" r="6.5" />
            <Circle cx="48.5" cy="37" r="6.5" />
            <Path d="M38 36H42M24 36L21 34M55 36L59 34" />
          </G>
        )}
        {person.style === 'moustache' && (
          <Path
            d="M40 44C34 39 31 46 28 46Q33 52 40 46Q47 52 52 46C49 46 46 39 40 44"
            fill={person.hair}
          />
        )}
        {person.style === 'hat' && (
          <>
            <Path d="M23 24L27 9L40 12L52 9L57 25Z" fill={person.color} />
            <Path d="M23 21H56V26H23Z" fill="#4B5346" />
            <Path d="M15 27Q40 20 65 27L61 31H19Z" fill={person.color} />
          </>
        )}
        <Path d="M40 68V80" stroke="#FFFFFF44" strokeWidth="1.3" />
        <Circle cx="44" cy="74" r="1.2" fill="#F1E8CF" />
      </G>
      <Circle cx="40" cy="40" r="38" fill="none" stroke={person.color + '48'} strokeWidth="1.5" />
    </Svg>
  );
}

export function FurnitureArt({
  kind,
  name,
  color = '#796953',
  size = 38,
}: {
  kind: FurnitureKind;
  name?: string;
  color?: string;
  size?: number;
}) {
  let drawing;
  const objectName = name?.toLowerCase() ?? '';
  switch (kind) {
    case 'desk':
      drawing =
        objectName === 'oak desk' ? (
          <>
            <Rect x="7" y="17" width="42" height="22" rx="2" fill="#B48A65" />
            <Path d="M8 22H48M13 39V48M43 39V48M28 23V38" />
            <Rect x="12" y="25" width="11" height="10" rx="1" fill="#D5B98A" />
            <Rect x="33" y="25" width="11" height="10" rx="1" fill="#D5B98A" />
          </>
        ) : (
          <>
            <Rect x="8" y="13" width="40" height="27" rx="3" fill="#C6A987" />
            <Path d="M9 22H47M15 40V46M42 40V46M32 23V38" />
            <Rect x="14" y="16" width="13" height="14" rx="1" fill="#F7EDD6" />
            <Path d="M35 17L42 12M36 29H42M36 34H42" />
          </>
        );
      break;
    case 'books':
      drawing =
        objectName === 'low bookshelf' ? (
          <>
            <Rect x="7" y="26" width="42" height="19" rx="2" fill="#B99B7F" />
            <Path d="M7 35H49M13 28V34M19 28V34M25 28V34M32 28V34M39 28V34M13 45V49M43 45V49" />
            <Path d="M12 38V43M18 37V43M25 38V43M32 37V43M39 38V43" strokeWidth="2.5" />
          </>
        ) : objectName === 'bookshelf' ? (
          <>
            <Rect x="12" y="10" width="32" height="39" rx="2" fill="#C4A687" />
            <Path d="M12 28H44M12 44H44M18 14V25M25 13V25M32 15V25M38 12V25M18 31V41M27 30V41M36 31V41" />
          </>
        ) : (
          <>
            <Rect x="11" y="7" width="34" height="42" rx="2" fill="#CEB398" />
            <Path d="M11 27H45M11 44H45" />
            <Path
              d="M16 11V24M22 11V24M27 13L31 24M36 11V24M16 31V41M23 31V41M29 30V41M34 31L38 41"
              strokeWidth="3.5"
            />
          </>
        );
      break;
    case 'plant':
      drawing =
        objectName === 'fern' ? (
          <>
            <Path d="M20 38H36L33 49H23Z" fill="#CBA184" />
            <Path d="M28 40C28 30 25 22 20 14M28 38C30 29 35 22 41 16" />
            <Path d="M25 31L15 25M26 27L17 18M29 33L40 27M31 28L43 20M24 23L13 18" fill="none" />
            <Path d="M15 25L11 24M17 18L14 14M40 27L44 27M43 20L47 17M13 18L10 15" />
          </>
        ) : objectName === 'potted palm' ? (
          <>
            <Path d="M20 38H36L33 49H23Z" fill="#CBA184" />
            <Path d="M28 38C28 29 29 21 32 14" />
            <Path
              d="M31 16C19 17 12 12 11 7C21 7 28 10 31 16ZM32 16C31 7 37 3 43 4C44 11 40 15 32 16ZM32 18C41 13 48 17 49 23C41 24 35 22 32 18Z"
              fill="#8DAB77"
            />
          </>
        ) : objectName === 'palm' ? (
          <>
            <Path d="M19 38H37L34 49H22Z" fill="#CBA184" />
            <Path d="M28 38V18" />
            <Path
              d="M28 19C16 22 10 18 9 12C18 11 25 13 28 19ZM29 19C23 9 27 4 33 2C38 9 35 15 29 19ZM30 20C39 13 46 16 49 21C42 25 35 24 30 20Z"
              fill="#8DAB77"
            />
          </>
        ) : (
          <>
            <Path d="M20 38H36L33 49H23Z" fill="#CBA184" />
            <Path d="M28 38V15" />
            <Path
              d="M28 27C9 28 11 12 13 11C27 10 31 22 28 27ZM29 20C25 9 37 4 42 8C44 17 37 22 29 20ZM28 36C27 23 42 23 44 26C43 35 37 39 28 36Z"
              fill="#8DAB77"
            />
          </>
        );
      break;
    case 'flowers':
      drawing =
        objectName === 'orchids' ? (
          <>
            <Path d="M19 38H38L34 49H23Z" fill="#B9967B" />
            <Path d="M28 40V16M28 28C22 23 17 20 13 19M28 33C34 27 39 24 44 23" />
            <G fill="#D2A5B5">
              <Circle cx="13" cy="18" r="5" />
              <Circle cx="28" cy="14" r="5" />
              <Circle cx="44" cy="22" r="5" />
            </G>
            <G fill="#E7C878" stroke="none">
              <Circle cx="13" cy="18" r="1.5" />
              <Circle cx="28" cy="14" r="1.5" />
              <Circle cx="44" cy="22" r="1.5" />
            </G>
          </>
        ) : objectName === 'rose vase' ? (
          <>
            <Path d="M20 37H36L34 49H22Z" fill="#B9967B" />
            <Path d="M28 38V18M28 31L18 22M28 28L39 19" />
            <G fill="#C88782">
              <Circle cx="18" cy="20" r="6" />
              <Circle cx="29" cy="15" r="6" />
              <Circle cx="40" cy="19" r="6" />
            </G>
            <G fill="#E1C27D" stroke="none">
              <Circle cx="18" cy="20" r="1.6" />
              <Circle cx="29" cy="15" r="1.6" />
              <Circle cx="40" cy="19" r="1.6" />
            </G>
          </>
        ) : objectName === 'rose bush' ? (
          <>
            <Path d="M28 46V28M28 37L18 29M28 34L39 25M28 41L39 38" />
            <G fill="#91A77A" stroke="none">
              <Circle cx="17" cy="31" r="7" />
              <Circle cx="39" cy="27" r="8" />
              <Circle cx="39" cy="39" r="7" />
              <Circle cx="22" cy="42" r="7" />
            </G>
            <G fill="#C88782" stroke={color}>
              <Circle cx="21" cy="24" r="5" />
              <Circle cx="36" cy="19" r="5" />
            </G>
            <Path d="M16 49H40" strokeWidth="2" />
          </>
        ) : (
          <>
            <Path d="M19 37H38L34 49H23Z" fill="#B9967B" />
            <Path d="M28 40V17M28 33L17 22M28 29L40 20" />
            <G fill="#C59187">
              <Circle cx="17" cy="19" r="7" />
              <Circle cx="30" cy="14" r="7" />
              <Circle cx="42" cy="20" r="6" />
            </G>
            <G fill="#E1C27D" stroke="none">
              <Circle cx="17" cy="19" r="2" />
              <Circle cx="30" cy="14" r="2" />
              <Circle cx="42" cy="20" r="2" />
            </G>
          </>
        );
      break;
    case 'globe':
      drawing = (
        <>
          <Circle cx="27" cy="23" r="15" fill="#BBC8AD" />
          <Ellipse cx="27" cy="23" rx="7" ry="15" />
          <Path d="M12 23H42M17 12Q27 20 38 12M14 32Q27 27 40 32M44 10Q55 36 29 42V48M20 49H39" />
        </>
      );
      break;
    case 'stove':
      drawing = (
        <>
          <Rect x="10" y="8" width="36" height="40" rx="3" fill="#D6C4A0" />
          <Circle cx="20" cy="18" r="5" />
          <Circle cx="36" cy="18" r="5" />
          <Rect x="15" y="30" width="26" height="13" rx="2" fill="#A9A28B" />
          <Path d="M11 26H45M23 34H34" />
        </>
      );
      break;
    case 'sofa':
      drawing =
        objectName === 'armchair' ? (
          <>
            <Rect x="16" y="13" width="24" height="25" rx="8" fill="#BEABC4" />
            <Rect x="13" y="29" width="30" height="13" rx="4" fill="#CABCD0" />
            <Rect x="10" y="23" width="8" height="18" rx="3" fill="#BEABC4" />
            <Rect x="38" y="23" width="8" height="18" rx="3" fill="#BEABC4" />
            <Path d="M28 17V35M15 42V47M41 42V47" />
          </>
        ) : objectName === 'bench' ? (
          <>
            <Rect x="8" y="20" width="40" height="13" rx="3" fill="#BEABC4" />
            <Rect x="10" y="14" width="36" height="10" rx="3" fill="#CABCD0" />
            <Path d="M12 33V48M44 33V48M8 34H48" />
          </>
        ) : (
          <>
            <Rect x="11" y="13" width="34" height="23" rx="7" fill="#BEABC4" />
            <Rect x="10" y="28" width="36" height="14" rx="4" fill="#CABCD0" />
            <Rect x="6" y="23" width="8" height="18" rx="3" fill="#BEABC4" />
            <Rect x="42" y="23" width="8" height="18" rx="3" fill="#BEABC4" />
            <Path d="M28 18V35M12 42V47M44 42V47" />
          </>
        );
      break;
    case 'table':
      drawing =
        objectName === 'round table' ? (
          <>
            <Circle cx="28" cy="24" r="16" fill="#D2B697" />
            <Path d="M28 40V49M20 49H36" />
            <Circle cx="28" cy="24" r="3" fill="#F2E9D4" />
          </>
        ) : objectName === 'coffee table' ? (
          <>
            <Rect x="7" y="20" width="42" height="13" rx="3" fill="#D2B697" />
            <Path d="M12 33V47M44 33V47M12 38H44" />
            <Path d="M18 20V16M38 20V16" />
          </>
        ) : objectName === 'side table' ? (
          <>
            <Ellipse cx="28" cy="19" rx="12" ry="8" fill="#D2B697" />
            <Path d="M28 27V48M20 49H36" />
            <Circle cx="28" cy="18" r="3" fill="#F2E9D4" />
          </>
        ) : objectName === 'dining table' ? (
          <>
            <Rect x="5" y="18" width="46" height="14" rx="3" fill="#C5A27F" />
            <Path d="M10 32V49M46 32V49M18 32V45M38 32V45M5 26H51" />
            <Ellipse cx="28" cy="25" rx="5" ry="3" fill="#F2E9D4" />
          </>
        ) : (
          <>
            <Ellipse cx="28" cy="25" rx="21" ry="14" fill="#D2B697" />
            <Path d="M12 34V46M44 34V46M28 39V49" />
            <Ellipse cx="26" cy="24" rx="7" ry="5" fill="#F2E9D4" />
            <Path d="M31 21Q39 21 35 26" />
            <Path d="M25 16Q22 12 26 9" strokeWidth="1" />
          </>
        );
      break;
    case 'piano':
      drawing = (
        <>
          <Path d="M10 12Q35 0 45 17V42H10Z" fill="#847C70" />
          <Rect x="10" y="33" width="35" height="10" fill="#F6EDDA" />
          <Path d="M16 33V40M22 33V40M28 33V40M34 33V40M40 33V40M12 43V48M44 43V48" />
        </>
      );
      break;
    case 'easel':
      drawing = (
        <>
          <Path d="M28 5L12 50M28 5L45 50M28 35V48" />
          <Rect x="10" y="12" width="36" height="28" rx="1" fill="#EEE5D0" />
          <Path d="M12 37L23 22L32 32L38 25L44 37" fill="#A6B291" />
          <Circle cx="35" cy="19" r="3" fill="#D5B475" />
          <Path d="M7 41H49" strokeWidth="3" />
        </>
      );
      break;
    case 'records':
      drawing = (
        <>
          <Rect x="7" y="13" width="42" height="33" rx="3" fill="#BB9D80" />
          <Circle cx="26" cy="29" r="12" fill="#676D60" />
          <Circle cx="26" cy="29" r="4" fill="#D0AE75" />
          <Path d="M42 18V33L35 36" stroke="#E9DBBE" strokeWidth="3" />
        </>
      );
      break;
    case 'trunk':
      drawing =
        objectName === 'suitcase' ? (
          <>
            <Rect x="14" y="12" width="28" height="34" rx="5" fill="#B7A07D" />
            <Path d="M23 12V8Q23 5 28 5H28Q33 5 33 8V12" />
            <Path d="M14 26H42M20 12V46M36 12V46" />
            <Rect x="25" y="23" width="6" height="8" rx="1" fill="#DFCA91" />
            <Circle cx="20" cy="49" r="2" fill="#8A745E" stroke="none" />
            <Circle cx="36" cy="49" r="2" fill="#8A745E" stroke="none" />
          </>
        ) : objectName === 'trunk' ? (
          <>
            <Path d="M9 21Q28 8 47 21V44H9Z" fill="#AD896A" />
            <Path d="M9 28H47M17 19V44M39 19V44" />
            <Rect x="25" y="27" width="7" height="8" rx="1" fill="#DFCA91" />
            <Path d="M22 17V12H34V17" />
          </>
        ) : (
          <>
            <Rect x="8" y="14" width="40" height="30" rx="4" fill="#BD9A77" />
            <Path d="M23 14V9H34V14M8 28H48M17 14V44M40 14V44" />
            <Rect x="25" y="24" width="8" height="9" rx="1" fill="#DFCA91" />
          </>
        );
      break;
    case 'lamp':
      drawing =
        objectName === 'reading lamp' ? (
          <>
            <Path d="M29 45V27L39 19M29 27L21 21" />
            <Path d="M13 20H29L25 30H9Z" fill="#E2C58D" />
            <Path d="M20 46H38" />
            <Ellipse cx="29" cy="47" rx="11" ry="3" fill="#B0986D" />
          </>
        ) : objectName === 'lamp' ? (
          <>
            <Path d="M18 19Q28 10 38 19L35 29H21Z" fill="#E2C58D" />
            <Path d="M28 29V46M18 48H38" />
            <Circle cx="28" cy="13" r="3" fill="#D0AE75" />
          </>
        ) : (
          <>
            <Path d="M19 9H37L46 29H10Z" fill="#E2C58D" />
            <Path d="M28 30V46M18 48H38M40 30V37" />
            <Ellipse cx="28" cy="48" rx="11" ry="3" fill="#B0986D" />
          </>
        );
      break;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      <G fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {drawing}
      </G>
    </Svg>
  );
}

export function ManorArt({ width = 300, variant = 0 }: { width?: number; variant?: number }) {
  return (
    <Svg width={width} height={width * 0.54} viewBox="0 0 360 194">
      <Ellipse cx="178" cy="174" rx="151" ry="10" fill="#D9DECC" />
      <Circle cx="285" cy="38" r="22" fill="#E4D2A4" />
      <Path
        d="M31 169L39 70L50 55L61 69L68 169M296 169L303 91L315 76L327 92L335 169"
        fill="#91A087"
      />
      {variant === 2 ? (
        <G stroke="#566B57" strokeWidth="2">
          <Rect x="57" y="76" width="242" height="85" rx="12" fill="#71876C" />
          <Path d="M57 126H299M62 153H293" />
          <G fill="#E9DDBA">
            {[75, 121, 167, 213, 259].map((x) => (
              <Rect key={x} x={x} y="88" width="27" height="30" rx="4" />
            ))}
          </G>
          <Circle cx="104" cy="164" r="12" fill="#555F50" />
          <Circle cx="251" cy="164" r="12" fill="#555F50" />
          <Path d="M52 178H310" />
        </G>
      ) : (
        <G stroke="#65745B" strokeWidth="1.5">
          <Path d="M82 168V90L125 60L171 90V169M171 169V60L214 25L257 60V169" fill="#DDC9A3" />
          <Rect x="131" y="86" width="48" height="82" fill="#E7D6B5" />
          <Path d="M73 93L124 53L175 91M162 63L214 19L265 63" strokeWidth="6" fill="none" />
          <Rect x="229" y="32" width="11" height="23" fill="#A78768" />
          <Path d="M83 150H257M83 155H257" />
          <G fill="#65765B">
            {[
              [98, 104],
              [138, 104],
              [187, 78],
              [226, 78],
              [186, 116],
              [226, 116],
            ].map(([x, y], i) => (
              <G key={i}>
                <Rect x={x} y={y} width="17" height="24" rx="1" />
                <Path d={`M${x + 8.5} ${y}V${y + 24}M${x} ${y + 12}H${x + 17}`} stroke="#DECDA9" />
              </G>
            ))}
          </G>
          <Path d="M116 168V138Q128 122 140 138V168" fill="#8B9475" />
          <Circle cx="133" cy="149" r="1.6" fill="#E9D09A" />
          <Circle cx="213" cy="54" r="9" fill="#E6DCC0" />
          <Path d="M210 51L217 57M217 51L210 57" />
          <Path d="M109 169H146L155 178H100Z" fill="#CAC1A5" />
        </G>
      )}
      <G fill="#9EAD8E">
        <Circle cx="75" cy="163" r="16" />
        <Circle cx="59" cy="170" r="12" />
        <Circle cx="280" cy="164" r="16" />
        <Circle cx="299" cy="171" r="12" />
      </G>
      <Path d="M25 179H337" stroke="#8A987B" strokeWidth="2" strokeLinecap="round" />
      <Path
        d="M24 43Q31 36 38 43M41 27Q48 20 55 27"
        stroke="#8A987B"
        strokeWidth="1.4"
        fill="none"
      />
    </Svg>
  );
}
