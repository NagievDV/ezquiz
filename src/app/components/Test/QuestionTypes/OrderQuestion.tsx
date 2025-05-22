import { QuestionDocument } from "@/models/Question";
import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { IoReorderThreeOutline } from "react-icons/io5";

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface OrderQuestionProps {
  question: QuestionDocument;
  answer: string[];
  onAnswerChange: (value: string[]) => void;
}

export default function OrderQuestion({
  question,
  answer,
  onAnswerChange,
}: OrderQuestionProps) {
  const [items, setItems] = useState<string[]>(() => {
    if (Array.isArray(answer) && answer.length > 0) return answer;
    const nonEmptyItems = (question.order || []).filter(
      (item) => item.trim() !== ""
    );
    return nonEmptyItems.length >= 2
      ? shuffleArray(nonEmptyItems)
      : question.order || [];
  });

  useEffect(() => {
    if (Array.isArray(answer) && answer.length > 0) {
      setItems(answer);
    } else if (question.order?.length >= 2 && items.length === 0) {
      const nonEmptyItems = question.order.filter((item) => item.trim() !== "");
      setItems(
        nonEmptyItems.length >= 2
          ? shuffleArray([...question.order])
          : [...question.order]
      );
    }
  }, [answer, question.order]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
    onAnswerChange(newItems);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index], newItems[index - 1]] = [
      newItems[index - 1],
      newItems[index],
    ];
    setItems(newItems);
    onAnswerChange(newItems);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [
      newItems[index + 1],
      newItems[index],
    ];
    setItems(newItems);
    onAnswerChange(newItems);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4 dark:text-gray-200 whitespace-pre-wrap break-words">
        {question.question}
      </h3>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {items.map((item, index) => (
                <Draggable
                  key={`item-${index}`}
                  draggableId={`item-${index}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`
                        p-3 sm:p-4 rounded-lg
                        ${
                          snapshot.isDragging
                            ? "bg-blue-100 dark:bg-blue-900"
                            : "bg-gray-50 dark:bg-gray-700"
                        }
                        hover:bg-blue-50 dark:hover:bg-gray-600
                        transition-colors duration-200
                        flex items-center gap-3
                        touch-manipulation
                      `}
                    >
                      <div className="text-gray-500 dark:text-gray-400 min-w-[24px] text-center">
                        {index + 1}.
                      </div>
                      <div className="flex-1 text-sm sm:text-base dark:text-gray-200">
                        {item}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveUp(index)}
                          className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                            ${
                              index === 0 ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          disabled={index === 0}
                        >
                          <svg
                            className="w-5 h-5 text-gray-600 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                            ${
                              index === items.length - 1
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          disabled={index === items.length - 1}
                        >
                          <svg
                            className="w-5 h-5 text-gray-600 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <div
                          {...provided.dragHandleProps}
                          className="p-1.5 cursor-move touch-manipulation"
                        >
                          <IoReorderThreeOutline className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
