import { QuestionDocument } from "@/models/Question";

interface SingleQuestionProps {
  question: QuestionDocument;
  answer: string;
  onAnswerChange: (value: string) => void;
}

export default function SingleQuestion({
  question,
  answer,
  onAnswerChange,
}: SingleQuestionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4 dark:text-gray-200">
        {question.question}
      </h3>

      <div className="space-y-2">
        {question.options?.map((option, index) => (
          <label
            key={index}
            className={`
              flex items-center p-3 rounded cursor-pointer transition-colors
              ${
                answer === option
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
              }
            `}
          >
            <input
              type="radio"
              name={question._id.toString()}
              value={option}
              checked={answer === option}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 
                dark:bg-gray-700 dark:border-gray-600"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
