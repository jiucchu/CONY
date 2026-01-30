import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Rect } from 'react-native-svg';

interface BarcodeViewProps {
  value: string;
  width?: number;
  height?: number;
  format?: 'CODE128' | 'CODE39' | 'EAN13';
}

/**
 * 간단한 바코드 뷰 컴포넌트
 * CODE128 형식의 바코드를 SVG로 렌더링합니다.
 */
const BarcodeView = ({ 
  value, 
  width = 300, 
  height = 80,
  format = 'CODE128' 
}: BarcodeViewProps) => {
  // 바코드 값을 숫자만 남기기 (공백 제거)
  const cleanedValue = value.replace(/\s/g, '');
  
  // 간단한 바코드 패턴 생성 (실제 바코드 인코딩이 아닌 시각적 표현)
  // 실제 바코드 스캔을 위해서는 전문 라이브러리가 필요합니다.
  const generateBarcodePattern = (code: string): number[] => {
    const pattern: number[] = [];
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const charCode = char.charCodeAt(0);
      // 각 문자를 바코드 바 두께로 변환 (1-4 픽셀)
      const barWidth = (charCode % 4) + 1;
      pattern.push(barWidth);
    }
    // 최소 20개 바 생성
    while (pattern.length < 20) {
      pattern.push(2);
    }
    return pattern.slice(0, 20);
  };

  const pattern = generateBarcodePattern(cleanedValue || '0000');
  const totalWidth = pattern.reduce((sum, width) => sum + width, 0);
  const scale = width / totalWidth;
  
  let x = 0;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {pattern.map((barWidth, index) => {
          const scaledWidth = barWidth * scale;
          const isBar = index % 2 === 0; // 짝수 인덱스는 검은색 바
          const currentX = x;
          x += scaledWidth;
          
          if (isBar) {
            return (
              <Rect
                key={index}
                x={currentX}
                y={0}
                width={scaledWidth}
                height={height}
                fill="#000000"
              />
            );
          }
          return null;
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BarcodeView;
