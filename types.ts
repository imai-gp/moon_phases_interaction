export enum PhaseType {
  NEW_MOON = 'New Moon',
  WAXING_CRESCENT = 'Waxing Crescent',
  FIRST_QUARTER = 'First Quarter',
  WAXING_GIBBOUS = 'Waxing Gibbous',
  FULL_MOON = 'Full Moon',
  WANING_GIBBOUS = 'Waning Gibbous',
  LAST_QUARTER = 'Last Quarter',
  WANING_CRESCENT = 'Waning Crescent'
}

export interface MoonData {
  angle: number; // 0 to 360 degrees
  phaseName: string;
  japaneseName: string;
  illumination: number; // 0 to 1
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export type ChatMessage = {
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
};
