import QuizPage from '../quiz';

const mockQuestions = [
  {
    id: "Q1",
    text: "When you start a new project, how often do you explicitly define the problem statement and success metrics?",
    category: "UX Fundamentals",
    options: [
      { value: 1, label: "Rarely, I mostly start directly with screens" },
      { value: 2, label: "Sometimes, but not always written down" },
      { value: 3, label: "Often, but metrics are vague" },
      { value: 4, label: "Usually, with clear problem + direction" },
      { value: 5, label: "Always, I write a clear problem, constraints, and success metrics" }
    ]
  },
  {
    id: "Q2",
    text: "How confident are you in breaking down a user journey into flows and edge cases?",
    category: "UX Fundamentals",
    options: [
      { value: 1, label: "I struggle with this" },
      { value: 2, label: "I can do simple flows" },
      { value: 3, label: "I can handle typical product flows" },
      { value: 4, label: "I cover most states and edge cases" },
      { value: 5, label: "I systematically cover all states, edge cases, and system rules" }
    ]
  }
];

export default function QuizPageExample() {
  return (
    <QuizPage
      questions={mockQuestions}
      onComplete={(answers) => console.log('Quiz completed:', answers)}
      onBack={() => console.log('Back to home')}
    />
  );
}
