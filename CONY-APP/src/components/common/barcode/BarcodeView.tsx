import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
// @ts-ignore - jsbarcode는 타입 정의가 없을 수 있음
import barcodes from 'jsbarcode/src/barcodes';

interface BarcodeViewProps {
  value: string;
  width?: number;
  height?: number;
  format?: 'CODE128' | 'CODE39' | 'EAN13';
}

/**
 * 바코드 뷰 컴포넌트
 * react-native-svg와 jsbarcode를 사용하여 실제 스캔 가능한 바코드를 생성합니다.
 */
const BarcodeView = ({ 
  value, 
  width = 280, 
  height = 80,
  format = 'CODE128' 
}: BarcodeViewProps) => {
  // 바코드 값을 문자열로 변환하고 공백만 제거
  let barcodeValue = String(value || '').replace(/\s/g, '');
  
  // 빈 값이면 기본값 사용 (16자리 숫자)
  if (!barcodeValue || barcodeValue.length === 0) {
    barcodeValue = '0000000000000000';
  }
  
  // CODE128은 최소 길이 제한이 있을 수 있으므로, 너무 짧으면 패딩
  if (barcodeValue.length < 1) {
    barcodeValue = barcodeValue.padStart(1, '0');
  }
  
  // CODE128은 최대 길이 제한이 있으므로, 너무 길면 자르기
  if (barcodeValue.length > 80) {
    barcodeValue = barcodeValue.substring(0, 80);
  }

  // jsbarcode로 바코드 데이터 생성
  const barcodeData = useMemo(() => {
    try {
      const Encoder = barcodes[format];
      if (!Encoder) {
        console.error('Barcode encoder not found for format:', format);
        return null;
      }

      const options = {
        width: 2,
        height: height,
      };

      const encoded = new Encoder(barcodeValue, options);
      
      if (!encoded.valid()) {
        console.error('Invalid barcode value:', barcodeValue);
        return null;
      }

      const binary = encoded.encode();
      return binary.data;
    } catch (error) {
      console.error('Barcode generation error:', error);
      return null;
    }
  }, [barcodeValue, format, height]);

  // 바코드 바 렌더링
  const bars = useMemo(() => {
    if (!barcodeData) return [];

    const bars: Array<{ x: number; width: number }> = [];
    let x = 0;
    const barWidth = 2;

    for (let i = 0; i < barcodeData.length; i++) {
      if (barcodeData[i] === '1') {
        bars.push({
          x: x * barWidth,
          width: barWidth,
        });
      }
      x++;
    }

    return bars;
  }, [barcodeData]);

  if (!barcodeData || bars.length === 0) {
    return <View style={styles.container} />;
  }

  const svgWidth = barcodeData.length * 2;

  return (
    <View style={styles.container}>
      <Svg width={svgWidth} height={height} viewBox={`0 0 ${svgWidth} ${height}`}>
        {bars.map((bar, index) => (
          <Rect
            key={index}
            x={bar.x}
            y={0}
            width={bar.width}
            height={height}
            fill="#000000"
          />
        ))}
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
