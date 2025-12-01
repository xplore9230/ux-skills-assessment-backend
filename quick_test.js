// Quick test script to navigate to results page
const answers = {};
for (let i = 1; i <= 15; i++) {
  answers[`q${i}`] = 3; // Middle score for all questions
}

// Calculate results 
const totalScore = 45; // 15 questions * 3 points
const maxScore = 100;
const stage = "Practitioner";

console.log("Test Results:");
console.log("Total Score:", totalScore);
console.log("Max Score:", maxScore);
console.log("Stage:", stage);
console.log("\nTo test the results page directly, navigate to: http://localhost:3000/results");
console.log("Or complete the quiz with middle answers (3) for all questions");
