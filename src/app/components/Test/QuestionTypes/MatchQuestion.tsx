import { QuestionDocument } from "@/models/Question";
import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { IoReorderThreeOutline } from "react-icons/io5";

interface MatchPair {
  left: string;
  right: string;
}

interface MatchQuestionProps {
  question: QuestionDocument;
  answer: Record<string, string>;
  onAnswerChange: (value: Record<string, string>) => void;
}

interface DraggableItem {
  id: string;
  content: string;
}

export default function MatchQuestion({
  question,
  answer,
  onAnswerChange,
}: MatchQuestionProps) {
  const matchPairs = (question.matchPairs as MatchPair[]) || [];
  const [rightItems, setRightItems] = useState<DraggableItem[]>(() => {
    const items = matchPairs.map((pair) => ({
      id: pair.right,
      content: pair.right,
    }));
    return answer && Object.values(answer).length > 0
      ? items.sort((a, b) => {
          const aIndex = Object.values(answer).indexOf(a.id);
          const bIndex = Object.values(answer).indexOf(b.id);
          return aIndex - bIndex;
        })
      : shuffleArray(items);
  });

  function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(rightItems);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setRightItems(newItems);
    const newAnswer: Record<string, string> = {};
    matchPairs.forEach((pair, index) => {
      newAnswer[pair.left] = newItems[index].id;
    });
    onAnswerChange(newAnswer);
  };

  // Функция для перемещения элемента вверх
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...rightItems];
    [newItems[index], newItems[index - 1]] = [
      newItems[index - 1],
      newItems[index],
    ];
    setRightItems(newItems);
    const newAnswer: Record<string, string> = {};
    matchPairs.forEach((pair, i) => {
      newAnswer[pair.left] = newItems[i].id;
    });
    onAnswerChange(newAnswer);
  };

  // Функция для перемещения элемента вниз
  const moveDown = (index: number) => {
    if (index === rightItems.length - 1) return;
    const newItems = [...rightItems];
    [newItems[index], newItems[index + 1]] = [
      newItems[index + 1],
      newItems[index],
    ];
    setRightItems(newItems);
    const newAnswer: Record<string, string> = {};
    matchPairs.forEach((pair, i) => {
      newAnswer[pair.left] = newItems[i].id;
    });
    onAnswerChange(newAnswer);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 dark:text-gray-200">
        {question.question}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Левая колонка (фиксированная) */}
        <div className="space-y-2 w-full">
          {matchPairs.map((pair, index) => (
            <div
              key={pair.left}
              className="p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center gap-3 min-h-[3.5rem] sm:min-h-[4rem]"
            >
              <div className="text-gray-500 dark:text-gray-400 min-w-[24px] text-center">
                {index + 1}.
              </div>
              <div className="flex-1 text-sm sm:text-base dark:text-gray-200">
                {pair.left}
              </div>
            </div>
          ))}
        </div>

        {/* Правая колонка (перетаскиваемая) */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2 w-full"
              >
                {rightItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
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
                          min-h-[3.5rem] sm:min-h-[4rem]
                        `}
                      >
                        <div className="text-gray-500 dark:text-gray-400 min-w-[24px] text-center">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div className="flex-1 text-sm sm:text-base dark:text-gray-200">
                          {item.content}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveUp(index)}
                            className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                              ${
                                index === 0
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
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
                                index === rightItems.length - 1
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            disabled={index === rightItems.length - 1}
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
    </div>
  );
}
