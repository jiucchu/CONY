// 공통 타입 정의

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export type SizeType = 'Small' | 'Medium' | 'Large';