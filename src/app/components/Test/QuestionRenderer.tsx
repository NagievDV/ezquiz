import { QuestionDocument } from "@/models/Question";
import SingleQuestion from "./QuestionTypes/SingleQuestion";
import MultipleQuestion from "./QuestionTypes/MultipleQuestion";
import OrderQuestion from "./QuestionTypes/OrderQuestion";
import MatchQuestion from "./QuestionTypes/MatchQuestion";
import Image from "next/image";

interface QuestionRendererProps {
  question: QuestionDocument;
  answer: string | string[] | Record<string, string>;
  onAnswerChange: (value: string | string[] | Record<string, string>) => void;
}

const QuestionImage = ({ imageUrl }: { imageUrl: string }) => (
  <div className="flex justify-center mb-4">
    <div className="relative w-full flex justify-center">
      <Image
        src={imageUrl}
        alt="Question image"
        width={800}
        height={600}
        className="max-w-full h-auto object-contain rounded-lg"
        style={{ maxHeight: "600px" }}
      />
    </div>
  </div>
);

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
