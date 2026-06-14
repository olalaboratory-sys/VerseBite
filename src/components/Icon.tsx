// VBIcon — thin rounded stroke icon set, ported to react-native-svg.
import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

export type IconName =
  | 'today' | 'grid' | 'bookmark' | 'person' | 'refresh' | 'note' | 'share' | 'search'
  | 'calendar' | 'award' | 'gear' | 'bell' | 'globe' | 'heart' | 'chevron' | 'back'
  | 'plus' | 'close' | 'check' | 'trash' | 'sun' | 'moon' | 'sliders' | 'sparkle' | 'quote';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  fill?: boolean;
  strokeWidth?: number;
};

export function Icon({ name, size = 22, color = '#25221F', fill = false, strokeWidth = 1.7 }: Props) {
  const p = { fill: 'none' as const, stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  let body: React.ReactNode = null;
  switch (name) {
    case 'today':
      body = (<><Circle cx={12} cy={13} r={4} {...p} /><Path d="M12 3v2M12 21v0M4.5 13H3M21 13h-1.5M6 7L5 6M18 7l1-1" {...p} /></>);
      break;
    case 'grid':
      body = (<><Rect x={4} y={4} width={6.5} height={6.5} rx={2} {...p} /><Rect x={13.5} y={4} width={6.5} height={6.5} rx={2} {...p} /><Rect x={4} y={13.5} width={6.5} height={6.5} rx={2} {...p} /><Rect x={13.5} y={13.5} width={6.5} height={6.5} rx={2} {...p} /></>);
      break;
    case 'bookmark':
      body = fill
        ? <Path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.6L6 21z" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
        : <Path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.6L6 21z" {...p} />;
      break;
    case 'person':
      body = (<><Circle cx={12} cy={8} r={4} {...p} /><Path d="M4.5 20a7.5 7.5 0 0 1 15 0" {...p} /></>);
      break;
    case 'refresh':
      body = (<><Path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5" {...p} /><Path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5" {...p} /></>);
      break;
    case 'note':
      body = (<><Path d="M5 19l-1 1 1-4L16 5a2 2 0 0 1 3 3L8 19z" {...p} /><Path d="M14 7l3 3" {...p} /></>);
      break;
    case 'share':
      body = (<><Path d="M12 15V4M12 4L8.5 7.5M12 4l3.5 3.5" {...p} /><Path d="M6 11H5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-1" {...p} /></>);
      break;
    case 'search':
      body = (<><Circle cx={11} cy={11} r={7} {...p} /><Path d="M16 16l4 4" {...p} /></>);
      break;
    case 'calendar':
      body = (<><Rect x={3.5} y={5} width={17} height={15.5} rx={2.5} {...p} /><Path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" {...p} /></>);
      break;
    case 'award':
      body = (<><Circle cx={12} cy={9} r={5.5} {...p} /><Path d="M9 13.5L7.5 21l4.5-2.5L16.5 21 15 13.5" {...p} /></>);
      break;
    case 'gear':
      body = (<><Circle cx={12} cy={12} r={3.2} {...p} /><Path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" {...p} /></>);
      break;
    case 'bell':
      body = (<><Path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" {...p} /><Path d="M10.5 20a1.5 1.5 0 0 0 3 0" {...p} /></>);
      break;
    case 'globe':
      body = (<><Circle cx={12} cy={12} r={8.5} {...p} /><Path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17" {...p} /></>);
      break;
    case 'heart':
      body = fill
        ? <Path d="M12 20s-7-4.6-9.2-9C1.3 8 3 4.5 6.3 4.5c1.9 0 3.2 1.1 3.7 2.2.5-1.1 1.8-2.2 3.7-2.2 3.3 0 5 3.5 3.5 6.5C19 15.4 12 20 12 20Z" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
        : <Path d="M12 20s-7-4.6-9.2-9C1.3 8 3 4.5 6.3 4.5c1.9 0 3.2 1.1 3.7 2.2.5-1.1 1.8-2.2 3.7-2.2 3.3 0 5 3.5 3.5 6.5C19 15.4 12 20 12 20Z" {...p} />;
      break;
    case 'chevron':
      body = <Path d="M9 5l7 7-7 7" {...p} />;
      break;
    case 'back':
      body = <Path d="M15 5l-7 7 7 7" {...p} />;
      break;
    case 'plus':
      body = <Path d="M12 5v14M5 12h14" {...p} />;
      break;
    case 'close':
      body = <Path d="M6 6l12 12M18 6L6 18" {...p} />;
      break;
    case 'check':
      body = <Path d="M5 12.5l4.5 4.5L19 6.5" {...p} />;
      break;
    case 'trash':
      body = <Path d="M5 7h14M10 7V5h4v2M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L18 7" {...p} />;
      break;
    case 'sun':
      body = (<><Circle cx={12} cy={12} r={4} {...p} /><Path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.4 5.6 17 7M7 17l-1.4 1.4M18.4 18.4 17 17M7 7 5.6 5.6" {...p} /></>);
      break;
    case 'moon':
      body = <Path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" {...p} />;
      break;
    case 'sliders':
      body = (<><Path d="M4 8h10M18 8h2M4 16h2M10 16h10" {...p} /><Circle cx={16} cy={8} r={2.2} {...p} /><Circle cx={8} cy={16} r={2.2} {...p} /></>);
      break;
    case 'sparkle':
      body = <Path d="M12 4l1.6 4.8L18.5 10l-4.9 1.2L12 16l-1.6-4.8L5.5 10l4.9-1.2z" {...p} />;
      break;
    case 'quote':
      body = <Path d="M9 7c-2.2 0-4 1.8-4 4v6h5v-5H7c0-1.7 1-2.5 2-2.7zM19 7c-2.2 0-4 1.8-4 4v6h5v-5h-3c0-1.7 1-2.5 2-2.7z" fill={color} />;
      break;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G>{body}</G>
    </Svg>
  );
}
