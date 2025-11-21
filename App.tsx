import React, { useState, useEffect } from 'react';
import StarryBackground from './components/StarryBackground';
import OrbitVisualizer from './components/OrbitVisualizer';
import MoonView from './components/MoonView';
import ChatBot from './components/ChatBot';
import QuizSection from './components/QuizSection';
import { fetchExplanation } from './services/geminiService';
import { BookOpen, Sparkles } from 'lucide-react';

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

export default App;