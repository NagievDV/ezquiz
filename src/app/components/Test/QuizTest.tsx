import { QuestionDocument } from "@/models/Question";
import QuestionRenderer from "./QuestionRenderer";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

interface QuizTestProps {
  testId: string;
  questions: QuestionDocument[];
  answers: Record<string, string | string[] | Record<string, string>>;
  onAnswersUpdate: (
    answers: Record<string, string | string[] | Record<string, string>>
  ) => void;
  onSubmit: (result: { score: number; maxScore: number }) => void;
}

export default function QuizTest({
  testId,
  questions,
  answers,
  onAnswersUpdate,
  onSubmit,
}: QuizTestProps) {
  const { user } = useAuth();
  const router = useRouter();

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
          const correctOrder = q.order || [];
          const userOrder = (answer as string[]) || [];
          const isOrderCorrect =
            correctOrder.length > 0 &&
            userOrder.length > 0 &&
            correctOrder.every((item, index) => item === userOrder[index]);
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

  return (
    <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <FiArrowLeft className="h-5 w-5" />
          <span>На главную</span>
        </button>
      </div>

      {questions.map((question) => (
        <QuestionRenderer
          key={question._id.toString()}
          question={question}
          answer={answers[question._id.toString()] || ""}
          onAnswerChange={(value) =>
            onAnswersUpdate({ ...answers, [question._id.toString()]: value })
          }
        />
      ))}

      <button
        onClick={handleSubmit}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg transition-colors font-medium text-lg cursor-pointer"
      >
        Отправить ответы
      </button>

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
