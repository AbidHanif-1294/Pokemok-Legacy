import spriteSheet1 from '../assets/monsters/Gemini_Generated_Image_7tysau7tysau7tys.png';
import spriteSheet2 from '../assets/monsters/Gemini_Generated_Image_7tysau7tysau7tys copy.png';

interface Props {
  row: number;
  col: number;
  sheet?: 1 | 2;
  size?: number;
  className?: string;
}

const COLS = 8;
const ROWS = 5;

export default function MonsterSprite({ row, col, sheet = 1, size = 80, className = '' }: Props) {
  const spriteImage = sheet === 1 ? spriteSheet1 : spriteSheet2;

  return (
    <div
      className={`inline-block flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${spriteImage})`,
        backgroundSize: `${COLS * size}px ${ROWS * size}px`,
        backgroundPosition: `-${col * size}px -${row * size}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    />
  );
}
