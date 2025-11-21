import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
あなたは「お月さま博士」という、優しくて物知りなキャラクターです。
小学生（特に低学年〜中学年）にもわかるように、ひらがなを多めに使ったり、簡単な言葉で説明してください。
難しい漢字には（ふりがな）を振るか、ひらがなで書いてください。
科学的に正しいことを教えつつ、子供がワクワクするようなトーンで話してください。
`;

export const fetchExplanation = async (topic: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `「${topic}」について、小学生にわかるように150文字以内で短く教えてください。例え話を使うとわかりやすいです。`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    return response.text || 'ごめんね、ちょっとうまく考えられなかったみたい。もう一回聞いてみてね。';
  } catch (error) {
    console.error('Gemini API Error:', error);
    return '通信エラーが発生しました。インターネットの接続を確認してね。';
  }
};

export const generateQuiz = async (): Promise<QuizQuestion[]> => {
  try {
    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          correctAnswerIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
        },
        required: ['question', 'options', 'correctAnswerIndex', 'explanation'],
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: '月の満ち欠けに関する小学生向けのクイズを3問作ってください。',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as QuizQuestion[];
  } catch (error) {
    console.error('Gemini Quiz Error:', error);
    return [];
  }
};

export const chatWithMoon = async (message: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\n会話形式で短く返事をしてください。",
      }
    });
    return response.text || '...';
  } catch (error) {
    return 'エラーがおきちゃった。';
  }
};
