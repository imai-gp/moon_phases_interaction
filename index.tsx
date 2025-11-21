import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { Sun, Send, Sparkles, Trophy, RefreshCcw, CheckCircle, XCircle, Play, BookOpen } from 'lucide-react';

// --- TYPES ---
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
  angle: number;
  phaseName: string;
  japaneseName: string;
  illumination: number;
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

// --- SERVICE ---
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
あなたは「お月さま博士」という、優しくて物知りなキャラクターです。
小学生（特に低学年〜中学年）にもわかるように、ひらがなを多めに使ったり、簡単な言葉で説明してください。
難しい漢字には（ふりがな）を振るか、ひらがなで書いてください。
科学的に正しいことを教えつつ、子供がワクワクするようなトーンで話してください。
`;

const fetchExplanation = async (topic: string): Promise<string> => {
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

const generateQuiz = async (): Promise<QuizQuestion[]> => {
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

const chatWithMoon = async (message: string): Promise<string> => {
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

// --- COMPONENTS ---

// StarryBackground Component
const StarryBackground: React.FC = () => {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; delay: string }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      delay: `${Math.random() * 3}s`
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay
          }}
        />
      ))}
    </div>
  );
};

// OrbitVisualizer Component
interface OrbitProps {
  angle: number;
  setAngle: (angle: number) => void;
}

const OrbitVisualizer: React.FC<OrbitProps> = ({ angle, setAngle }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const cx = 150; 
  const cy = 150; 
  const orbitRadius = 100;

  const radian = (angle * Math.PI) / 180;
  const moonX = cx + orbitRadius * Math.cos(radian);
  const moonY = cy + orbitRadius * Math.sin(radian);

  const handleMouseDown = () => setIsDragging(true);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!isDragging || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left - cx;
    const y = clientY - rect.top - cy;
    
    let newAngle = Math.atan2(y, x) * (180 / Math.PI);
    if (newAngle < 0) newAngle += 360;
    
    setAngle(newAngle);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);
  
  return (
    <div className="relative flex flex-col items-center select-none">
      <h3 className="text-xl font-bold mb-4 text-sky-300">宇宙から見た様子</h3>
      <div className="relative">
        <svg
          ref={svgRef}
          width="300"
          height="300"
          viewBox="0 0 300 300"
          className="cursor-pointer touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
        >
          <circle cx={cx} cy={cy} r={orbitRadius} stroke="#334155" strokeWidth="2" fill="none" strokeDasharray="5,5" />
          <circle cx={cx} cy={cy} r="30" fill="#3b82f6" />
          <text x={cx} y={cy} dy="5" textAnchor="middle" fill="white" fontSize="12" pointerEvents="none">地球</text>

          <g transform="translate(260, 150)">
             <Sun size={32} color="#fbbf24" className="animate-pulse" />
             <text x="0" y="25" textAnchor="middle" fill="#fbbf24" fontSize="10">太陽</text>
          </g>
          <line x1="260" y1="150" x2="280" y2="150" stroke="#fbbf24" strokeWidth="2" />
          
          <line x1={cx} y1={cy} x2={moonX} y2={moonY} stroke="#94a3b8" strokeWidth="1" opacity="0.5" />

          <g transform={`translate(${moonX}, ${moonY})`}>
             <circle r="15" fill="#333" /> 
             <path d="M 0 -15 A 15 15 0 0 1 0 15 Z" fill="#fefce8" />
             <text y="-20" textAnchor="middle" fill="white" fontSize="12">月</text>
          </g>

          <circle cx={moonX} cy={moonY} r="25" fill="transparent" stroke="rgba(255,255,255,0.3)" strokeWidth={isDragging ? 2 : 0} />

        </svg>
        <div className="absolute bottom-2 right-2 text-xs text-slate-400 pointer-events-none">
            月をドラッグして動かしてみてね！
        </div>
      </div>
    </div>
  );
};

// MoonView Component
interface MoonViewProps {
  angle: number;
}

function calculateLitPath(cx: number, cy: number, r: number, angle: number): string {
  const rad = (angle * Math.PI) / 180;
  if (angle === 0 || angle === 360) return ""; 
  if (Math.abs(angle - 180) < 0.1) return `M ${cx-r},${cy} A ${r},${r} 0 1,1 ${cx+r},${cy} A ${r},${r} 0 1,1 ${cx-r},${cy}`; 
  
  const isWaxing = angle < 180;
  const tx = r * Math.cos(rad);
  const startX = cx;
  const startY = cy - r;
  const endX = cx;
  const endY = cy + r;
  let path = "";
  
  if (isWaxing) {
    path += `M ${startX},${startY} A ${r},${r} 0 0,1 ${endX},${endY}`;
    const sweep = angle < 90 ? 0 : 1; 
    path += ` A ${Math.abs(tx)},${r} 0 0,${sweep} ${startX},${startY}`;
  } else {
    path += `M ${startX},${startY} A ${r},${r} 0 0,0 ${endX},${endY}`;
    const sweep = angle < 270 ? 1 : 0;
    path += ` A ${Math.abs(tx)},${r} 0 0,${sweep} ${startX},${startY}`;
  }
  return path;
}

const MoonView: React.FC<MoonViewProps> = ({ angle }) => {
  const normalizedAngle = (angle % 360 + 360) % 360;
  const radius = 80;
  const cx = 100;
  const cy = 100;
  
  return (
    <div className="flex flex-col items-center animate-float">
      <h3 className="text-xl font-bold mb-4 text-sky-300">地球から見た様子</h3>
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx={cx} cy={cy} r={radius} fill="#334155" />
        <path 
          d={calculateLitPath(cx, cy, radius, normalizedAngle)} 
          fill="#fefce8"
          filter="url(#glow)"
        />
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

// ChatBot Component
const ChatBot: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'こんにちは！お月さまのことで知りたいことがあったら聞いてね！' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await chatWithMoon(input);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <div className="bg-slate-800/50 rounded-3xl p-4 border border-slate-700 h-full flex flex-col shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-3 shrink-0">
        <Sparkles className="text-yellow-300" size={20} />
        <h3 className="font-bold text-lg">Gemini先生に質問</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-sky-600 text-white rounded-tr-sm' 
                : 'bg-slate-700 text-slate-100 rounded-tl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 p-4 rounded-2xl rounded-tl-sm">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="ここに入力してね"
          className="flex-1 bg-slate-900/80 border border-slate-600 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-sky-500 transition-all shadow-inner"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-600 text-white p-3 rounded-full transition-colors shadow-lg flex-shrink-0"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

// QuizSection Component
const QuizSection: React.FC = () => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    const generatedQuestions = await generateQuiz();
    setQuestions(generatedQuestions);
    setLoading(false);
    if (generatedQuestions.length > 0) {
      setQuizStarted(true);
      setCurrentQuestion(0);
      setScore(0);
      setShowResult(false);
      setAnswerChecked(false);
      setSelectedAnswer(null);
    }
  };

  const handleAnswer = (index: number) => {
    if (answerChecked) return;
    setSelectedAnswer(index);
    setAnswerChecked(true);
    if (index === questions[currentQuestion].correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setAnswerChecked(false);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-800/50 rounded-2xl p-8 animate-pulse">
        <div className="text-xl font-bold text-sky-300 mb-4">クイズを作っているよ...</div>
        <RefreshCcw className="animate-spin text-sky-500" size={48} />
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="bg-slate-800/50 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full border border-slate-700">
        <Trophy className="text-yellow-400 mb-4" size={64} />
        <h2 className="text-2xl font-bold mb-2">月博士クイズ</h2>
        <p className="text-slate-300 mb-6">Gemini先生が作ったクイズに挑戦しよう！</p>
        <button 
          onClick={startQuiz}
          className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-transform hover:scale-105"
        >
          <Play size={20} />
          スタート！
        </button>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="bg-slate-800/50 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full border border-slate-700">
        <div className="text-6xl font-bold mb-4 text-yellow-400">{score} / {questions.length}</div>
        <h2 className="text-2xl font-bold mb-6">
          {score === questions.length ? '全問正解！すごい！🎉' : 'よくがんばったね！👏'}
        </h2>
        <button 
          onClick={startQuiz}
          className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2"
        >
          <RefreshCcw size={18} />
          もう一回やる
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 text-slate-400 text-sm">
        <span>もんだい {currentQuestion + 1} / {questions.length}</span>
        <span>今のスコア: {score}</span>
      </div>
      
      <h3 className="text-xl font-bold mb-6 leading-relaxed">{question.question}</h3>
      
      <div className="space-y-3 flex-1">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            disabled={answerChecked}
            className={`w-full p-4 rounded-xl text-left transition-all border-2 relative ${
              answerChecked 
                ? idx === question.correctAnswerIndex 
                  ? 'bg-green-900/30 border-green-500 text-green-100'
                  : idx === selectedAnswer 
                    ? 'bg-red-900/30 border-red-500 text-red-100'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                : 'bg-slate-700 border-transparent hover:bg-slate-600 hover:border-sky-400'
            }`}
          >
            {option}
            {answerChecked && idx === question.correctAnswerIndex && <CheckCircle className="absolute right-4 top-4 text-green-500" />}
            {answerChecked && idx === selectedAnswer && idx !== question.correctAnswerIndex && <XCircle className="absolute right-4 top-4 text-red-500" />}
          </button>
        ))}
      </div>

      {answerChecked && (
        <div className="mt-4 bg-slate-900/50 p-4 rounded-xl animate-fadeIn">
          <div className="font-bold text-yellow-300 mb-1">解説：</div>
          <p className="text-sm text-slate-200 mb-3">{question.explanation}</p>
          <button 
            onClick={nextQuestion}
            className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 rounded-lg"
          >
            {currentQuestion < questions.length - 1 ? '次の問題へ' : '結果を見る'}
          </button>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP ---

const getPhaseName = (angle: number) => {
  const normalized = (angle % 360 + 360) % 360;
  if (normalized > 350 || normalized < 10) return '新月（しんげつ）';
  if (normalized < 80) return '三日月（みかづき）など';
  if (normalized >= 80 && normalized <= 100) return '上弦の月（じょうげんのつき）';
  if (normalized < 170) return '十三夜（じゅうさんや）など';
  if (normalized >= 170 && normalized <= 190) return '満月（まんげつ）';
  if (normalized < 260) return '更待月（ふけまちづき）など';
  if (normalized >= 260 && normalized <= 280) return '下弦の月（かげんのつき）';
  return '有明の月（ありあけのつき）など';
};

const App: React.FC = () => {
  const [angle, setAngle] = useState(45);
  const [explanation, setExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const phaseName = getPhaseName(angle);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoadingExplanation(true);
      const simpleName = phaseName.split('（')[0];
      const text = await fetchExplanation(simpleName);
      setExplanation(text);
      setLoadingExplanation(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [phaseName]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-sky-500/30">
      <StarryBackground />
      
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="bg-yellow-100 rounded-full p-1">
               <Sparkles className="text-yellow-500" size={20} />
             </div>
             <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-yellow-200 filter drop-shadow-sm">
              お月さまの満ち欠け探検隊
            </h1>
           </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-12">
        
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Visualizer Section */}
          <div className="space-y-6">
             <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-6 border border-slate-700 shadow-xl">
                <div className="flex justify-center">
                   <OrbitVisualizer angle={angle} setAngle={setAngle} />
                </div>
                <p className="text-center text-slate-400 text-sm mt-4">
                  月をドラッグして動かしてみよう！
                </p>
             </div>

             <div className="bg-indigo-900/30 backdrop-blur-sm rounded-3xl p-6 border border-indigo-500/30 shadow-lg">
                <div className="flex items-center gap-3 mb-4 text-indigo-300 font-bold text-lg">
                  <BookOpen size={24} />
                  <span>Gemini先生の解説</span>
                </div>
                <div className="bg-slate-900/40 p-5 rounded-2xl text-lg leading-relaxed relative min-h-[100px]">
                   {loadingExplanation ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                     </div>
                   ) : (
                     <p>{explanation || "月を動かして、いろいろな形を見てみよう！"}</p>
                   )}
                </div>
             </div>
          </div>

          {/* Moon View Section */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-700 shadow-xl flex flex-col items-center justify-center relative min-h-[400px]">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 rounded-3xl pointer-events-none"></div>
             <MoonView angle={angle} />
             <div className="mt-8 text-center z-10">
                <div className="text-4xl font-bold text-yellow-100 mb-2 filter drop-shadow-lg">{phaseName}</div>
                <div className="text-slate-300 text-lg font-medium">
                  太陽との角度: {Math.round(angle)}°
                </div>
             </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quiz */}
          <div className="h-[600px]">
            <QuizSection />
          </div>

          {/* Chat */}
          <div className="h-[600px]">
            <ChatBot />
          </div>
        </section>

      </main>
    </div>
  );
};

// --- ENTRY POINT ---

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
