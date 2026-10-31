"use client";

import { FormEvent, useState } from "react";

type TestCase = {
  id: string;
  title: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  preconditions: string;
  steps: string[];
  expectedResult: string;
};

const sampleCases: TestCase[] = [
  {
    id: "TC-001",
    title: "Login with valid credentials",
    category: "Authentication",
    priority: "High",
    preconditions: "A registered user exists.",
    steps: ["Open the login page", "Enter valid credentials", "Click Login"],
    expectedResult:
      "The user is authenticated and redirected to the dashboard.",
  },
  {
    id: "TC-002",
    title: "Login with an invalid password",
    category: "Negative",
    priority: "High",
    preconditions: "A registered user exists.",
    steps: [
      "Open the login page",
      "Enter a valid email and incorrect password",
      "Click Login",
    ],
    expectedResult: "An appropriate error is shown and access is denied.",
  },
  {
    id: "TC-003",
    title: "Validate required form fields",
    category: "Validation",
    priority: "Medium",
    preconditions: "The login page is open.",
    steps: ["Leave required fields empty", "Click Login"],
    expectedResult:
      "Required-field validation appears and invalid submission is prevented.",
  },
];

export default function Home() {
  const [projectName, setProjectName] = useState("E-commerce Website");
  const [requirements, setRequirements] = useState(
    "Users can register, log in, search products, add products to a cart, and checkout.",
  );
  const [testType, setTestType] = useState("All");
  const [count, setCount] = useState("10");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateTests(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setTestCases([]);

    try {
      const response = await fetch("/api/generate-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          requirements,
          testType,
          count: Number(count),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate test cases.");
      }

      setTestCases(data.testCases);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function loadSample() {
    setTestCases(sampleCases);
    setError("");
  }

  function updateCase(
    id: string,
    field:
      | "title"
      | "category"
      | "priority"
      | "preconditions"
      | "expectedResult",
    value: string,
  ) {
    setTestCases((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  }

  function exportCSV() {
    if (testCases.length === 0) return;

    const columns = [
      "ID",
      "Title",
      "Category",
      "Priority",
      "Preconditions",
      "Steps",
      "Expected Result",
    ];

    const rows = testCases.map((item) => [
      item.id,
      item.title,
      item.category,
      item.priority,
      item.preconditions,
      item.steps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
      item.expectedResult,
    ]);

    // Escape quotes and prevent spreadsheet formula injection.
    function escapeCell(value: string) {
      let safe = value.replace(/\0/g, "");

      if (/^[\s\u0000-\u001f]*[=+\-@]/.test(safe)) {
        safe = `'${safe}`;
      }

      return `"${safe.replace(/"/g, '""')}"`;
    }

    const csv = [columns, ...rows]
      .map((row) => row.map((cell) => escapeCell(String(cell))).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "testpilot-test-cases.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  const priorityClass: Record<TestCase["priority"], string> = {
    High: "bg-red-50 text-red-700",
    Medium: "bg-amber-50 text-amber-700",
    Low: "bg-emerald-50 text-emerald-700",
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              TestPilot <span className="text-indigo-600">AI</span>
            </h1>
            <p className="text-xs text-slate-500">
              AI-assisted website testing
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            MVP
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[360px_1fr]">
        <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Generate test cases</h2>
          <p className="mt-1 text-sm text-slate-500">
            Describe your website and its expected behavior.
          </p>

          <form onSubmit={generateTests} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Project name
              </label>
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                maxLength={100}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="E-commerce Website"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Website requirements
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                required
                minLength={10}
                maxLength={6000}
                rows={7}
                className="w-full resize-y rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Describe pages, features, and user workflows..."
              />
              <p className="mt-1 text-right text-xs text-slate-400">
                {requirements.length}/6000
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Test category
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm"
              >
                <option>All</option>
                <option>Functional</option>
                <option>Negative</option>
                <option>Validation</option>
                <option>Responsive</option>
                <option>Security</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Number of test cases
              </label>
              <select
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm"
              >
                <option value="5">5 test cases</option>
                <option value="10">10 test cases</option>
                <option value="15">15 test cases</option>
                <option value="20">20 test cases</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating..." : "✦ Generate test cases"}
            </button>

            <button
              type="button"
              onClick={loadSample}
              className="w-full rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
            >
              Load sample results
            </button>
          </form>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
        </aside>

        <section className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Test case results</h2>
              <p className="mt-1 text-sm text-slate-500">
                {testCases.length} test cases · {projectName}
              </p>
            </div>

            <button
              type="button"
              disabled={testCases.length === 0}
              onClick={exportCSV}
              className="rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ↓ Export CSV
            </button>
          </div>

          {testCases.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed bg-white p-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                ✦
              </div>
              <h3 className="font-semibold">Ready to test smarter?</h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Enter your website requirements and generate test cases, or load
                the sample results to explore the interface.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {testCases.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-400">
                        {item.id} · {item.category}
                      </p>
                      <input
                        aria-label={`Title for ${item.id}`}
                        value={item.title}
                        onChange={(e) =>
                          updateCase(item.id, "title", e.target.value)
                        }
                        className="mt-1 w-full border-b border-transparent bg-transparent text-base font-semibold outline-none focus:border-indigo-400"
                      />
                    </div>

                    <select
                      aria-label={`Priority for ${item.id}`}
                      value={item.priority}
                      onChange={(e) =>
                        updateCase(item.id, "priority", e.target.value)
                      }
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass[item.priority]}`}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Preconditions
                  </label>
                  <textarea
                    aria-label={`Preconditions for ${item.id}`}
                    rows={2}
                    value={item.preconditions}
                    onChange={(e) =>
                      updateCase(item.id, "preconditions", e.target.value)
                    }
                    className="mt-1 w-full resize-y rounded-md border border-transparent bg-slate-50 p-2 text-sm outline-none focus:border-indigo-300"
                  />

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Test steps
                  </p>
                  <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-slate-700">
                    {item.steps.map((step, index) => (
                      <li key={`${item.id}-${index}`}>{step}</li>
                    ))}
                  </ol>

                  <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Expected result
                  </label>
                  <textarea
                    aria-label={`Expected result for ${item.id}`}
                    rows={2}
                    value={item.expectedResult}
                    onChange={(e) =>
                      updateCase(item.id, "expectedResult", e.target.value)
                    }
                    className="mt-1 w-full resize-y rounded-md border border-transparent bg-emerald-50/60 p-2 text-sm outline-none focus:border-emerald-300"
                  />
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
