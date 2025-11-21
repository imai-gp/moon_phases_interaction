import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { Trophy, RefreshCcw, CheckCircle, XCircle, Play } from 'lucide-react';

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

export default QuizSection;