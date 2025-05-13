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

      <div className="space-y-3">
        {question.options?.map((option, index) => (
          <label
            key={index}
            className={`
              flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200
              ${
                answer === option
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-2 border-blue-500"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }
            `}
          >
            <div className="relative flex items-center justify-center min-w-[20px] h-5">
              <input
                type="radio"
                name={question._id.toString()}
                value={option}
                checked={answer === option}
                onChange={(e) => onAnswerChange(e.target.value)}
                className="appearance-none w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600
                  checked:border-blue-500 dark:checked:border-blue-400
                  transition-colors duration-200 cursor-pointer
                  focus:outline-none focus:ring-0 focus:ring-offset-0"
              />
              {answer === option && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                </div>
              )}
            </div>
            <span className="ml-3 text-lg">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
