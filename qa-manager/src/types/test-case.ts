export type TestStatus = "Active" | "Draft" | "Pass" | "Fail" | "Running" | "Idle";

export interface TestCase {
  code: string;
  name: string;
  description?: string;
  status: TestStatus;
  lastRun?: string;
  duration?: string;
  category: "Happy Path" | "LPPM" | "Sales" | "Financial" | "UAT";
}

export interface ExecutionLog {
  id: string;
  testCode: string;
  status: "Pass" | "Fail";
  timestamp: string;
  duration: string;
  message?: string;
  screenshot?: string;
}
