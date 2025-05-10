import { QuestionDocument } from "@/models/Question";
import SingleQuestion from "./QuestionTypes/SingleQuestion";

interface QuestionRendererProps {
  question: QuestionDocument;
  answer: string;
  onAnswerChange: (value: string) => void;
}

export default function QuestionRenderer({
  question,
  answer,
  onAnswerChange,
}: QuestionRendererProps) {
  if (question.type !== "single") {
    return <div>Неподдерживаемый тип вопроса</div>;
  }

  return (
    <SingleQuestion
      question={question}
      answer={answer}
      onAnswerChange={onAnswerChange}
    />
  );
}
