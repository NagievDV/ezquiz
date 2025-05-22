"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Test, { TestDocument } from "@/models/Test";
import QuizTest from "@/components/Test/QuizTest";
import StepByStepTest from "@/components/Test/StepByStepTest";
import { QuestionDocument } from "@/models/Question";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type PopulatedTestDocument = Omit<TestDocument, "questions"> & {
  questions: QuestionDocument[];
  type: "quiz" | "test";
};

type PageParams = {
  params: Promise<{ id: string }>;
};

export default function TestPage({ params }: PageParams) {
  const resolvedParams = use(params);
  const [test, setTest] = useState<PopulatedTestDocument | null>(null);
  const [answers, setAnswers] = useState<
    Record<string, string | string[] | Record<string, string>>
  >({});
  const [result, setResult] = useState<{
    score: number;
    maxScore: number;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadTest = async () => {
      try {
        const res = await fetch(`/api/tests/${resolvedParams.id}`);
        if (!res.ok) throw new Error("Тест не найден");
        const data: PopulatedTestDocument = await res.json();
        setTest(data);
      } catch (error) {
        router.push("/");
      }
    };
    loadTest();
  }, [resolvedParams.id, router]);

  if (!test) return <div className="text-center p-8">Загрузка теста...</div>;

  const TestComponent = test.type === "quiz" ? QuizTest : StepByStepTest;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto p-4">
        {!result ? (
          <>
            <h1 className="text-2xl font-bold mb-6 dark:text-white">
              {test.title}
            </h1>
            <TestComponent
              testId={resolvedParams.id}
              questions={test.questions}
              answers={answers}
              onAnswersUpdate={setAnswers}
              onSubmit={setResult}
            />
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">
              Результаты
            </h2>
            <p className="text-lg mb-6 dark:text-gray-300">
              Вы набрали {result.score} из {result.maxScore} баллов
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 
      dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Вернуться к списку тестов</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
