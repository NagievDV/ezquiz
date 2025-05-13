import { QuestionDocument } from "@/models/Question";
import SingleQuestion from "./QuestionTypes/SingleQuestion";
import MultipleQuestion from "./QuestionTypes/MultipleQuestion";
import OrderQuestion from "./QuestionTypes/OrderQuestion";
import MatchQuestion from "./QuestionTypes/MatchQuestion";
import Image from "next/image";
import { useState } from "react";

interface QuestionRendererProps {
  question: QuestionDocument;
  answer: string | string[] | Record<string, string>;
  onAnswerChange: (value: string | string[] | Record<string, string>) => void;
}

// Компонент для отображения изображения вопроса
const QuestionImage = ({ imageUrl }: { imageUrl: string }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="mb-4 w-full max-w-2xl mx-auto h-[300px] rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Изображение недоступно
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 relative w-full max-w-2xl mx-auto h-[300px] rounded-lg overflow-hidden">
      <Image
        src={imageUrl}
        alt="Изображение к вопросу"
        fill
        style={{ objectFit: "contain" }}
        className="rounded-lg"
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
};

export default function QuestionRenderer({
  question,
  answer,
  onAnswerChange,
}: QuestionRendererProps) {
  const renderQuestion = () => {
    switch (question.type) {
      case "single":
        return (
          <SingleQuestion
            question={question}
            answer={answer as string}
            onAnswerChange={onAnswerChange as (value: string) => void}
          />
        );
      case "multiple":
        return (
          <MultipleQuestion
            question={question}
            answer={Array.isArray(answer) ? answer : []}
            onAnswerChange={onAnswerChange as (value: string[]) => void}
          />
        );
      case "order":
        return (
          <OrderQuestion
            question={question}
            answer={Array.isArray(answer) ? answer : []}
            onAnswerChange={onAnswerChange as (value: string[]) => void}
          />
        );
      case "match":
        return (
          <MatchQuestion
            question={question}
            answer={answer as Record<string, string>}
            onAnswerChange={
              onAnswerChange as (value: Record<string, string>) => void
            }
          />
        );
      default:
        return <div>Неподдерживаемый тип вопроса</div>;
    }
  };

  return (
    <div className="space-y-4">
      {question.imageUrl && <QuestionImage imageUrl={question.imageUrl} />}
      {renderQuestion()}
    </div>
  );
}
