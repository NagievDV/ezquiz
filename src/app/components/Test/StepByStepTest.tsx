import { QuestionDocument } from "@/models/Question";
import QuestionRenderer from "./QuestionRenderer";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

interface StepByStepTestProps {
  testId: string;
  questions: QuestionDocument[];
  answers: Record<string, string | string[] | Record<string, string>>;
  onAnswersUpdate: (
    answers: Record<string, string | string[] | Record<string, string>>
  ) => void;
  onSubmit: (result: { score: number; maxScore: number }) => void;
}

export default function StepByStepTest({
  testId,
  questions,
  answers,
  onAnswersUpdate,
  onSubmit,
}: StepByStepTestProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleSubmit = async () => {
    const maxScore = questions.reduce((acc, q) => acc + q.points, 0);
    const score = questions.reduce((acc, q) => {
      const answer = answers[q._id.toString()];

      switch (q.type) {
        case "single":
          return acc + (answer === q.correctAnswer ? q.points : 0);
        case "multiple":
          const correctAnswers = q.correctAnswer as string[];
          const userAnswers = answer as string[];
          const isCorrect =
            correctAnswers.length === userAnswers.length &&
            correctAnswers.every((a) => userAnswers.includes(a));
          return acc + (isCorrect ? q.points : 0);
        case "order":
          const correctOrder = q.order;
          const userOrder = answer as string[];
          const isOrderCorrect = correctOrder.every(
            (item, index) => item === userOrder[index]
          );
          return acc + (isOrderCorrect ? q.points : 0);
        case "match":
          const userMatches = (answer || {}) as Record<string, string>;
          const correctMatches = q.matchPairs || [];
          const isMatchCorrect = correctMatches.every(
            (pair) =>
              pair?.left && pair?.right && userMatches[pair.left] === pair.right
          );
          return acc + (isMatchCorrect ? q.points : 0);
        default:
          return acc;
      }
    }, 0);

    if (user) {
      try {
        const res = await fetch("/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            testId: testId,
            answers,
            score,
            maxScore,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Ошибка сохранения");
        }

        onSubmit({ score, maxScore });
        router.refresh();
      } catch (error) {
        console.error("Ошибка:", error);
        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert("Произошла неизвестная ошибка");
        }
      }
    } else {
      onSubmit({ score, maxScore });
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnswer = answers[currentQuestion._id.toString()];

  const handleNext = () => {
    if (hasAnswer) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      alert("Пожалуйста, выберите ответ перед тем как продолжить");
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Вопрос {currentQuestionIndex + 1} из {questions.length}
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
        <div
          className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300"
          style={{
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
          }}
        ></div>
      </div>

      <QuestionRenderer
        key={currentQuestion._id.toString()}
        question={currentQuestion}
        answer={answers[currentQuestion._id.toString()] || ""}
        onAnswerChange={(value) =>
          onAnswersUpdate({
            ...answers,
            [currentQuestion._id.toString()]: value,
          })
        }
      />

      <div className="flex justify-end gap-4 mt-6">
        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={!hasAnswer}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg transition-colors font-medium text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Завершить тест
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!hasAnswer}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg transition-colors font-medium text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Следующий вопрос
          </button>
        )}
      </div>

      {!user && (
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Для сохранения результатов{" "}
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              войдите в систему
            </Link>
          </span>
        </div>
      )}
    </div>
  );
}
