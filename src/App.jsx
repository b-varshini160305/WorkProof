import "./App.css";
import { useState, useEffect } from "react";

const challenges = [
  {
    id: 1,
    title: "Even or Odd",
    difficulty: "Easy",
    description: "Determine whether a number is even or odd.",
    hint: "Use the % operator to check whether a number is divisible by 2.",
    problem:
      "Given an integer, print Even if it is divisible by 2; otherwise, print Odd.",
    exampleInput: "7",
    exampleOutput: "Odd",
  },
  {
    id: 2,
    title: "Sum of Numbers",
    difficulty: "Easy",
    description: "Calculate the sum of numbers from 1 to N.",
    hint: "Use a loop to add each number from 1 up to N.",
    problem:
      "Given a positive integer N, calculate the sum of all integers from 1 to N.",
    exampleInput: "5",
    exampleOutput: "15",
  },
  {
    id: 3,
    title: "Find the Largest",
    difficulty: "Beginner",
    description: "Find the largest number in a list.",
    hint: "Compare the numbers, or use Python's max() function.",
    problem: "Given a list of integers, find and print the largest number.",
    exampleInput: "3, 8, 2, 5",
    exampleOutput: "8",
  },
];

function App() {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [pyodide, setPyodide] = useState(null);
  const [output, setOutput] = useState("Python is loading...");
  const [actualOutput, setActualOutput] = useState("");
  const [answerStatus, setAnswerStatus] = useState("");
  const [completedChallenges, setCompletedChallenges] = useState(() => {
  try {
    const saved = JSON.parse(
  localStorage.getItem("workproof-completed-challenges") || "[]"
);

return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
});
  const [showHint, setShowHint] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [pythonCode, setPythonCode] = useState("# Write your Python code here");
  const [programInput, setProgramInput] = useState("");
const [lastRunCode, setLastRunCode] = useState("");
const [lastRunInput, setLastRunInput] = useState("");
const [lastRunFailed, setLastRunFailed] = useState(false);
  useEffect(() => {
    async function loadPython() {
      try {
        const runtime = await window.loadPyodide();
        setPyodide(runtime);
        setOutput("Python is ready!");
      } catch (error) {
        setOutput("Could not load Python. Check your internet connection.");
        console.error(error);
      }
    }

    loadPython();
  }, []);
  useEffect(() => {
  try {
    localStorage.setItem(
      "workproof-completed-challenges",
      JSON.stringify(completedChallenges)
    );
  } catch (error) {
    console.error("Could not save WorkProof progress:", error);
  }
}, [completedChallenges]);

  async function runPythonCode() {
    if (!pyodide) {
      setOutput("Python is still loading. Please wait.");
      return;
    }

    try {
      setActualOutput("");
      setAnswerStatus("");
      setOutput("Running your Python code...");
      setLastRunFailed(false);


      pyodide.globals.set("workproof_user_code", pythonCode);
      pyodide.globals.set("workproof_input", programInput);

      const result = await pyodide.runPythonAsync(`
import io
import contextlib
import traceback

captured_output = io.StringIO()
input_lines = iter(workproof_input.splitlines())

def workproof_input_function(prompt=""):
    try:
        return next(input_lines)
    except StopIteration:
        raise EOFError("No more input available.")

try:
    with contextlib.redirect_stdout(captured_output):
        exec(
            workproof_user_code,
            {
                "input": workproof_input_function
            }
        )

    result = captured_output.getvalue()

    if not result:
        result = "Code executed successfully (no output)."

except Exception:
    result = captured_output.getvalue() + traceback.format_exc()
    raise RuntimeError(result)

result
    `);
      setActualOutput(result.toString());
      setOutput(result.toString());
      setLastRunCode(pythonCode);
setLastRunInput(programInput);
    } catch (error) {
      setLastRunFailed(true);
      setActualOutput("");
      setOutput("Error: " + error.message);
      setAnswerStatus("Code execution failed. Fix the error and try again.");

    } finally {
      pyodide.globals.delete("workproof_user_code");
      pyodide.globals.delete("workproof_input");
    }
  }

  function handleExploreClick() {
    document.getElementById("challenges").scrollIntoView({
      behavior: "smooth",
    });
  }
    
  return (
    <div>
      <nav>
        <h2>WorkProof</h2>
        <p>Skills you can prove. Work you can show.</p>
      </nav>

      <main>
        <h1>Show the world what you can build.</h1>
        <p>
          Practice real coding challenges, improve your skills, and build your
          portfolio.
        </p>

        <button onClick={handleExploreClick}>Explore Challenges</button>
      </main>

      <section id="challenges">
        <h2>Coding Challenges</h2>
        
<button
  onClick={() => {
    const confirmed = window.confirm(
      "Are you sure you want to reset your progress?"
    );

    if (confirmed) {
      setCompletedChallenges([]);
      setAnswerStatus("");
    }
  }}
>
  Reset Progress
</button>

        <p>
  Progress: {completedChallenges.length} / {challenges.length} completed
</p>
<p>
  Completion: {Math.round(
    (completedChallenges.length / challenges.length) * 100
  )}%
</p>
{completedChallenges.length === challenges.length && (
  <p>
    🎉 Congratulations! You've completed all the coding challenges!
  </p>
)}
<div
  style={{
    width: "100%",
    height: "10px",
    backgroundColor: "#e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
  }}
>
  <div
    className="progress-fill"
    style={{
      width: `${(completedChallenges.length / challenges.length) * 100}%`,
      height: "100%",
      backgroundColor: "#16a34a",
      transition: "width 0.3s ease",
    }}
  />
</div>
        <p>Choose a challenge and start practising.</p>

        <div className="challenge-list">
          {challenges.map((challenge) => (
            <article
              key={challenge.id}
              className={`challenge-card ${
  completedChallenges.includes(challenge.id) ? "completed" : ""
}`}
              
onClick={() => {
  setSelectedChallenge(challenge);
  setShowHint(false);
  setShowEditor(false);
  setPythonCode("# Write your Python code here");
  setProgramInput("");
  setOutput("Python is ready!");
  setActualOutput("");
  setAnswerStatus("");
}}

            >
              <h3>{challenge.title}</h3>
              <p>{challenge.description}</p>
              <span>{challenge.difficulty}</span>
              {completedChallenges.includes(challenge.id) && (
  <span>Completed ✓</span>
)}
            </article>
          ))}
        </div>
      </section>

      {selectedChallenge && (
        <section>
          <h2>{selectedChallenge.title}</h2>
          <p>{selectedChallenge.description}</p>
          <p>Difficulty: {selectedChallenge.difficulty}</p>

          <h3>Problem</h3>
          <p>{selectedChallenge.problem}</p>

          <h3>Example Input</h3>
          <p>{selectedChallenge.exampleInput}</p>

          <h3>Expected Output</h3>
          <p>{selectedChallenge.exampleOutput}</p>


<button
  onClick={() => {
    setPythonCode("# Write your Python code here");
    setProgramInput("");
    setOutput("Python is ready!");
    setActualOutput("");
    setAnswerStatus("");
    setShowEditor(true);
  }}
>
  Start Challenge
</button>


          {showEditor && (
            <div>
              <h3>Python Coding Workspace</h3>
              <p>Write your solution below:</p>

              <textarea className="python-editor"
                value={pythonCode}
                onChange={(event) => setPythonCode(event.target.value)}
                rows={10}
                cols={60}
                placeholder="Write your Python code here..."
              />
              

<button
  onClick={() => {
    const confirmed = window.confirm(
      "Are you sure you want to reset your code and input?"
    );

    if (confirmed) {
      setPythonCode("# Write your Python code here");
      setProgramInput("");
      setOutput("Python is ready!");
      setActualOutput("");
      setAnswerStatus("");
    }
  }}
>
  Reset Code
</button>


              <h3>Program Input</h3>
              <textarea
                value={programInput}
                onChange={(event) => setProgramInput(event.target.value)}
                rows={3}
                placeholder="Enter input for your Python program"
              />


<button
  onClick={() => {
    const confirmed = window.confirm(
      "Are you sure you want to clear your code?"
    );

    if (confirmed) {
      setPythonCode("");
    }
  }}
>
  Clear Code
</button>

             

              <button onClick={runPythonCode}>Run Code</button>
              <button
  onClick={() => {
    setShowHint(!showHint);
  }}
>
  {showHint ? "Hide Hint" : "Show Hint"}
</button>
{showHint && (
  <p>{selectedChallenge.hint}</p>
)}
              <h3>Output</h3>
              <pre>{output}</pre>
              <h3>Answer Status</h3>
              <p>{answerStatus || "Run your code, then check your answer."}</p>

              <button
                onClick={() => {
                  if (lastRunFailed) {
  setAnswerStatus("Your code failed to run. Fix the error and click Run Code again.");
  return;
}
                  if (pythonCode !== lastRunCode || programInput !== lastRunInput) {
  setAnswerStatus(
    "Your code or input has changed. Click Run Code before checking your answer."
  );
  return;
}
                  let expected = selectedChallenge.exampleOutput.trim();

                  if (selectedChallenge.id === 1) {
                    const number = Number(programInput.trim());

                    expected = number % 2 === 0 ? "Even" : "Odd";
                  } else if (selectedChallenge.id === 2) {
                    const number = Number(programInput.trim());

                    expected = String((number * (number + 1)) / 2);
                  } else if (selectedChallenge.id === 3) {
                    const numbers = programInput.split(",").map(Number);

                    expected = String(Math.max(...numbers));
                  }
                  const actual = actualOutput.trim();
                  if (!actual) {
                    setAnswerStatus(
                      "Run your code successfully before checking your answer.",
                    );
                  } else if (actual === expected) {
  setAnswerStatus("Passed! Your output matches the expected answer.");

  setCompletedChallenges((previous) =>
    previous.includes(selectedChallenge.id)
      ? previous
      : [...previous, selectedChallenge.id]
  );
}
                  else {
                    setAnswerStatus(
                      "Failed. Expected: " +
                        expected +
                        " | Your output: " +
                        actual,
                    );
                  }
                }}
              >
                Check Answer
              </button>
            </div>
          )}

          <button onClick={() => setSelectedChallenge(null)}>
            Back to Challenges
          </button>
        </section>
      )}
    </div>
  );
}

export default App;
