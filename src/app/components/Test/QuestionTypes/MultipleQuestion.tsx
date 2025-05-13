import { QuestionDocument } from "@/models/Question";

interface MultipleQuestionProps {
  question: QuestionDocument;
  answer: string[];
  onAnswerChange: (value: string[]) => void;
}

export default function MultipleQuestion({
  question,
  answer,
  onAnswerChange,
}: MultipleQuestionProps) {
  const handleCheckboxChange = (option: string) => {
    const newAnswer = answer.includes(option)
      ? answer.filter((a) => a !== option)
      : [...answer, option];
    onAnswerChange(newAnswer);
  };

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
              flex items-center p-4 rounded-lg cursor-pointer transition-colors
              ${
                answer.includes(option)
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-2 border-blue-500"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }
            `}
          >
            <input
              type="checkbox"
              checked={answer.includes(option)}
              onChange={() => handleCheckboxChange(option)}
              className="mr-3 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800
                dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-lg">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
