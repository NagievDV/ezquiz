"use client";

import { Question, QuestionType, MatchPair } from "@/types/test";
import { FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { MdDragHandle } from "react-icons/md";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
} from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { CgAlbum } from "react-icons/cg";
import { uploadImage } from "@/libs/imageUpload";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface QuestionEditorProps {
  question: Question;
  onChange: (question: Question) => void;
  onRemove: () => void;
}

const MAX_ITEMS = 10;
const MAX_QUESTION_LENGTH = 300;
const MAX_OPTION_LENGTH = 200;
const MIN_POINTS = 1;
const MAX_POINTS = 100;

export default function QuestionEditor({
  question,
  onChange,
  onRemove,
}: QuestionEditorProps) {
  useEffect(() => {
    if (
      question.type === "order" &&
      (!question.order || !question.order.length)
    ) {
      onChange({
        ...question,
        order: ["", ""],
      });
    }
  }, [question.type]);

  const handleTextChange = (questionText: string) => {
    onChange({ ...question, question: questionText });
  };

  const handlePointsChange = (points: number | "") => {
    if (points === "") {
      onChange({ ...question, points: MIN_POINTS });
    } else {
      const validPoints = Math.min(Math.max(points, MIN_POINTS), MAX_POINTS);
      onChange({ ...question, points: validPoints });
    }
  };

  const handleOptionsChange = (
    options: string[],
    isNewItem = false,
    checkDuplicates = false
  ) => {
    if (question.type === "single" || question.type === "multiple") {
      const newOptions =
        isNewItem || !checkDuplicates
          ? options
          : options.filter((option) => option.trim() !== "");

      if (!isNewItem && checkDuplicates && newOptions.length > 0) {
        const hasEmptyOptions = newOptions.some((opt) => opt.trim() === "");
        if (hasEmptyOptions) {
          toast.error("Заполните все варианты ответов");
          return;
        }
      }

      const uniqueOptions = checkDuplicates
        ? Array.from(new Set(newOptions.map((opt) => opt.trim()))).filter(
            (opt) => opt !== ""
          )
        : newOptions;

      if (question.type === "single") {
        const currentAnswer = question.correctAnswer as string;
        onChange({
          ...question,
          options: uniqueOptions,
          correctAnswer: uniqueOptions.includes(currentAnswer)
            ? currentAnswer
            : "",
        });
      } else {
        const currentAnswers = question.correctAnswer as string[];
        const validAnswers = currentAnswers.filter((answer) =>
          uniqueOptions.includes(answer)
        );
        onChange({
          ...question,
          options: uniqueOptions,
          correctAnswer: validAnswers,
        });
      }
    }
  };

  const handleCorrectAnswerChange = (value: string | string[]) => {
    if (question.type === "single") {
      onChange({ ...question, correctAnswer: value as string });
    } else if (question.type === "multiple") {
      const newAnswers = value as string[];
      const validAnswers = newAnswers.filter((answer) =>
        question.options?.includes(answer)
      );
      onChange({ ...question, correctAnswer: validAnswers });
    }
  };

  const handleOrderItemsChange = (
    items: string[],
    isNewItem = false,
    validateEmpty = false
  ) => {
    if (question.type === "order") {
      const newItems = items;

      if (validateEmpty && newItems.length > 0) {
        const hasEmptyItems = newItems.some((item) => item.trim() === "");
        if (hasEmptyItems) {
          toast.error("Заполните все элементы для сортировки");
          return;
        }
      }

      if (newItems.length < 2) {
        newItems.push("");
      }

      onChange({
        ...question,
        order: newItems,
      });
    }
  };

  const handleMatchPairsChange = (
    matchPairs: MatchPair[],
    isNewItem = false,
    validateEmpty = false
  ) => {
    if (question.type === "match") {
      if (validateEmpty && matchPairs.length > 0) {
        const hasEmptyParts = matchPairs.some(
          (pair) => pair.left.trim() === "" || pair.right.trim() === ""
        );
        if (hasEmptyParts) {
          toast.error("Заполните обе части всех пар для сопоставления");
          return;
        }
      }

      onChange({ ...question, matchPairs });
    }
  };

  const reorderItems = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleImageUpload = async (file: File) => {
    try {
      const url = await uploadImage(file);
      onChange({
        ...question,
        imageUrl: url,
      });
    } catch (error) {
      console.error("Ошибка при загрузке изображения:", error);
      toast.error("Ошибка при загрузке изображения");
    }
  };

  const renderSingleChoiceEditor = () => {
    if (question.type !== "single") return null;
    const hasReachedLimit = question.options.length >= MAX_ITEMS;

    return (
      <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Варианты ответов
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Выберите один правильный вариант, отметив его радиокнопкой слева
              </p>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {question.options.length}/{MAX_ITEMS}
            </span>
          </div>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center gap-2 sm:gap-3 group relative"
              >
                <input
                  type="radio"
                  checked={question.correctAnswer === option}
                  onChange={() => handleCorrectAnswerChange(option)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 shrink-0"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue.length <= MAX_OPTION_LENGTH) {
                      const newOptions = [...question.options];
                      newOptions[index] = newValue;
                      handleOptionsChange(newOptions, false, false);
                    }
                  }}
                  onBlur={(e) => {
                    const newOptions = [...question.options];
                    newOptions[index] = e.target.value;
                    handleOptionsChange(newOptions, false, true);
                  }}
                  className="flex-1 w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white caret-blue-500 dark:caret-blue-400 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all hover:border-gray-400 dark:hover:border-gray-500"
                  placeholder="Вариант ответа"
                  maxLength={MAX_OPTION_LENGTH}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newOptions = question.options.filter(
                      (_, i) => i !== index
                    );
                    handleOptionsChange(newOptions, false, true);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-500 transition-all absolute -right-1 top-0 sm:static sm:translate-y-0 sm:opacity-0 group-hover:opacity-100 z-10"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              handleOptionsChange([...question.options, ""], true, false)
            }
            disabled={hasReachedLimit}
            className={`mt-3 flex items-center gap-2 text-sm transition-all ${
              hasReachedLimit
                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
            }`}
          >
            <FiPlus className="h-4 w-4" />
            {hasReachedLimit ? "Достигнут лимит вариантов" : "Добавить вариант"}
          </button>
        </div>
      </div>
    );
  };

  const renderMultipleChoiceEditor = () => {
    if (question.type !== "multiple") return null;
    const hasReachedLimit = question.options.length >= MAX_ITEMS;

    return (
      <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Варианты ответов
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Отметьте галочками все правильные варианты ответов
              </p>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {question.options.length}/{MAX_ITEMS}
            </span>
          </div>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center gap-2 sm:gap-3 group relative"
              >
                <input
                  type="checkbox"
                  checked={(question.correctAnswer as string[]).includes(
                    option
                  )}
                  onChange={(e) => {
                    const newCorrectAnswers = e.target.checked
                      ? [...(question.correctAnswer as string[]), option]
                      : (question.correctAnswer as string[]).filter(
                          (a) => a !== option
                        );
                    handleCorrectAnswerChange(newCorrectAnswers);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 shrink-0"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue.length <= MAX_OPTION_LENGTH) {
                      const newOptions = [...question.options];
                      newOptions[index] = newValue;
                      handleOptionsChange(newOptions, false, false);
                    }
                  }}
                  onBlur={(e) => {
                    const newOptions = [...question.options];
                    newOptions[index] = e.target.value;
                    handleOptionsChange(newOptions, false, true);
                  }}
                  className="flex-1 w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white caret-blue-500 dark:caret-blue-400 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all hover:border-gray-400 dark:hover:border-gray-500"
                  placeholder="Вариант ответа"
                  maxLength={MAX_OPTION_LENGTH}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newOptions = question.options.filter(
                      (_, i) => i !== index
                    );
                    handleOptionsChange(newOptions, false, true);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-500 transition-all absolute -right-1 top-0 sm:static sm:translate-y-0 sm:opacity-0 group-hover:opacity-100 z-10"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              handleOptionsChange([...question.options, ""], true, false)
            }
            disabled={hasReachedLimit}
            className={`mt-3 flex items-center gap-2 text-sm transition-all ${
              hasReachedLimit
                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
            }`}
          >
            <FiPlus className="h-4 w-4" />
            {hasReachedLimit ? "Достигнут лимит вариантов" : "Добавить вариант"}
          </button>
        </div>
      </div>
    );
  };

  const renderOrderEditor = () => {
    if (question.type !== "order") return null;
    if (!question.order) return null;

    const hasReachedLimit = question.order.length >= MAX_ITEMS;

    return (
      <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Элементы для сортировки
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Расположите элементы в правильном порядке. Студент должен будет
                восстановить этот порядок
              </p>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {question.order.length}/{MAX_ITEMS}
            </span>
          </div>
          <DragDropContext
            onDragEnd={(result: DropResult) => {
              if (!result.destination) return;
              const items = reorderItems(
                question.order,
                result.source.index,
                result.destination.index
              );
              handleOrderItemsChange(items);
            }}
          >
            <Droppable droppableId="items">
              {(provided: DroppableProvided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {question.order.map((item, index) => (
                    <Draggable
                      key={`item-${index}`}
                      draggableId={`item-${index}`}
                      index={index}
                    >
                      {(provided: DraggableProvided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 group bg-white dark:bg-gray-700 rounded-lg p-2 shadow-sm relative pr-10"
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab"
                          >
                            <MdDragHandle className="h-5 w-5" />
                          </div>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              if (newValue.length <= MAX_OPTION_LENGTH) {
                                const newItems = [...question.order];
                                newItems[index] = newValue;
                                handleOrderItemsChange(newItems, true, false);
                              }
                            }}
                            onBlur={(e) => {
                              const newValue = e.target.value;
                              const newItems = [...question.order];
                              newItems[index] = newValue;
                              const wasFilledBefore = item.trim() !== "";
                              const shouldValidate =
                                wasFilledBefore && newValue.trim() === "";
                              handleOrderItemsChange(
                                newItems,
                                false,
                                shouldValidate
                              );
                            }}
                            className="flex-1 w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white caret-blue-500 dark:caret-blue-400 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all hover:border-gray-400 dark:hover:border-gray-500"
                            placeholder="Элемент"
                            maxLength={MAX_OPTION_LENGTH}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = question.order.filter(
                                (_, i) => i !== index
                              );
                              handleOrderItemsChange(newItems, false, true);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-500 transition-all absolute -right-1 top-0 sm:static sm:translate-y-0 sm:opacity-0 group-hover:opacity-100 z-10"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <button
            type="button"
            onClick={() =>
              handleOrderItemsChange([...question.order, ""], true, false)
            }
            disabled={hasReachedLimit}
            className={`mt-3 flex items-center gap-2 text-sm transition-all ${
              hasReachedLimit
                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
            }`}
          >
            <FiPlus className="h-4 w-4" />
            {hasReachedLimit ? "Достигнут лимит элементов" : "Добавить элемент"}
          </button>
        </div>
      </div>
    );
  };

  const renderMatchEditor = () => {
    if (question.type !== "match") return null;
    const hasReachedLimit = question.matchPairs.length >= MAX_ITEMS;

    return (
      <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Пары для сопоставления
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Создайте пары для сопоставления. Студент должен будет соединить
                левые элементы с правыми
              </p>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {question.matchPairs.length}/{MAX_ITEMS}
            </span>
          </div>
          <div className="space-y-3">
            {question.matchPairs.map((pair, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-3 group relative pr-10"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-3 w-full">
                  <input
                    type="text"
                    value={pair.left}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (newValue.length <= MAX_OPTION_LENGTH) {
                        const newPairs = [...question.matchPairs];
                        newPairs[index] = { ...pair, left: newValue };
                        handleMatchPairsChange(newPairs, false, false);
                      }
                    }}
                    onBlur={(e) => {
                      const newValue = e.target.value;
                      const newPairs = [...question.matchPairs];
                      newPairs[index] = { ...pair, left: newValue };
                      const wasFilledBefore = pair.left.trim() !== "";
                      const shouldValidate =
                        wasFilledBefore && newValue.trim() === "";
                      handleMatchPairsChange(newPairs, false, shouldValidate);
                    }}
                    className="flex-1 w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white caret-blue-500 dark:caret-blue-400 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all hover:border-gray-400 dark:hover:border-gray-500"
                    placeholder="Левая часть"
                    maxLength={MAX_OPTION_LENGTH}
                  />
                  <span className="hidden sm:block text-gray-400 dark:text-gray-500">
                    →
                  </span>
                  <input
                    type="text"
                    value={pair.right}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (newValue.length <= MAX_OPTION_LENGTH) {
                        const newPairs = [...question.matchPairs];
                        newPairs[index] = { ...pair, right: newValue };
                        handleMatchPairsChange(newPairs, false, false);
                      }
                    }}
                    onBlur={(e) => {
                      const newValue = e.target.value;
                      const newPairs = [...question.matchPairs];
                      newPairs[index] = { ...pair, right: newValue };
                      const wasFilledBefore = pair.right.trim() !== "";
                      const shouldValidate =
                        wasFilledBefore && newValue.trim() === "";
                      handleMatchPairsChange(newPairs, false, shouldValidate);
                    }}
                    className="flex-1 w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white caret-blue-500 dark:caret-blue-400 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all hover:border-gray-400 dark:hover:border-gray-500"
                    placeholder="Правая часть"
                    maxLength={MAX_OPTION_LENGTH}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newPairs = question.matchPairs.filter(
                      (_, i) => i !== index
                    );
                    handleMatchPairsChange(newPairs, false, true);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-500 transition-all absolute -right-1 top-0 sm:static sm:translate-y-0 sm:opacity-0 group-hover:opacity-100 z-10"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              handleMatchPairsChange(
                [...question.matchPairs, { left: "", right: "" }],
                true,
                false
              )
            }
            disabled={hasReachedLimit}
            className={`mt-3 flex items-center gap-2 text-sm transition-all ${
              hasReachedLimit
                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
            }`}
          >
            <FiPlus className="h-4 w-4" />
            {hasReachedLimit ? "Достигнут лимит пар" : "Добавить пару"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 relative pb-2">
        <div className="flex-1 space-y-4 w-full pr-10">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Текст вопроса ({question.question.length}/{MAX_QUESTION_LENGTH})
              </label>
              <span className="text-sm font-medium px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {question.type === "single" && "Один вариант ответа"}
                {question.type === "multiple" && "Множественный выбор"}
                {question.type === "order" && "Порядок элементов"}
                {question.type === "match" && "Сопоставление"}
              </span>
            </div>
            <textarea
              value={question.question}
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue.length <= MAX_QUESTION_LENGTH) {
                  handleTextChange(newValue);
                }
              }}
              className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white caret-blue-500 dark:caret-blue-400 placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none transition-all hover:border-gray-400 dark:hover:border-gray-500"
              rows={3}
              placeholder="Введите текст вопроса"
              maxLength={MAX_QUESTION_LENGTH}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Изображение к вопросу
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
              {question.imageUrl ? (
                <div className="relative w-full">
                  <div className="relative w-full flex justify-center">
                    <Image
                      src={question.imageUrl}
                      alt="Question image"
                      width={500}
                      height={300}
                      className="max-w-full h-auto object-contain rounded-lg"
                      style={{ maxHeight: "400px" }}
                    />
                    <button
                      type="button"
                      onClick={() => onChange({ ...question, imageUrl: "" })}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-center">
                  <CgAlbum className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Загрузить файл</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG до 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Баллы за вопрос ({MIN_POINTS}-{MAX_POINTS})
            </label>
            <input
              type="number"
              min={MIN_POINTS}
              max={MAX_POINTS}
              value={question.points}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const value =
                  e.target.value === "" ? "" : Number(e.target.value);
                handlePointsChange(value);
              }}
              className="block w-32 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white caret-blue-500 dark:caret-blue-400 transition-all hover:border-gray-400 dark:hover:border-gray-500"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 absolute top-0 right-0 -mt-1"
        >
          <FiTrash2 className="h-5 w-5" />
        </button>
      </div>

      {question.type === "single" && renderSingleChoiceEditor()}
      {question.type === "multiple" && renderMultipleChoiceEditor()}
      {question.type === "order" && renderOrderEditor()}
      {question.type === "match" && renderMatchEditor()}
    </div>
  );
}
