import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      tertiary: string;
      background: {
        white: string;
        black: string;
        lightGray: string;
      };
      text: {
        primary: string;
        secondary: string;
        white: string;
        navy: string;
      };
    };
  }
}
