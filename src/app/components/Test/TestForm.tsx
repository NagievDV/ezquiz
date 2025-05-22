"use client";

import { useState, useEffect } from "react";
import { Test, Question, TestType, QuestionType, Tag } from "@/types/test";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import QuestionEditor from "./QuestionEditor";
import Image from "next/image";
import { CgAlbum } from "react-icons/cg";
import { FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { uploadImage } from "@/libs/imageUpload";
import { toast } from "react-hot-toast";

interface TestFormProps {
  initialData?: Test;
  isEditing?: boolean;
}

interface PendingTag {
  name: string;
  _id: string;
}

const MAX_TAGS = 3;
const MAX_TITLE_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 100;

const validateQuestion = (question: Question): string[] => {
  const errors: string[] = [];

  if (!question.question.trim()) {
    errors.push("Текст вопроса не может быть пустым");
  }

  switch (question.type) {
    case "single":
    case "multiple":
      if (!question.options || question.options.length < 2) {
        errors.push("Добавьте минимум 2 варианта ответа");
      }

      const trimmedOptions = question.options?.map((opt) => opt.trim()) || [];
      const uniqueOptions = new Set(trimmedOptions);
      if (uniqueOptions.size !== trimmedOptions.length) {
        errors.push("Варианты ответов должны быть уникальными");
        return errors;
      }

      if (question.type === "single") {
        if (
          !question.correctAnswer ||
          !question.options?.includes(question.correctAnswer)
        ) {
          errors.push("Выберите правильный ответ");
        }
      }

      if (question.type === "multiple") {
        const correctAnswers = question.correctAnswer as string[];
        if (!correctAnswers || correctAnswers.length === 0) {
          errors.push("Выберите хотя бы один правильный ответ");
        } else {
          const invalidAnswers = correctAnswers.filter(
            (answer) => !question.options?.includes(answer)
          );
          if (invalidAnswers.length > 0) {
            errors.push("Обнаружены недопустимые правильные ответы");
          }
        }
      }
      break;
    case "order":
      if (!question.order || question.order.length < 2) {
        errors.push("Добавьте минимум 2 элемента для сортировки");
      }
      const trimmedItems = question.order?.map((item) => item.trim()) || [];
      const uniqueItems = new Set(trimmedItems);
      if (uniqueItems.size !== trimmedItems.length) {
        errors.push("Элементы для сортировки должны быть уникальными");
      }
      if (question.order?.some((item) => !item.trim())) {
        errors.push("Все элементы должны быть заполнены");
      }
      break;
    case "match":
      if (!question.matchPairs || question.matchPairs.length < 2) {
        errors.push("Добавьте минимум 2 пары для сопоставления");
      }
      const leftParts =
        question.matchPairs?.map((pair) => pair.left.trim()) || [];
      const rightParts =
        question.matchPairs?.map((pair) => pair.right.trim()) || [];
      const uniqueLeftParts = new Set(leftParts);
      const uniqueRightParts = new Set(rightParts);

      if (uniqueLeftParts.size !== leftParts.length) {
        errors.push("Левые части пар должны быть уникальными");
      }
      if (uniqueRightParts.size !== rightParts.length) {
        errors.push("Правые части пар должны быть уникальными");
      }
      if (
        question.matchPairs?.some(
          (pair) => !pair.left.trim() || !pair.right.trim()
        )
      ) {
        errors.push("Все пары должны быть заполнены");
      }
      break;
  }

  return errors;
};

const validateTest = (test: Test): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!test.title.trim()) {
    errors.push("Название теста не может быть пустым");
  }

  if (!test.questions || test.questions.length === 0) {
    errors.push("Добавьте хотя бы один вопрос");
  } else {
    test.questions.forEach((question, index) => {
      const questionErrors = validateQuestion(question);
      if (questionErrors.length > 0) {
        errors.push(`Вопрос ${index + 1}:`);
        errors.push(...questionErrors.map((err) => "  - " + err));
      }
    });
  }

  return { isValid: errors.length === 0, errors };
};

export default function TestForm({
  initialData,
  isEditing = false,
}: TestFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [test, setTest] = useState<Test>(
    initialData || {
      title: "",
      description: "",
      type: "quiz",
      tags: [],
      questions: [],
      imageUrl: "",
    }
  );

  const [currentStep, setCurrentStep] = useState<"info" | "questions">("info");
  const [imagePreview, setImagePreview] = useState<string | null>(
    test.imageUrl || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [pendingTags, setPendingTags] = useState<PendingTag[]>([]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async (search?: string) => {
    try {
      setIsLoadingTags(true);
      const url = new URL("/api/tags", window.location.origin);
      if (search) {
        url.searchParams.append("search", search);
      }
      const response = await fetch(url);
      const data = await response.json();
      setAvailableTags(data);
    } catch (error) {
      console.error("Ошибка при получении тегов:", error);
    } finally {
      setIsLoadingTags(false);
    }
  };

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getTotalTagsCount = () => {
    return test.tags.length + pendingTags.length;
  };

  const handleTagInput = async (value: string) => {
    setTagInput(value);
    if (value.length > 1) {
      await fetchTags(value);
    }
  };

  const addTag = async (tagToAdd: Tag | PendingTag) => {
    if (getTotalTagsCount() >= MAX_TAGS) {
      setError("Максимальное количество тегов: 3");
      return;
    }

    const isExistingTag = test.tags.some(
      (tag) =>
        tag._id === tagToAdd._id ||
        tag.name.toLowerCase() === tagToAdd.name.toLowerCase()
    );

    const isPendingTag = pendingTags.some(
      (tag) => tag.name.toLowerCase() === tagToAdd.name.toLowerCase()
    );

    if (!isExistingTag && !isPendingTag) {
      if ("_id" in tagToAdd && tagToAdd._id.startsWith("pending_")) {
        setPendingTags((prev) => [...prev, tagToAdd as PendingTag]);
      } else {
        setTest((prev) => ({
          ...prev,
          tags: [...prev.tags, tagToAdd as Tag],
        }));
      }
      setError(null);
    } else {
      setError("Этот тег уже добавлен");
    }
    setTagInput("");
  };

  const addPendingTag = () => {
    if (getTotalTagsCount() >= MAX_TAGS) {
      setError("Максимальное количество тегов: 3");
      return;
    }

    const normalizedInput = tagInput.trim();
    if (!normalizedInput) return;

    const existingTag = availableTags.find(
      (tag) => tag.name.toLowerCase() === normalizedInput.toLowerCase()
    );

    if (existingTag) {
      addTag(existingTag);
    } else {
      const pendingTag: PendingTag = {
        _id: `pending_${Date.now()}`,
        name: normalizedInput,
      };
      addTag(pendingTag);
    }
    setTagInput("");
  };

  const removeTag = (tagId: string | undefined) => {
    if (!tagId) return;

    if (tagId.startsWith("pending_")) {
      setPendingTags((prev) => prev.filter((tag) => tag._id !== tagId));
    } else {
      setTest((prev) => ({
        ...prev,
        tags: prev.tags.filter((tag) => tag._id !== tagId),
      }));
    }
    setError(null);
  };

  const createNewTags = async () => {
    const createdTags: Tag[] = [];

    for (const pendingTag of pendingTags) {
      try {
        const response = await fetch("/api/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: pendingTag.name.toLowerCase() }),
        });

        if (!response.ok) throw new Error("Не удалось создать тег");

        const newTag = await response.json();
        createdTags.push(newTag);
      } catch (error) {
        console.error("Ошибка при создании тега:", error);
        throw new Error(`Не удалось создать тег: ${pendingTag.name}`);
      }
    }

    return createdTags;
  };

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!test.title || !test.description || !test.type) {
      setError("Пожалуйста, заполните все обязательные поля");
      return;
    }
    setCurrentStep("questions");
  };

  const handleImageUpload = async (file: File) => {
    try {
      setError(null);
      const url = await uploadImage(file);
      setTest((prev) => ({ ...prev, imageUrl: url }));
      setImagePreview(url);
    } catch (error) {
      console.error("Ошибка при загрузке изображения:", error);
      setError(
        "Ошибка при загрузке изображения. Пожалуйста, попробуйте еще раз."
      );
    }
  };

  const handleAddQuestion = (type: QuestionType) => {
    const baseQuestion = {
      type,
      question: "",
      points: 1,
    };

    let newQuestion: Question;

    switch (type) {
      case "single":
        newQuestion = {
          ...baseQuestion,
          type: "single",
          options: [],
          correctAnswer: "",
        };
        break;
      case "multiple":
        newQuestion = {
          ...baseQuestion,
          type: "multiple",
          options: [],
          correctAnswer: [],
        };
        break;
      case "order":
        newQuestion = {
          ...baseQuestion,
          type: "order",
          order: ["", ""],
        };
        break;
      case "match":
        newQuestion = {
          ...baseQuestion,
          type: "match",
          matchPairs: [],
        };
        break;
      default:
        throw new Error("Неподдерживаемый тип вопроса");
    }

    setTest((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const handleQuestionChange = (index: number, updatedQuestion: Question) => {
    setTest((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? updatedQuestion : q
      ),
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setTest((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Необходимо войти в систему");
      return;
    }

    const validation = validateTest(test);
    if (!validation.isValid) {
      const generalErrors = validation.errors.filter(
        (err) => !err.startsWith("Вопрос")
      );
      const questionErrors = validation.errors.filter((err) =>
        err.startsWith("Вопрос")
      );

      generalErrors.forEach((error) => {
        toast.error(error);
      });

      let currentQuestionErrors: string[] = [];
      questionErrors.forEach((error) => {
        if (error.startsWith("Вопрос")) {
          if (currentQuestionErrors.length > 0) {
            toast.error(currentQuestionErrors.join("\n"));
            currentQuestionErrors = [];
          }
          currentQuestionErrors.push(error);
        } else {
          currentQuestionErrors.push(error);
        }
      });

      if (currentQuestionErrors.length > 0) {
        toast.error(currentQuestionErrors.join("\n"));
      }
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      let finalTags = [...test.tags];
      if (pendingTags.length > 0) {
        const createdTags = await createNewTags();
        finalTags = [...finalTags, ...createdTags];
      }

      const finalTest = {
        ...test,
        tags: finalTags,
        author: user.id,
      };

      const url = isEditing ? `/api/tests/${initialData?._id}` : "/api/tests";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalTest),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не удалось сохранить тест");
      }

      toast.success(
        isEditing ? "Тест успешно обновлен" : "Тест успешно создан"
      );
      router.push("/profile");
    } catch (error) {
      console.error("Ошибка при сохранении теста:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Произошла ошибка при сохранении теста");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {isEditing ? "Редактирование теста" : "Создание нового теста"}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {currentStep === "info" ? (
        <form onSubmit={handleBasicInfoSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Название теста ({test.title.length}/{MAX_TITLE_LENGTH})
              </label>
              <input
                type="text"
                value={test.title}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length <= MAX_TITLE_LENGTH) {
                    setTest((prev) => ({ ...prev, title: newValue }));
                  }
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                placeholder="Введите название теста"
                maxLength={MAX_TITLE_LENGTH}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Описание ({test.description.length}/{MAX_DESCRIPTION_LENGTH})
              </label>
              <textarea
                value={test.description}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length <= MAX_DESCRIPTION_LENGTH) {
                    setTest((prev) => ({ ...prev, description: newValue }));
                  }
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                rows={4}
                placeholder="Опишите, о чем этот тест"
                maxLength={MAX_DESCRIPTION_LENGTH}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Тип теста
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTest((prev) => ({ ...prev, type: "quiz" }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    test.type === "quiz"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
                  }`}
                >
                  <div className="font-medium text-lg mb-2 text-gray-900 dark:text-white">
                    Квиз
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Все вопросы отображаются на одной странице. Студент может
                    отвечать на вопросы в любом порядке
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setTest((prev) => ({ ...prev, type: "test" }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    test.type === "test"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
                  }`}
                >
                  <div className="font-medium text-lg mb-2 text-gray-900 dark:text-white">
                    Тест
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Вопросы показываются по одному. Студент должен ответить на
                    текущий вопрос, чтобы перейти к следующему
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Теги ({getTotalTagsCount()}/{MAX_TAGS})
              </label>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {test.tags.map((tag, index) => (
                    <span
                      key={tag._id || `existing-${index}`}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    >
                      {capitalizeFirstLetter(tag.name)}
                      <button
                        type="button"
                        onClick={() => removeTag(tag._id)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                  {pendingTags.map((tag, index) => (
                    <span
                      key={tag._id || `pending-${index}`}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    >
                      {capitalizeFirstLetter(tag.name)}
                      <button
                        type="button"
                        onClick={() => removeTag(tag._id)}
                        className="text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-green-100"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative bg-white dark:bg-gray-900">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => handleTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPendingTag();
                      }
                    }}
                    placeholder={
                      getTotalTagsCount() >= MAX_TAGS
                        ? "Достигнут лимит тегов"
                        : "Добавить тег..."
                    }
                    disabled={getTotalTagsCount() >= MAX_TAGS}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  />
                  {tagInput && getTotalTagsCount() < MAX_TAGS && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                      {isLoadingTags ? (
                        <div className="p-2 text-gray-500 dark:text-gray-400">
                          Загрузка...
                        </div>
                      ) : (
                        <>
                          {availableTags.length > 0 && (
                            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                              Существующие теги
                            </div>
                          )}
                          {availableTags.map((tag) => {
                            const isTagUsed =
                              test.tags.some((t) => t._id === tag._id) ||
                              pendingTags.some(
                                (t) =>
                                  t.name.toLowerCase() ===
                                  tag.name.toLowerCase()
                              );
                            return (
                              <button
                                key={tag._id}
                                type="button"
                                onClick={() => !isTagUsed && addTag(tag)}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between ${
                                  isTagUsed
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                                disabled={isTagUsed}
                              >
                                <span>{capitalizeFirstLetter(tag.name)}</span>
                                {isTagUsed && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Уже добавлен
                                  </span>
                                )}
                              </button>
                            );
                          })}
                          {availableTags.length === 0 && (
                            <>
                              <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                Новый тег
                              </div>
                              <button
                                type="button"
                                onClick={addPendingTag}
                                className="w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-blue-400"
                              >
                                Создать тег &quot;
                                {capitalizeFirstLetter(tagInput)}&quot;
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Изображение обложки
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                {imagePreview ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setTest((prev) => ({ ...prev, imageUrl: "" }));
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
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
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Далее
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleAddQuestion("single")}
              className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
            >
              <div className="font-medium text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400">
                Один вариант ответа
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Выберите один правильный ответ
              </p>
            </button>
            <button
              type="button"
              onClick={() => handleAddQuestion("multiple")}
              className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
            >
              <div className="font-medium text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400">
                Множественный выбор
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Выберите несколько правильных ответов
              </p>
            </button>
            <button
              type="button"
              onClick={() => handleAddQuestion("order")}
              className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
            >
              <div className="font-medium text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400">
                Порядок элементов
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Расположите элементы в правильном порядке
              </p>
            </button>
            <button
              type="button"
              onClick={() => handleAddQuestion("match")}
              className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
            >
              <div className="font-medium text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400">
                Сопоставление
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Соедините соответствующие элементы в пары
              </p>
            </button>
          </div>

          <div className="space-y-6">
            {test.questions.map((question, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm"
              >
                <QuestionEditor
                  question={question}
                  onChange={(updatedQuestion) =>
                    handleQuestionChange(index, updatedQuestion)
                  }
                  onRemove={() => handleRemoveQuestion(index)}
                />
              </div>
            ))}

            {test.questions.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Добавьте вопросы к тесту, используя кнопки выше
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep("info")}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Назад
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400"
            >
              {isSubmitting ? "Сохранение..." : "Сохранить тест"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
