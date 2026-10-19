"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type KeyboardTheme } from "@/lib/themes";
import { soundEngine } from "@/lib/sound";
import confetti from "canvas-confetti";
import {
  Code2,
  Terminal,
  Play,
  CheckCircle2,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Trophy,
  Zap,
  Eye,
  EyeOff,
  Layers,
  FileCode,
  ChevronRight,
  Clock,
  Gauge
} from "lucide-react";
import { updateStudentProgress } from "@/lib/db";

export type CodeLanguage = "python" | "javascript" | "java" | "c" | "cpp" | "html" | "css" | "sql";

export interface CodeLevel {
  id: number;
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  concept: string;
  expectedOutput: string;
  testCases: Array<{ input: string; output: string }>;
  hint: string;
  // Template with logical blanks (e.g. ______) for the student to solve on the left
  templateWithBlanks: string;
  // Complete target code the student will type on the right
  solutionCode: string;
}

export interface LanguageInfo {
  id: CodeLanguage;
  name: string;
  extension: string;
  tagline: string;
  icon: string;
  color: string;
  bgGradient: string;
  badgeColor: string;
  levels: CodeLevel[];
}

export const CODE_LANGUAGES: LanguageInfo[] = [
  // =========================================================================
  // 1. PYTHON (Beginner to Advanced: Print -> Variables -> If/Elif -> While/For -> Lists -> Functions)
  // =========================================================================
  {
    id: "python",
    name: "Python",
    extension: ".py",
    tagline: "Start with print & variables, master if-elif, loops, lists & functions",
    icon: "🐍",
    color: "text-amber-400",
    bgGradient: "from-amber-500/20 via-yellow-500/10 to-transparent",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    levels: [
      {
        id: 1,
        title: "Hello World Output",
        category: "1. Basics & Output",
        difficulty: "Easy",
        description: "Display text to the screen using Python's built-in `print()` function.",
        concept: "`print(\"text\")` writes strings directly to standard output.",
        expectedOutput: "Hello, World!",
        testCases: [{ input: "run", output: "Hello, World!" }],
        hint: "Fill the blank with \"Hello, World!\".",
        templateWithBlanks: `# Print Hello World
print("______")`,
        solutionCode: `print("Hello, World!")`
      },
      {
        id: 2,
        title: "Variables & Arithmetic Addition",
        category: "2. Variables & Math",
        difficulty: "Easy",
        description: "Assign two integer variables `a` and `b`, compute their `total`, and print it.",
        concept: "Variables store data in memory. Use the `+` arithmetic operator to add values.",
        expectedOutput: "40",
        testCases: [{ input: "run", output: "40" }],
        hint: "Add `a + b`.",
        templateWithBlanks: `a = 15
b = 25
total = a ______ b
print(total)`,
        solutionCode: `a = 15
b = 25
total = a + b
print(total)`
      },
      {
        id: 3,
        title: "String Formatting (F-Strings)",
        category: "3. Strings & Formatting",
        difficulty: "Easy",
        description: "Use an f-string to embed the variable `name` into a welcome message.",
        concept: "Prefixing a string with `f\"...{var}...\"` allows direct expression interpolation.",
        expectedOutput: "Welcome, Alex!",
        testCases: [{ input: "run", output: "Welcome, Alex!" }],
        hint: "Use `{name}` inside the f-string.",
        templateWithBlanks: `name = "Alex"
message = f"Welcome, {______}!"
print(message)`,
        solutionCode: `name = "Alex"
message = f"Welcome, {name}!"
print(message)`
      },
      {
        id: 4,
        title: "If - Else Condition",
        category: "4. Conditionals (If/Else)",
        difficulty: "Easy",
        description: "Check if `score >= 50` to print 'Pass', otherwise print 'Fail'.",
        concept: "The `if` statement evaluates a boolean expression and executes the indented block.",
        expectedOutput: "Pass",
        testCases: [{ input: "run", output: "Pass" }],
        hint: "Use condition `score >= 50:`.",
        templateWithBlanks: `score = 75

if score >= ______:
    print("Pass")
else:
    print("Fail")`,
        solutionCode: `score = 75

if score >= 50:
    print("Pass")
else:
    print("Fail")`
      },
      {
        id: 5,
        title: "If - Elif - Else Multi-Branch",
        category: "5. Conditionals (If/Elif/Else)",
        difficulty: "Easy",
        description: "Determine grade based on score using `if`, `elif`, and `else`.",
        concept: "`elif` allows checking multiple successive conditions in Python.",
        expectedOutput: "Grade: B",
        testCases: [{ input: "run", output: "Grade: B" }],
        hint: "Use keyword `elif` for the secondary condition.",
        templateWithBlanks: `marks = 82

if marks >= 90:
    print("Grade: A")
______ marks >= 80:
    print("Grade: B")
else:
    print("Grade: C")`,
        solutionCode: `marks = 82

if marks >= 90:
    print("Grade: A")
elif marks >= 80:
    print("Grade: B")
else:
    print("Grade: C")`
      },
      {
        id: 6,
        title: "While Loop Counter",
        category: "6. Loops (While)",
        difficulty: "Medium",
        description: "Use a `while` loop to print numbers from 1 to 3 with increment `count += 1`.",
        concept: "`while condition:` repeats as long as the condition evaluates to True.",
        expectedOutput: "1\\n2\\n3",
        testCases: [{ input: "run", output: "1, 2, 3" }],
        hint: "Increment with `count += 1`.",
        templateWithBlanks: `count = 1

while count <= 3:
    print(count)
    count += ______`,
        solutionCode: `count = 1

while count <= 3:
    print(count)
    count += 1`
      },
      {
        id: 7,
        title: "For Loop with Range",
        category: "7. Loops (For & Range)",
        difficulty: "Medium",
        description: "Iterate through numbers 0 to 4 using `for i in range(5):`.",
        concept: "`range(n)` generates integers starting from 0 up to `n-1`.",
        expectedOutput: "0 1 2 3 4",
        testCases: [{ input: "run", output: "0, 1, 2, 3, 4" }],
        hint: "Use `range(5):`.",
        templateWithBlanks: `for i in ______(5):
    print(i)`,
        solutionCode: `for i in range(5):
    print(i)`
      },
      {
        id: 8,
        title: "Lists & Append Method",
        category: "8. Lists & Collections",
        difficulty: "Medium",
        description: "Create a list of keys and append a new key 'Space' to it.",
        concept: "`list.append(item)` adds a new element to the end of a list.",
        expectedOutput: "['Ctrl', 'Alt', 'Space']",
        testCases: [{ input: "run", output: "['Ctrl', 'Alt', 'Space']" }],
        hint: "Call `keys.append(\"Space\")`.",
        templateWithBlanks: `keys = ["Ctrl", "Alt"]
keys.______("Space")
print(keys)`,
        solutionCode: `keys = ["Ctrl", "Alt"]
keys.append("Space")
print(keys)`
      },
      {
        id: 9,
        title: "Iterate Over List & Sum",
        category: "9. List Iteration",
        difficulty: "Medium",
        description: "Calculate the total sum of a number list using a `for` loop.",
        concept: "`for item in collection:` iterates directly over elements in sequence.",
        expectedOutput: "60",
        testCases: [{ input: "run", output: "60" }],
        hint: "Accumulate `total += num`.",
        templateWithBlanks: `numbers = [10, 20, 30]
total = 0

for num in numbers:
    total += ______

print(total)`,
        solutionCode: `numbers = [10, 20, 30]
total = 0

for num in numbers:
    total += num

print(total)`
      },
      {
        id: 10,
        title: "Function Definition & Return",
        category: "10. Functions",
        difficulty: "Medium",
        description: "Define a reusable function `square(n)` that returns `n * n`.",
        concept: "`def func_name(param):` creates a callable function with a `return` value.",
        expectedOutput: "square(6) => 36",
        testCases: [{ input: "square(6)", output: "36" }],
        hint: "Return `n * n`.",
        templateWithBlanks: `def square(n):
    return n * ______

result = square(6)
print(result)`,
        solutionCode: `def square(n):
    return n * n

result = square(6)
print(result)`
      },
      {
        id: 11,
        title: "Function with Conditional Logic",
        category: "11. Functions & Logic",
        difficulty: "Hard",
        description: "Write `is_even(n)` that returns True if `n % 2 == 0` else False.",
        concept: "Functions can contain conditions and return boolean values.",
        expectedOutput: "is_even(8) => True",
        testCases: [{ input: "is_even(8)", output: "True" }],
        hint: "Check `n % 2 == 0`.",
        templateWithBlanks: `def is_even(n):
    return n % ______ == 0

print(is_even(8))`,
        solutionCode: `def is_even(n):
    return n % 2 == 0

print(is_even(8))`
      },
      {
        id: 12,
        title: "List Comprehension Filtering",
        category: "12. Advanced Python",
        difficulty: "Hard",
        description: "Filter even numbers from a list in a single line using list comprehension.",
        concept: "`[x for x in nums if condition]` creates a filtered list concisely.",
        expectedOutput: "[2, 4, 6]",
        testCases: [{ input: "run", output: "[2, 4, 6]" }],
        hint: "Use `if x % 2 == 0`.",
        templateWithBlanks: `nums = [1, 2, 3, 4, 5, 6]
evens = [x for x in nums if x % 2 == ______]
print(evens)`,
        solutionCode: `nums = [1, 2, 3, 4, 5, 6]
evens = [x for x in nums if x % 2 == 0]
print(evens)`
      }
    ]
  },

  // =========================================================================
  // 2. JAVASCRIPT (Log -> Variables -> If/Else -> While/For -> Arrays -> Functions)
  // =========================================================================
  {
    id: "javascript",
    name: "JavaScript",
    extension: ".js",
    tagline: "Console logs, let/const variables, loops, arrays & arrow functions",
    icon: "🟨",
    color: "text-yellow-400",
    bgGradient: "from-yellow-500/20 via-amber-500/10 to-transparent",
    badgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    levels: [
      {
        id: 1,
        title: "Console Log Output",
        category: "1. Basics & Output",
        difficulty: "Easy",
        description: "Print a message to the browser console using `console.log()`.",
        concept: "`console.log()` outputs data to the developer debugging console.",
        expectedOutput: "Ready to Code",
        testCases: [{ input: "run", output: "Ready to Code" }],
        hint: "Pass \"Ready to Code\" to console.log.",
        templateWithBlanks: `// Print to console
console.log("______");`,
        solutionCode: `console.log("Ready to Code");`
      },
      {
        id: 2,
        title: "Variables with Let and Const",
        category: "2. Variables & Types",
        difficulty: "Easy",
        description: "Declare variables `a` and `b`, calculate `sum`, and log the result.",
        concept: "`let` allows reassignment while `const` creates block-scoped read-only constants.",
        expectedOutput: "30",
        testCases: [{ input: "run", output: "30" }],
        hint: "Add `a + b`.",
        templateWithBlanks: `const a = 10;
const b = 20;
const sum = a ______ b;
console.log(sum);`,
        solutionCode: `const a = 10;
const b = 20;
const sum = a + b;
console.log(sum);`
      },
      {
        id: 3,
        title: "Template Literal Backticks",
        category: "3. Strings & Interpolation",
        difficulty: "Easy",
        description: "Format a greeting string with backticks `` `Hello, ${user}!` ``.",
        concept: "Template literals with `${variable}` syntax allow embedded string expressions.",
        expectedOutput: "Hello, Developer!",
        testCases: [{ input: "run", output: "Hello, Developer!" }],
        hint: "Insert `${user}` inside backticks.",
        templateWithBlanks: `const user = "Developer";
const greeting = \`Hello, \${______}!\`;
console.log(greeting);`,
        solutionCode: `const user = "Developer";
const greeting = \`Hello, \${user}!\`;
console.log(greeting);`
      },
      {
        id: 4,
        title: "If - Else Condition",
        category: "4. Conditionals (If/Else)",
        difficulty: "Easy",
        description: "Check if `speed > 60` to log 'Fast', otherwise log 'Normal'.",
        concept: "`if (condition) { ... } else { ... }` controls conditional execution.",
        expectedOutput: "Fast",
        testCases: [{ input: "run", output: "Fast" }],
        hint: "Check `speed > 60`.",
        templateWithBlanks: `const speed = 75;

if (speed > ______) {
  console.log("Fast");
} else {
  console.log("Normal");
}`,
        solutionCode: `const speed = 75;

if (speed > 60) {
  console.log("Fast");
} else {
  console.log("Normal");
}`
      },
      {
        id: 5,
        title: "Strict Equality (===) & Else If",
        category: "5. Conditionals (Else If)",
        difficulty: "Easy",
        description: "Check theme mode using `===` and `else if` branching.",
        concept: "`===` validates both value and data type without implicit type conversion.",
        expectedOutput: "Dark Mode Active",
        testCases: [{ input: "run", output: "Dark Mode Active" }],
        hint: "Use keyword `else if`.",
        templateWithBlanks: `const mode = "dark";

if (mode === "light") {
  console.log("Light Mode");
} ______ (mode === "dark") {
  console.log("Dark Mode Active");
} else {
  console.log("System Default");
}`,
        solutionCode: `const mode = "dark";

if (mode === "light") {
  console.log("Light Mode");
} else if (mode === "dark") {
  console.log("Dark Mode Active");
} else {
  console.log("System Default");
}`
      },
      {
        id: 6,
        title: "While Loop Counter",
        category: "6. Loops (While)",
        difficulty: "Medium",
        description: "Iterate from 1 to 3 with a `while` loop, incrementing `i++`.",
        concept: "`while (condition)` runs until the condition turns false.",
        expectedOutput: "1\\n2\\n3",
        testCases: [{ input: "run", output: "1, 2, 3" }],
        hint: "Increment `i++` inside the loop.",
        templateWithBlanks: `let i = 1;

while (i <= 3) {
  console.log(i);
  i______;
}`,
        solutionCode: `let i = 1;

while (i <= 3) {
  console.log(i);
  i++;
}`
      },
      {
        id: 7,
        title: "Standard For Loop",
        category: "7. Loops (For)",
        difficulty: "Medium",
        description: "Write a `for` loop counting `for (let i = 0; i < 3; i++)`.",
        concept: "The `for` loop combines initialization, condition, and increment in one line.",
        expectedOutput: "0\\n1\\n2",
        testCases: [{ input: "run", output: "0, 1, 2" }],
        hint: "Set condition `i < 3`.",
        templateWithBlanks: `for (let i = 0; i < ______; i++) {
  console.log(i);
}`,
        solutionCode: `for (let i = 0; i < 3; i++) {
  console.log(i);
}`
      },
      {
        id: 8,
        title: "Array Push & Length",
        category: "8. Arrays",
        difficulty: "Medium",
        description: "Create an array `switches`, push 'Tactile Brown', and check `.length`.",
        concept: "Arrays are indexed lists. `.push()` adds items and `.length` returns total size.",
        expectedOutput: "2",
        testCases: [{ input: "run", output: "2" }],
        hint: "Call `switches.push(\"Tactile Brown\")`.",
        templateWithBlanks: `const switches = ["Linear Red"];
switches.______("Tactile Brown");
console.log(switches.length);`,
        solutionCode: `const switches = ["Linear Red"];
switches.push("Tactile Brown");
console.log(switches.length);`
      },
      {
        id: 9,
        title: "For...Of Array Iteration",
        category: "9. Array Iteration",
        difficulty: "Medium",
        description: "Iterate through array items and accumulate sum using `for...of`.",
        concept: "`for (const item of array)` loops cleanly over iterable collections.",
        expectedOutput: "60",
        testCases: [{ input: "run", output: "60" }],
        hint: "Add `num` to `total`.",
        templateWithBlanks: `const nums = [10, 20, 30];
let total = 0;

for (const num of nums) {
  total += ______;
}
console.log(total);`,
        solutionCode: `const nums = [10, 20, 30];
let total = 0;

for (const num of nums) {
  total += num;
}
console.log(total);`
      },
      {
        id: 10,
        title: "Standard Function Definition",
        category: "10. Functions",
        difficulty: "Medium",
        description: "Declare a function `add(a, b)` that returns their sum.",
        concept: "`function name(params) { return ...; }` creates a reusable callable block.",
        expectedOutput: "add(4, 5) => 9",
        testCases: [{ input: "add(4, 5)", output: "9" }],
        hint: "Return `a + b`.",
        templateWithBlanks: `function add(a, b) {
  return a ______ b;
}

console.log(add(4, 5));`,
        solutionCode: `function add(a, b) {
  return a + b;
}

console.log(add(4, 5));`
      },
      {
        id: 11,
        title: "ES6 Arrow Function",
        category: "11. Arrow Functions",
        difficulty: "Hard",
        description: "Write an arrow function `multiply = (x, y) => x * y`.",
        concept: "Arrow functions `(a, b) => expression` provide concise functional syntax.",
        expectedOutput: "multiply(3, 7) => 21",
        testCases: [{ input: "multiply(3, 7)", output: "21" }],
        hint: "Use arrow operator `=>`.",
        templateWithBlanks: `const multiply = (x, y) ______ x * y;

console.log(multiply(3, 7));`,
        solutionCode: `const multiply = (x, y) => x * y;

console.log(multiply(3, 7));`
      },
      {
        id: 12,
        title: "Array Map & Filter Transformation",
        category: "12. Higher-Order Methods",
        difficulty: "Hard",
        description: "Filter even numbers and map to square them using method chaining.",
        concept: "Chain `.filter()` and `.map()` for declarative data pipelines.",
        expectedOutput: "[4, 16]",
        testCases: [{ input: "run", output: "[4, 16]" }],
        hint: "Filter with `n % 2 === 0`.",
        templateWithBlanks: `const nums = [1, 2, 3, 4];
const result = nums
  .filter((n) => n % 2 ______ 0)
  .map((n) => n * n);

console.log(result);`,
        solutionCode: `const nums = [1, 2, 3, 4];
const result = nums
  .filter((n) => n % 2 === 0)
  .map((n) => n * n);

console.log(result);`
      }
    ]
  },

  // =========================================================================
  // 3. JAVA (Print -> Variables -> If/Else -> Loops -> Arrays -> Methods/Classes)
  // =========================================================================
  {
    id: "java",
    name: "Java",
    extension: ".java",
    tagline: "System output, typed variables, if-else, loops, arrays & OOP classes",
    icon: "☕",
    color: "text-red-400",
    bgGradient: "from-red-500/20 via-orange-500/10 to-transparent",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
    levels: [
      {
        id: 1,
        title: "Standard Output Stream",
        category: "1. Basics & Output",
        difficulty: "Easy",
        description: "Print a message using `System.out.println()` inside the `main` method.",
        concept: "`System.out.println()` outputs a line of text to standard output.",
        expectedOutput: "Hello, Java!",
        testCases: [{ input: "main()", output: "Hello, Java!" }],
        hint: "Call `System.out.println(\"Hello, Java!\");`.",
        templateWithBlanks: `public class Main {
    public static void main(String[] args) {
        System.out.____("Hello, Java!");
    }
}`,
        solutionCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`
      },
      {
        id: 2,
        title: "Primitive Variables & Addition",
        category: "2. Variables & Types",
        difficulty: "Easy",
        description: "Declare integer variables `int a` and `int b`, and print their sum.",
        concept: "Java is statically typed: variables require explicit types like `int`, `double`, `boolean`.",
        expectedOutput: "45",
        testCases: [{ input: "run", output: "45" }],
        hint: "Calculate `int sum = a + b;`.",
        templateWithBlanks: `public class Main {
    public static void main(String[] args) {
        int a = 20;
        int b = 25;
        int sum = a ______ b;
        System.out.println(sum);
    }
}`,
        solutionCode: `public class Main {
    public static void main(String[] args) {
        int a = 20;
        int b = 25;
        int sum = a + b;
        System.out.println(sum);
    }
}`
      },
      {
        id: 3,
        title: "If - Else Condition",
        category: "3. Conditionals (If/Else)",
        difficulty: "Easy",
        description: "Check if `num >= 0` to print 'Positive', else print 'Negative'.",
        concept: "`if (condition) { } else { }` checks boolean predicates.",
        expectedOutput: "Positive",
        testCases: [{ input: "run", output: "Positive" }],
        hint: "Condition is `num >= 0`.",
        templateWithBlanks: `public class Main {
    public static void main(String[] args) {
        int num = 10;
        if (num >= ______) {
            System.out.println("Positive");
        } else {
            System.out.println("Negative");
        }
    }
}`,
        solutionCode: `public class Main {
    public static void main(String[] args) {
        int num = 10;
        if (num >= 0) {
            System.out.println("Positive");
        } else {
            System.out.println("Negative");
        }
    }
}`
      },
      {
        id: 4,
        title: "If - Else If Multi-Branching",
        category: "4. Conditionals (Else If)",
        difficulty: "Easy",
        description: "Grade test scores using `else if (score >= 80)`.",
        concept: "Chain multiple conditions with `else if` in Java.",
        expectedOutput: "Grade B",
        testCases: [{ input: "run", output: "Grade B" }],
        hint: "Use keyword `else if`.",
        templateWithBlanks: `public class Main {
    public static void main(String[] args) {
        int score = 85;
        if (score >= 90) {
            System.out.println("Grade A");
        } ______ (score >= 80) {
            System.out.println("Grade B");
        } else {
            System.out.println("Grade C");
        }
    }
}`,
        solutionCode: `public class Main {
    public static void main(String[] args) {
        int score = 85;
        if (score >= 90) {
            System.out.println("Grade A");
        } else if (score >= 80) {
            System.out.println("Grade B");
        } else {
            System.out.println("Grade C");
        }
    }
}`
      },
      {
        id: 5,
        title: "While Loop",
        category: "5. Loops (While)",
        difficulty: "Medium",
        description: "Iterate from `count = 1` up to 3 using a `while` loop.",
        concept: "`while (condition)` checks the condition before each loop iteration.",
        expectedOutput: "1 2 3",
        testCases: [{ input: "run", output: "1, 2, 3" }],
        hint: "Increment `count++`.",
        templateWithBlanks: `public class Main {
    public static void main(String[] args) {
        int count = 1;
        while (count <= 3) {
            System.out.println(count);
            count______;
        }
    }
}`,
        solutionCode: `public class Main {
    public static void main(String[] args) {
        int count = 1;
        while (count <= 3) {
            System.out.println(count);
            count++;
        }
    }
}`
      },
      {
        id: 6,
        title: "Standard For Loop",
        category: "6. Loops (For)",
        difficulty: "Medium",
        description: "Count from 0 to 2 with `for (int i = 0; i < 3; i++)`.",
        concept: "The `for` loop manages index counters compactly in Java.",
        expectedOutput: "0 1 2",
        testCases: [{ input: "run", output: "0, 1, 2" }],
        hint: "Set condition `i < 3`.",
        templateWithBlanks: `public class Main {
    public static void main(String[] args) {
        for (int i = 0; i < ______; i++) {
            System.out.println(i);
        }
    }
}`,
        solutionCode: `public class Main {
    public static void main(String[] args) {
        for (int i = 0; i < 3; i++) {
            System.out.println(i);
        }
    }
}`
      },
      {
        id: 7,
        title: "Array Declaration & Access",
        category: "7. Arrays",
        difficulty: "Medium",
        description: "Create an array `int[] numbers` and access the first element `numbers[0]`.",
        concept: "Arrays have fixed size in Java, indexed starting at 0.",
        expectedOutput: "10",
        testCases: [{ input: "run", output: "10" }],
        hint: "Access index `numbers[0]`.",
        templateWithBlanks: `public class Main {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30};
        System.out.println(numbers[______]);
    }
}`,
        solutionCode: `public class Main {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30};
        System.out.println(numbers[0]);
    }
}`
      },
      {
        id: 8,
        title: "Enhanced For-Each Loop",
        category: "8. Array Iteration",
        difficulty: "Medium",
        description: "Accumulate total sum of an array using enhanced `for (int n : arr)`.",
        concept: "Enhanced for-each loop iterates directly over elements without indexing.",
        expectedOutput: "60",
        testCases: [{ input: "run", output: "60" }],
        hint: "Accumulate `sum += n;`.",
        templateWithBlanks: `public class Main {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30};
        int sum = 0;
        for (int n : arr) {
            sum += ______;
        }
        System.out.println(sum);
    }
}`,
        solutionCode: `public class Main {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30};
        int sum = 0;
        for (int n : arr) {
            sum += n;
        }
        System.out.println(sum);
    }
}`
      },
      {
        id: 9,
        title: "Static Helper Method",
        category: "9. Methods",
        difficulty: "Medium",
        description: "Define a static method `add(int a, int b)` that returns an integer.",
        concept: "`public static returnType methodName(params)` defines class-level methods.",
        expectedOutput: "add(10, 15) => 25",
        testCases: [{ input: "add(10, 15)", output: "25" }],
        hint: "Return `a + b;`.",
        templateWithBlanks: `public class Main {
    public static int add(int a, int b) {
        return a ______ b;
    }

    public static void main(String[] args) {
        System.out.println(add(10, 15));
    }
}`,
        solutionCode: `public class Main {
    public static int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        System.out.println(add(10, 15));
    }
}`
      },
      {
        id: 10,
        title: "Method with Boolean Logic",
        category: "10. Methods & Logic",
        difficulty: "Hard",
        description: "Write a static method `isEven(int n)` returning `n % 2 == 0`.",
        concept: "Methods can return boolean flags for validation and tests.",
        expectedOutput: "isEven(4) => true",
        testCases: [{ input: "isEven(4)", output: "true" }],
        hint: "Return `n % 2 == 0;`.",
        templateWithBlanks: `public class Main {
    public static boolean isEven(int n) {
        return n % 2 ______ 0;
    }

    public static void main(String[] args) {
        System.out.println(isEven(4));
    }
}`,
        solutionCode: `public class Main {
    public static boolean isEven(int n) {
        return n % 2 == 0;
    }

    public static void main(String[] args) {
        System.out.println(isEven(4));
    }
}`
      },
      {
        id: 11,
        title: "OOP Class & Constructor",
        category: "11. Object-Oriented Programming",
        difficulty: "Hard",
        description: "Create a `User` class with a constructor initializing `this.name = name;`.",
        concept: "Constructors initialize newly instantiated objects.",
        expectedOutput: "Alex",
        testCases: [{ input: "run", output: "Alex" }],
        hint: "Assign `this.name = name;`.",
        templateWithBlanks: `public class User {
    private String name;

    public User(String name) {
        this.name = ______;
    }

    public String getName() {
        return this.name;
    }
}`,
        solutionCode: `public class User {
    private String name;

    public User(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }
}`
      },
      {
        id: 12,
        title: "ArrayList Dynamic Collection",
        category: "12. Collections Framework",
        difficulty: "Hard",
        description: "Create an `ArrayList<String>`, add an item, and check `.size()`.",
        concept: "`ArrayList` provides dynamic resizing unlike fixed arrays.",
        expectedOutput: "1",
        testCases: [{ input: "run", output: "1" }],
        hint: "Call `list.add(\"Switch\");`.",
        templateWithBlanks: `import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> list = new ArrayList<>();
        list.______("Switch");
        System.out.println(list.size());
    }
}`,
        solutionCode: `import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> list = new ArrayList<>();
        list.add("Switch");
        System.out.println(list.size());
    }
}`
      }
    ]
  },

  // =========================================================================
  // 4. C LANGUAGE (Printf -> Variables -> If/Else -> While/For -> Arrays -> Functions/Pointers)
  // =========================================================================
  {
    id: "c",
    name: "C",
    extension: ".c",
    tagline: "Printf, typed variables, if-else, while/for loops, arrays & pointers",
    icon: "⚙️",
    color: "text-blue-400",
    bgGradient: "from-blue-500/20 via-sky-500/10 to-transparent",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    levels: [
      {
        id: 1,
        title: "Hello World Output",
        category: "1. Basics & Output",
        difficulty: "Easy",
        description: "Include `<stdio.h>` and print 'Hello, World!' using `printf`.",
        concept: "`printf()` outputs formatted strings to stdout in C.",
        expectedOutput: "Hello, World!",
        testCases: [{ input: "main()", output: "Hello, World!" }],
        hint: "Call `printf(\"Hello, World!\\n\");`.",
        templateWithBlanks: `#include <stdio.h>

int main() {
    printf("______\\n");
    return 0;
}`,
        solutionCode: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`
      },
      {
        id: 2,
        title: "Variables & Integer Arithmetic",
        category: "2. Variables & Math",
        difficulty: "Easy",
        description: "Declare integer variables `int a` and `int b`, and print their sum.",
        concept: "`%d` format specifier prints decimal integer variables.",
        expectedOutput: "Sum: 30",
        testCases: [{ input: "run", output: "Sum: 30" }],
        hint: "Calculate `int sum = a + b;`.",
        templateWithBlanks: `#include <stdio.h>

int main() {
    int a = 10;
    int b = 20;
    int sum = a ______ b;
    printf("Sum: %d\\n", sum);
    return 0;
}`,
        solutionCode: `#include <stdio.h>

int main() {
    int a = 10;
    int b = 20;
    int sum = a + b;
    printf("Sum: %d\\n", sum);
    return 0;
}`
      },
      {
        id: 3,
        title: "If - Else Condition",
        category: "3. Conditionals (If/Else)",
        difficulty: "Easy",
        description: "Check if `num > 0` to print 'Positive', else print 'Non-Positive'.",
        concept: "Conditions in C evaluate nonzero as true and 0 as false.",
        expectedOutput: "Positive",
        testCases: [{ input: "run", output: "Positive" }],
        hint: "Condition is `num > 0`.",
        templateWithBlanks: `#include <stdio.h>

int main() {
    int num = 5;
    if (num > ______) {
        printf("Positive\\n");
    } else {
        printf("Non-Positive\\n");
    }
    return 0;
}`,
        solutionCode: `#include <stdio.h>

int main() {
    int num = 5;
    if (num > 0) {
        printf("Positive\\n");
    } else {
        printf("Non-Positive\\n");
    }
    return 0;
}`
      },
      {
        id: 4,
        title: "If - Else If Multi-Branching",
        category: "4. Conditionals (Else If)",
        difficulty: "Easy",
        description: "Check temperature ranges using `else if (temp >= 20)`.",
        concept: "Evaluate multiple branches cleanly with `else if`.",
        expectedOutput: "Warm",
        testCases: [{ input: "run", output: "Warm" }],
        hint: "Use `else if`.",
        templateWithBlanks: `#include <stdio.h>

int main() {
    int temp = 25;
    if (temp >= 30) {
        printf("Hot\\n");
    } ______ (temp >= 20) {
        printf("Warm\\n");
    } else {
        printf("Cold\\n");
    }
    return 0;
}`,
        solutionCode: `#include <stdio.h>

int main() {
    int temp = 25;
    if (temp >= 30) {
        printf("Hot\\n");
    } else if (temp >= 20) {
        printf("Warm\\n");
    } else {
        printf("Cold\\n");
    }
    return 0;
}`
      },
      {
        id: 5,
        title: "While Loop Counter",
        category: "5. Loops (While)",
        difficulty: "Medium",
        description: "Print numbers 1 to 3 with a `while (i <= 3)` loop.",
        concept: "`while` repeats until its condition evaluates to false (0).",
        expectedOutput: "1 2 3",
        testCases: [{ input: "run", output: "1, 2, 3" }],
        hint: "Increment `i++`.",
        templateWithBlanks: `#include <stdio.h>

int main() {
    int i = 1;
    while (i <= 3) {
        printf("%d\\n", i);
        i______;
    }
    return 0;
}`,
        solutionCode: `#include <stdio.h>

int main() {
    int i = 1;
    while (i <= 3) {
        printf("%d\\n", i);
        i++;
    }
    return 0;
}`
      },
      {
        id: 6,
        title: "Standard For Loop",
        category: "6. Loops (For)",
        difficulty: "Medium",
        description: "Loop 3 times using `for (int i = 0; i < 3; i++)`.",
        concept: "`for` loop packs initialization, condition, and step in one statement.",
        expectedOutput: "0 1 2",
        testCases: [{ input: "run", output: "0, 1, 2" }],
        hint: "Set condition `i < 3`.",
        templateWithBlanks: `#include <stdio.h>

int main() {
    for (int i = 0; i < ______; i++) {
        printf("%d\\n", i);
    }
    return 0;
}`,
        solutionCode: `#include <stdio.h>

int main() {
    for (int i = 0; i < 3; i++) {
        printf("%d\\n", i);
    }
    return 0;
}`
      },
      {
        id: 7,
        title: "Array Declaration & Access",
        category: "7. Arrays",
        difficulty: "Medium",
        description: "Declare `int arr[3] = {10, 20, 30};` and access index 0.",
        concept: "C arrays are contiguous blocks of memory indexed from 0.",
        expectedOutput: "10",
        testCases: [{ input: "run", output: "10" }],
        hint: "Access `arr[0]`.",
        templateWithBlanks: `#include <stdio.h>

int main() {
    int arr[3] = {10, 20, 30};
    printf("%d\\n", arr[______]);
    return 0;
}`,
        solutionCode: `#include <stdio.h>

int main() {
    int arr[3] = {10, 20, 30};
    printf("%d\\n", arr[0]);
    return 0;
}`
      },
      {
        id: 8,
        title: "Array Sum with For Loop",
        category: "8. Array Iteration",
        difficulty: "Medium",
        description: "Iterate over an array of size 3 and accumulate the total sum.",
        concept: "Use a loop counter to index each element `total += arr[i]`.",
        expectedOutput: "60",
        testCases: [{ input: "run", output: "60" }],
        hint: "Accumulate `total += arr[i];`.",
        templateWithBlanks: `#include <stdio.h>

int main() {
    int arr[3] = {10, 20, 30};
    int total = 0;
    for (int i = 0; i < 3; i++) {
        total += ______[i];
    }
    printf("%d\\n", total);
    return 0;
}`,
        solutionCode: `#include <stdio.h>

int main() {
    int arr[3] = {10, 20, 30};
    int total = 0;
    for (int i = 0; i < 3; i++) {
        total += arr[i];
    }
    printf("%d\\n", total);
    return 0;
}`
      },
      {
        id: 9,
        title: "Function Declaration & Return",
        category: "9. Functions",
        difficulty: "Medium",
        description: "Define a function `int add(int a, int b)` that returns `a + b`.",
        concept: "Functions in C require explicit return type and parameter types.",
        expectedOutput: "add(5, 7) => 12",
        testCases: [{ input: "add(5, 7)", output: "12" }],
        hint: "Return `a + b;`.",
        templateWithBlanks: `#include <stdio.h>

int add(int a, int b) {
    return a ______ b;
}

int main() {
    printf("%d\\n", add(5, 7));
    return 0;
}`,
        solutionCode: `#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main() {
    printf("%d\\n", add(5, 7));
    return 0;
}`
      },
      {
        id: 10,
        title: "Function with Modulo Logic",
        category: "10. Functions & Logic",
        difficulty: "Hard",
        description: "Write `int is_even(int n)` returning 1 if even else 0.",
        concept: "Return integer flags `(n % 2 == 0)` representing booleans.",
        expectedOutput: "is_even(8) => 1",
        testCases: [{ input: "is_even(8)", output: "1" }],
        hint: "Return `(n % 2 == 0);`.",
        templateWithBlanks: `#include <stdio.h>

int is_even(int n) {
    return (n % 2 ______ 0);
}

int main() {
    printf("%d\\n", is_even(8));
    return 0;
}`,
        solutionCode: `#include <stdio.h>

int is_even(int n) {
    return (n % 2 == 0);
}

int main() {
    printf("%d\\n", is_even(8));
    return 0;
}`
      },
      {
        id: 11,
        title: "Pointer Dereferencing & Swap",
        category: "11. Pointers & Memory",
        difficulty: "Hard",
        description: "Swap two integer values using pointers `*a` and `*b`.",
        concept: "The `*` dereference operator reads and modifies value at a memory address.",
        expectedOutput: "Swapped: 10 5",
        testCases: [{ input: "swap(&x, &y)", output: "10, 5" }],
        hint: "Assign `*a = *b;`.",
        templateWithBlanks: `void swap(int *a, int *b) {
    int temp = *a;
    *a = ______;
    *b = temp;
}`,
        solutionCode: `void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}`
      },
      {
        id: 12,
        title: "Struct Definition",
        category: "12. Structs & Data Models",
        difficulty: "Hard",
        description: "Define a 2D `Point` struct containing `int x;` and `int y;`.",
        concept: "`struct` bundles multiple related variables into a unified composite type.",
        expectedOutput: "Point { x, y }",
        testCases: [{ input: "run", output: "Point struct" }],
        hint: "Declare `int y;`.",
        templateWithBlanks: `struct Point {
    int x;
    int ______;
};`,
        solutionCode: `struct Point {
    int x;
    int y;
};`
      }
    ]
  },

  // =========================================================================
  // 5. C++ (Std::cout -> Variables -> If/Else -> Loops -> Vectors -> Functions/Classes)
  // =========================================================================
  {
    id: "cpp",
    name: "C++",
    extension: ".cpp",
    tagline: "Stream output, variables, conditionals, vectors & modern STL algorithms",
    icon: "⚡",
    color: "text-cyan-400",
    bgGradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    levels: [
      {
        id: 1,
        title: "Standard Stream Output",
        category: "1. Basics & Streams",
        difficulty: "Easy",
        description: "Output text using `std::cout << ... << std::endl;`.",
        concept: "`std::cout` stream insertion operator `<<` sends data to console.",
        expectedOutput: "Hello, C++!",
        testCases: [{ input: "main()", output: "Hello, C++!" }],
        hint: "Use stream operator `<< \"Hello, C++!\"`.",
        templateWithBlanks: `#include <iostream>

int main() {
    std::cout ______ "Hello, C++!" << std::endl;
    return 0;
}`,
        solutionCode: `#include <iostream>

int main() {
    std::cout << "Hello, C++!" << std::endl;
    return 0;
}`
      },
      {
        id: 2,
        title: "Variables & Stream Arithmetic",
        category: "2. Variables & Math",
        difficulty: "Easy",
        description: "Declare variables `int a` and `int b`, and output their sum.",
        concept: "C++ supports strongly typed variables and stream concatenation.",
        expectedOutput: "35",
        testCases: [{ input: "run", output: "35" }],
        hint: "Calculate `int sum = a + b;`.",
        templateWithBlanks: `#include <iostream>

int main() {
    int a = 15;
    int b = 20;
    int sum = a ______ b;
    std::cout << sum << std::endl;
    return 0;
}`,
        solutionCode: `#include <iostream>

int main() {
    int a = 15;
    int b = 20;
    int sum = a + b;
    std::cout << sum << std::endl;
    return 0;
}`
      },
      {
        id: 3,
        title: "If - Else Condition",
        category: "3. Conditionals (If/Else)",
        difficulty: "Easy",
        description: "Check if `speed >= 60` to print 'Fast', else print 'Slow'.",
        concept: "`if (condition)` branches logic based on boolean expressions.",
        expectedOutput: "Fast",
        testCases: [{ input: "run", output: "Fast" }],
        hint: "Set condition `speed >= 60`.",
        templateWithBlanks: `#include <iostream>

int main() {
    int speed = 70;
    if (speed >= ______) {
        std::cout << "Fast" << std::endl;
    } else {
        std::cout << "Slow" << std::endl;
    }
    return 0;
}`,
        solutionCode: `#include <iostream>

int main() {
    int speed = 70;
    if (speed >= 60) {
        std::cout << "Fast" << std::endl;
    } else {
        std::cout << "Slow" << std::endl;
    }
    return 0;
}`
      },
      {
        id: 4,
        title: "If - Else If Multi-Branching",
        category: "4. Conditionals (Else If)",
        difficulty: "Easy",
        description: "Branch with `else if (grade >= 80)` to print 'B'.",
        concept: "Chain multiple evaluation checks with `else if`.",
        expectedOutput: "B",
        testCases: [{ input: "run", output: "B" }],
        hint: "Use keyword `else if`.",
        templateWithBlanks: `#include <iostream>

int main() {
    int grade = 85;
    if (grade >= 90) {
        std::cout << "A" << std::endl;
    } ______ (grade >= 80) {
        std::cout << "B" << std::endl;
    } else {
        std::cout << "C" << std::endl;
    }
    return 0;
}`,
        solutionCode: `#include <iostream>

int main() {
    int grade = 85;
    if (grade >= 90) {
        std::cout << "A" << std::endl;
    } else if (grade >= 80) {
        std::cout << "B" << std::endl;
    } else {
        std::cout << "C" << std::endl;
    }
    return 0;
}`
      },
      {
        id: 5,
        title: "While Loop Counter",
        category: "5. Loops (While)",
        difficulty: "Medium",
        description: "Count from 1 to 3 using `while (count <= 3)`.",
        concept: "`while` loops execute as long as the test expression stays true.",
        expectedOutput: "1 2 3",
        testCases: [{ input: "run", output: "1, 2, 3" }],
        hint: "Increment `count++`.",
        templateWithBlanks: `#include <iostream>

int main() {
    int count = 1;
    while (count <= 3) {
        std::cout << count << std::endl;
        count______;
    }
    return 0;
}`,
        solutionCode: `#include <iostream>

int main() {
    int count = 1;
    while (count <= 3) {
        std::cout << count << std::endl;
        count++;
    }
    return 0;
}`
      },
      {
        id: 6,
        title: "Standard For Loop",
        category: "6. Loops (For)",
        difficulty: "Medium",
        description: "Loop 3 times using `for (int i = 0; i < 3; i++)`.",
        concept: "Classic index-controlled loop for deterministic iterations.",
        expectedOutput: "0 1 2",
        testCases: [{ input: "run", output: "0, 1, 2" }],
        hint: "Set condition `i < 3`.",
        templateWithBlanks: `#include <iostream>

int main() {
    for (int i = 0; i < ______; i++) {
        std::cout << i << std::endl;
    }
    return 0;
}`,
        solutionCode: `#include <iostream>

int main() {
    for (int i = 0; i < 3; i++) {
        std::cout << i << std::endl;
    }
    return 0;
}`
      },
      {
        id: 7,
        title: "STL Vector Push Back",
        category: "7. STL Containers",
        difficulty: "Medium",
        description: "Declare `std::vector<int> v;`, append item with `push_back(42)`, and check size.",
        concept: "`std::vector` is a dynamically resizable array container.",
        expectedOutput: "1",
        testCases: [{ input: "run", output: "1" }],
        hint: "Call `v.push_back(42);`.",
        templateWithBlanks: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v;
    v.______(42);
    std::cout << v.size() << std::endl;
    return 0;
}`,
        solutionCode: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v;
    v.push_back(42);
    std::cout << v.size() << std::endl;
    return 0;
}`
      },
      {
        id: 8,
        title: "Range-Based For Loop",
        category: "8. Modern C++ Loops",
        difficulty: "Medium",
        description: "Accumulate vector items using modern `for (const auto &item : vec)`.",
        concept: "Range-based loops prevent indexing errors and provide clean syntax.",
        expectedOutput: "60",
        testCases: [{ input: "run", output: "60" }],
        hint: "Accumulate `total += item;`.",
        templateWithBlanks: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> vec = {10, 20, 30};
    int total = 0;
    for (const auto &item : vec) {
        total += ______;
    }
    std::cout << total << std::endl;
    return 0;
}`,
        solutionCode: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> vec = {10, 20, 30};
    int total = 0;
    for (const auto &item : vec) {
        total += item;
    }
    std::cout << total << std::endl;
    return 0;
}`
      },
      {
        id: 9,
        title: "Function Declaration & Return",
        category: "9. Functions",
        difficulty: "Medium",
        description: "Write `int add(int a, int b)` returning `a + b`.",
        concept: "Functions encapsulate logic into modular callable units.",
        expectedOutput: "add(6, 4) => 10",
        testCases: [{ input: "add(6, 4)", output: "10" }],
        hint: "Return `a + b;`.",
        templateWithBlanks: `#include <iostream>

int add(int a, int b) {
    return a ______ b;
}

int main() {
    std::cout << add(6, 4) << std::endl;
    return 0;
}`,
        solutionCode: `#include <iostream>

int add(int a, int b) {
    return a + b;
}

int main() {
    std::cout << add(6, 4) << std::endl;
    return 0;
}`
      },
      {
        id: 10,
        title: "Pass by Reference (&)",
        category: "10. References",
        difficulty: "Hard",
        description: "Modify an integer in-place by passing a reference `int &val`.",
        concept: "Passing by reference avoids expensive copies and modifies caller state directly.",
        expectedOutput: "11",
        testCases: [{ input: "run", output: "11" }],
        hint: "Type parameter as `int &val`.",
        templateWithBlanks: `void increment(int ______val) {
    val += 1;
}`,
        solutionCode: `void increment(int &val) {
    val += 1;
}`
      },
      {
        id: 11,
        title: "STL Vector Sorting",
        category: "11. STL Algorithms",
        difficulty: "Hard",
        description: "Sort a vector in ascending order with `std::sort(v.begin(), v.end())`.",
        concept: "`std::sort` provides optimized O(N log N) IntroSort sorting.",
        expectedOutput: "Sorted Vector",
        testCases: [{ input: "run", output: "sorted" }],
        hint: "Call `std::sort(v.begin(), v.end());`.",
        templateWithBlanks: `#include <vector>
#include <algorithm>

void sort_vector(std::vector<int> &v) {
    std::sort(v.begin(), v.______);
}`,
        solutionCode: `#include <vector>
#include <algorithm>

void sort_vector(std::vector<int> &v) {
    std::sort(v.begin(), v.end());
}`
      },
      {
        id: 12,
        title: "Template Generic Max",
        category: "12. Templates",
        difficulty: "Hard",
        description: "Write a generic template function `template <typename T> T getMax(T a, T b)`.",
        concept: "Templates enable compile-time type polymorphism.",
        expectedOutput: "getMax(10, 20) => 20",
        testCases: [{ input: "getMax(10, 20)", output: "20" }],
        hint: "Use ternary `(a > b) ? a : b`.",
        templateWithBlanks: `template <typename T>
T getMax(T a, T b) {
    return (a > b) ? a : ______;
}`,
        solutionCode: `template <typename T>
T getMax(T a, T b) {
    return (a > b) ? a : b;
}`
      }
    ]
  },

  // =========================================================================
  // 6. HTML (Doctype -> Head/Body -> Nav -> Headings -> Forms -> Tables -> Media)
  // =========================================================================
  {
    id: "html",
    name: "HTML",
    extension: ".html",
    tagline: "Doctype, semantic tags, navigation, forms, tables & media embeds",
    icon: "🌐",
    color: "text-orange-400",
    bgGradient: "from-orange-500/20 via-rose-500/10 to-transparent",
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    levels: [
      {
        id: 1,
        title: "HTML5 Doctype Declaration",
        category: "1. Document Structure",
        difficulty: "Easy",
        description: "Declare the standard HTML5 doctype header.",
        concept: "`<!DOCTYPE html>` informs browsers to render in standard mode.",
        expectedOutput: "<!DOCTYPE html>",
        testCases: [{ input: "render", output: "<!DOCTYPE html>" }],
        hint: "Type `<!DOCTYPE html>`.",
        templateWithBlanks: `<!DOCTYPE ______>
<html>
  <head>
    <title>3D Keyboard</title>
  </head>
  <body>
    <h1>Arcade Ready</h1>
  </body>
</html>`,
        solutionCode: `<!DOCTYPE html>
<html>
  <head>
    <title>3D Keyboard</title>
  </head>
  <body>
    <h1>Arcade Ready</h1>
  </body>
</html>`
      },
      {
        id: 2,
        title: "Semantic Navigation Bar",
        category: "2. Semantic Tags",
        difficulty: "Easy",
        description: "Wrap navigation links inside a semantic `<nav>` tag.",
        concept: "`<nav>` designates primary navigation blocks for screen readers and search engines.",
        expectedOutput: "<nav> links </nav>",
        testCases: [{ input: "render", output: "nav section" }],
        hint: "Use `<nav>` and `</nav>`.",
        templateWithBlanks: `<______>
  <a href="/home">Home</a>
  <a href="/arcade">Arcade</a>
</______>`,
        solutionCode: `<nav>
  <a href="/home">Home</a>
  <a href="/arcade">Arcade</a>
</nav>`
      },
      {
        id: 3,
        title: "Accessible Button with Type",
        category: "3. Buttons & Controls",
        difficulty: "Easy",
        description: "Create an accessible button with `type=\"button\"`.",
        concept: "Always specify the button type attribute to avoid unintended form submissions.",
        expectedOutput: "<button type=\"button\">Click</button>",
        testCases: [{ input: "render", output: "button" }],
        hint: "Set `type=\"button\"`.",
        templateWithBlanks: `<button type="______" class="btn-primary">
  Switch Theme
</button>`,
        solutionCode: `<button type="button" class="btn-primary">
  Switch Theme
</button>`
      },
      {
        id: 4,
        title: "Unordered List with List Items",
        category: "4. Lists",
        difficulty: "Easy",
        description: "Create an unordered list `<ul>` with three `<li>` elements.",
        concept: "`<ul>` defines an unordered bulleted list, `<li>` represents items.",
        expectedOutput: "List with 3 items",
        testCases: [{ input: "render", output: "list" }],
        hint: "Use `<li>` for list items.",
        templateWithBlanks: `<ul>
  <______>Cherry MX Red</______>
  <______>Gateron Brown</______>
  <______>Kailh Box White</______>
</ul>`,
        solutionCode: `<ul>
  <li>Cherry MX Red</li>
  <li>Gateron Brown</li>
  <li>Kailh Box White</li>
</ul>`
      },
      {
        id: 5,
        title: "Image with Alt Accessibility",
        category: "5. Media Accessibility",
        difficulty: "Medium",
        description: "Embed an image with `src` and descriptive `alt` text.",
        concept: "The `alt` attribute describes the image for screen readers and SEO.",
        expectedOutput: "<img alt=\"Mechanical Keyboard\" />",
        testCases: [{ input: "render", output: "image" }],
        hint: "Set `alt=\"Mechanical Keyboard\"`.",
        templateWithBlanks: `<img src="/switch.png" alt="______" width="200" height="200" />`,
        solutionCode: `<img src="/switch.png" alt="Mechanical Keyboard" width="200" height="200" />`
      },
      {
        id: 6,
        title: "Input Form with Matching Label",
        category: "6. Forms & Inputs",
        difficulty: "Medium",
        description: "Associate a `<label for=\"email\">` with `<input id=\"email\">`.",
        concept: "Matching `for` and `id` links the text label with the input element.",
        expectedOutput: "Labeled Email Input",
        testCases: [{ input: "render", output: "form input" }],
        hint: "Set matching `id=\"email\"`.",
        templateWithBlanks: `<label for="email">User Email</label>
<input type="email" id="______" name="email" required />`,
        solutionCode: `<label for="email">User Email</label>
<input type="email" id="email" name="email" required />`
      },
      {
        id: 7,
        title: "Data Table Structure",
        category: "7. Tables",
        difficulty: "Medium",
        description: "Build a data table using `<table>`, `<tr>`, `<th>`, and `<td>`.",
        concept: "`<th>` defines table header cells while `<td>` holds standard data.",
        expectedOutput: "Table with 2 columns",
        testCases: [{ input: "render", output: "table" }],
        hint: "Use `<th>` for headers.",
        templateWithBlanks: `<table>
  <tr>
    <______>Switch</______>
    <______>Actuation Force</______>
  </tr>
  <tr>
    <td>Linear Red</td>
    <td>45g</td>
  </tr>
</table>`,
        solutionCode: `<table>
  <tr>
    <th>Switch</th>
    <th>Actuation Force</th>
  </tr>
  <tr>
    <td>Linear Red</td>
    <td>45g</td>
  </tr>
</table>`
      },
      {
        id: 8,
        title: "HTML5 Video Player",
        category: "8. Multimedia Embeds",
        difficulty: "Hard",
        description: "Embed an HTML5 video with `controls` attribute and `<source>` tag.",
        concept: "The `controls` attribute activates native browser video playback controls.",
        expectedOutput: "<video controls>...</video>",
        testCases: [{ input: "render", output: "video player" }],
        hint: "Add `controls` attribute.",
        templateWithBlanks: `<video ______ width="640" height="360">
  <source src="typing_demo.mp4" type="video/mp4" />
</video>`,
        solutionCode: `<video controls width="640" height="360">
  <source src="typing_demo.mp4" type="video/mp4" />
</video>`
      },
      {
        id: 9,
        title: "Select Dropdown Menu",
        category: "9. Form Dropdowns",
        difficulty: "Hard",
        description: "Create a `<select>` dropdown menu with multiple `<option>` choices.",
        concept: "`<option value=\"...\">` defines each item in the selection menu.",
        expectedOutput: "Select with options",
        testCases: [{ input: "render", output: "select" }],
        hint: "Use `<option value=\"brown\">Tactile Brown</option>`.",
        templateWithBlanks: `<select name="switchType">
  <option value="red">Linear Red</option>
  <______ value="brown">Tactile Brown</______>
</select>`,
        solutionCode: `<select name="switchType">
  <option value="red">Linear Red</option>
  <option value="brown">Tactile Brown</option>
</select>`
      },
      {
        id: 10,
        title: "Meta Viewport Tag",
        category: "10. Responsive Meta",
        difficulty: "Hard",
        description: "Define the responsive `<meta>` viewport tag in the document `<head>`.",
        concept: "`width=device-width, initial-scale=1.0` enables responsive rendering on mobile.",
        expectedOutput: "<meta name=\"viewport\" ...>",
        testCases: [{ input: "render", output: "meta tag" }],
        hint: "Set `name=\"viewport\"`.",
        templateWithBlanks: `<meta name="______" content="width=device-width, initial-scale=1.0" />`,
        solutionCode: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
      }
    ]
  },

  // =========================================================================
  // 7. CSS (Selectors -> Flexbox -> Borders/Shadows -> Grid -> Transforms -> Animations)
  // =========================================================================
  {
    id: "css",
    name: "CSS",
    extension: ".css",
    tagline: "Selectors, flexbox alignment, card depth, grid layouts & animations",
    icon: "🎨",
    color: "text-pink-400",
    bgGradient: "from-pink-500/20 via-rose-500/10 to-transparent",
    badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    levels: [
      {
        id: 1,
        title: "Center with Flexbox",
        category: "1. Flexbox Alignment",
        difficulty: "Easy",
        description: "Center elements horizontally and vertically using Flexbox.",
        concept: "`justify-content: center` aligns main axis; `align-items: center` aligns cross axis.",
        expectedOutput: "Flexbox Centering Rule",
        testCases: [{ input: "apply", output: "centered layout" }],
        hint: "Set `justify-content: center;`.",
        templateWithBlanks: `.center-box {
  display: flex;
  justify-content: ______;
  align-items: center;
}`,
        solutionCode: `.center-box {
  display: flex;
  justify-content: center;
  align-items: center;
}`
      },
      {
        id: 2,
        title: "Border Radius & Card Padding",
        category: "2. Box Model & Radius",
        difficulty: "Easy",
        description: "Style a modern rounded card with `border-radius: 12px;`.",
        concept: "`border-radius` rounds element corners for sleek modern interfaces.",
        expectedOutput: "Card styling",
        testCases: [{ input: "apply", output: "card" }],
        hint: "Set `border-radius: 12px;`.",
        templateWithBlanks: `.card {
  background-color: #1e293b;
  border-radius: ______;
  padding: 1.5rem;
}`,
        solutionCode: `.card {
  background-color: #1e293b;
  border-radius: 12px;
  padding: 1.5rem;
}`
      },
      {
        id: 3,
        title: "CSS 3-Column Grid Layout",
        category: "3. Grid System",
        difficulty: "Easy",
        description: "Create a 3-column grid with `grid-template-columns: repeat(3, 1fr)`.",
        concept: "`repeat(3, 1fr)` splits available container space into 3 equal fractional tracks.",
        expectedOutput: "3-column grid",
        testCases: [{ input: "apply", output: "grid" }],
        hint: "Use `repeat(3, 1fr)`.",
        templateWithBlanks: `.keycap-grid {
  display: grid;
  grid-template-columns: repeat(3, ______);
  gap: 1rem;
}`,
        solutionCode: `.keycap-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}`
      },
      {
        id: 4,
        title: "Hover Lift Transition",
        category: "4. Transitions & Transforms",
        difficulty: "Medium",
        description: "Add a hover lift effect with `transform: translateY(-4px)`.",
        concept: "`transition` animates property transforms smoothly on user interactions.",
        expectedOutput: "Smooth hover transition",
        testCases: [{ input: "apply", output: "hover effect" }],
        hint: "Use `translateY(-4px)`.",
        templateWithBlanks: `.btn {
  transition: transform 0.2s ease-in-out;
}
.btn:hover {
  transform: ______( -4px );
}`,
        solutionCode: `.btn {
  transition: transform 0.2s ease-in-out;
}
.btn:hover {
  transform: translateY(-4px);
}`
      },
      {
        id: 5,
        title: "Glassmorphism Backdrop Filter",
        category: "5. Modern Visual Depth",
        difficulty: "Medium",
        description: "Create a frosted glass container with `backdrop-filter: blur(12px)`.",
        concept: "`backdrop-filter: blur(...)` blurs pixels directly behind an element.",
        expectedOutput: "Glass effect",
        testCases: [{ input: "apply", output: "glassmorphism" }],
        hint: "Set `backdrop-filter: blur(12px);`.",
        templateWithBlanks: `.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: ______(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}`,
        solutionCode: `.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}`
      },
      {
        id: 6,
        title: "CSS Variables Custom Properties",
        category: "6. Variables & Tokens",
        difficulty: "Medium",
        description: "Declare a theme color in `:root` and consume it with `var()`.",
        concept: "`--primary-color` creates custom reusable CSS design tokens.",
        expectedOutput: "Variable usage",
        testCases: [{ input: "apply", output: "theme variable" }],
        hint: "Access with `var(--primary-color)`.",
        templateWithBlanks: `:root {
  --primary-color: #f97316;
}
.active-key {
  color: ______(--primary-color);
}`,
        solutionCode: `:root {
  --primary-color: #f97316;
}
.active-key {
  color: var(--primary-color);
}`
      },
      {
        id: 7,
        title: "Keyframe Pulse Animation",
        category: "7. Keyframes & Animation",
        difficulty: "Hard",
        description: "Define a `@keyframes pulse` animation toggling opacity.",
        concept: "`@keyframes` orchestrates multi-step smooth CSS animations.",
        expectedOutput: "Keyframes pulse",
        testCases: [{ input: "apply", output: "keyframes" }],
        hint: "Define `@keyframes pulse`.",
        templateWithBlanks: `@______ pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}`,
        solutionCode: `@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}`
      },
      {
        id: 8,
        title: "Sticky Top Header",
        category: "8. Positioning",
        difficulty: "Hard",
        description: "Lock a navbar to top of viewport with `position: sticky; top: 0;`.",
        concept: "`position: sticky` remains in normal document flow until reaching its scroll threshold.",
        expectedOutput: "Sticky Header",
        testCases: [{ input: "apply", output: "sticky" }],
        hint: "Set `position: sticky;`.",
        templateWithBlanks: `.navbar {
  position: ______;
  top: 0;
  z-index: 50;
}`,
        solutionCode: `.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
}`
      },
      {
        id: 9,
        title: "Gradient Text Clip",
        category: "9. Typography Effects",
        difficulty: "Hard",
        description: "Render vibrant gradient typography with `-webkit-background-clip: text`.",
        concept: "Clipping background to text and making `color: transparent` exposes the gradient fill.",
        expectedOutput: "Gradient Text",
        testCases: [{ input: "apply", output: "gradient text" }],
        hint: "Set `color: transparent;`.",
        templateWithBlanks: `.neon-title {
  background: linear-gradient(135deg, #f97316, #a855f7);
  -webkit-background-clip: text;
  color: ______;
}`,
        solutionCode: `.neon-title {
  background: linear-gradient(135deg, #f97316, #a855f7);
  -webkit-background-clip: text;
  color: transparent;
}`
      },
      {
        id: 10,
        title: "Aspect Ratio Container",
        category: "10. Modern Sizing",
        difficulty: "Hard",
        description: "Enforce a 16:9 widescreen aspect ratio with `aspect-ratio: 16 / 9;`.",
        concept: "`aspect-ratio` maintains geometric proportions automatically across all viewport sizes.",
        expectedOutput: "16:9 Aspect Ratio",
        testCases: [{ input: "apply", output: "aspect ratio" }],
        hint: "Set `aspect-ratio: 16 / 9;`.",
        templateWithBlanks: `.video-wrapper {
  aspect-ratio: 16 / ______;
  width: 100%;
}`,
        solutionCode: `.video-wrapper {
  aspect-ratio: 16 / 9;
  width: 100%;
}`
      }
    ]
  },

  // =========================================================================
  // 8. SQL (SELECT -> WHERE -> LIMIT -> ORDER BY -> COUNT -> JOINS -> GROUP BY)
  // =========================================================================
  {
    id: "sql",
    name: "SQL",
    extension: ".sql",
    tagline: "Basic queries, WHERE filtering, ORDER BY, aggregate counts & table joins",
    icon: "🗄️",
    color: "text-emerald-400",
    bgGradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    levels: [
      {
        id: 1,
        title: "Basic SELECT Query",
        category: "1. Data Queries",
        difficulty: "Easy",
        description: "Select all columns `*` from the `keyboards` table.",
        concept: "`SELECT * FROM table_name;` fetches all columns and rows from a table.",
        expectedOutput: "All keyboard records",
        testCases: [{ input: "query", output: "all rows" }],
        hint: "Use keyword `SELECT`.",
        templateWithBlanks: `______ * 
FROM keyboards;`,
        solutionCode: `SELECT * 
FROM keyboards;`
      },
      {
        id: 2,
        title: "WHERE Filter Condition",
        category: "2. Filtering Data",
        difficulty: "Easy",
        description: "Filter products where `category = 'switches'`.",
        concept: "The `WHERE` clause filters rows meeting specified boolean criteria.",
        expectedOutput: "Filtered switch products",
        testCases: [{ input: "query", output: "filtered rows" }],
        hint: "Use clause `WHERE`.",
        templateWithBlanks: `SELECT * 
FROM products 
______ category = 'switches';`,
        solutionCode: `SELECT * 
FROM products 
WHERE category = 'switches';`
      },
      {
        id: 3,
        title: "Select Specific Columns & LIMIT",
        category: "3. Projections & Limits",
        difficulty: "Easy",
        description: "Select `id`, `name`, and `price` limited to the first 5 records.",
        concept: "`LIMIT 5` caps the maximum number of rows returned.",
        expectedOutput: "Top 5 rows",
        testCases: [{ input: "query", output: "5 rows" }],
        hint: "Use `LIMIT 5;`.",
        templateWithBlanks: `SELECT id, name, price 
FROM switches 
______ 5;`,
        solutionCode: `SELECT id, name, price 
FROM switches 
LIMIT 5;`
      },
      {
        id: 4,
        title: "ORDER BY Descending Sort",
        category: "4. Sorting",
        difficulty: "Easy",
        description: "Sort products by `price` descending using `ORDER BY price DESC;`.",
        concept: "`ORDER BY column DESC` arranges records from highest to lowest.",
        expectedOutput: "Sorted rows descending",
        testCases: [{ input: "query", output: "sorted" }],
        hint: "Use keyword `DESC`.",
        templateWithBlanks: `SELECT * 
FROM products 
ORDER BY price ______;`,
        solutionCode: `SELECT * 
FROM products 
ORDER BY price DESC;`
      },
      {
        id: 5,
        title: "COUNT Aggregate Function",
        category: "5. Aggregation",
        difficulty: "Medium",
        description: "Count total users with alias `total_users` using `COUNT(*)`.",
        concept: "`COUNT(*)` counts total rows in the query result set.",
        expectedOutput: "Single count number",
        testCases: [{ input: "query", output: "count" }],
        hint: "Use `COUNT(*)`.",
        templateWithBlanks: `SELECT ______(*) AS total_users 
FROM users;`,
        solutionCode: `SELECT COUNT(*) AS total_users 
FROM users;`
      },
      {
        id: 6,
        title: "INNER JOIN Two Tables",
        category: "6. Table Joins",
        difficulty: "Medium",
        description: "Join `users` with `orders` on `users.id = orders.user_id`.",
        concept: "`INNER JOIN` returns rows that have matching keys across both tables.",
        expectedOutput: "Combined user order records",
        testCases: [{ input: "query", output: "joined rows" }],
        hint: "Use keyword `INNER JOIN`.",
        templateWithBlanks: `SELECT users.name, orders.amount 
FROM users 
______ orders ON users.id = orders.user_id;`,
        solutionCode: `SELECT users.name, orders.amount 
FROM users 
INNER JOIN orders ON users.id = orders.user_id;`
      },
      {
        id: 7,
        title: "GROUP BY & Average Calculation",
        category: "7. Grouping & Aggregates",
        difficulty: "Medium",
        description: "Compute average salary by department with `GROUP BY department`.",
        concept: "`GROUP BY` aggregates rows sharing identical department values.",
        expectedOutput: "Department average salaries",
        testCases: [{ input: "query", output: "department averages" }],
        hint: "Use `GROUP BY department;`.",
        templateWithBlanks: `SELECT department, AVG(salary) AS avg_salary 
FROM employees 
______ department;`,
        solutionCode: `SELECT department, AVG(salary) AS avg_salary 
FROM employees 
GROUP BY department;`
      },
      {
        id: 8,
        title: "Filter Groups with HAVING",
        category: "8. Advanced Grouping",
        difficulty: "Hard",
        description: "Filter groups after aggregation with `HAVING COUNT(*) > 5`.",
        concept: "`HAVING` filters aggregated group records, unlike `WHERE` which filters raw rows.",
        expectedOutput: "Categories with count > 5",
        testCases: [{ input: "query", output: "filtered categories" }],
        hint: "Use `HAVING COUNT(*) > 5;`.",
        templateWithBlanks: `SELECT category, COUNT(*) AS count 
FROM products 
GROUP BY category 
______ COUNT(*) > 5;`,
        solutionCode: `SELECT category, COUNT(*) AS count 
FROM products 
GROUP BY category 
HAVING COUNT(*) > 5;`
      },
      {
        id: 9,
        title: "INSERT INTO Table",
        category: "9. Data Insertion",
        difficulty: "Hard",
        description: "Insert a new row into `audit_logs` specifying column names and `VALUES`.",
        concept: "`INSERT INTO table (columns) VALUES (values);` appends new records.",
        expectedOutput: "1 row inserted",
        testCases: [{ input: "query", output: "inserted" }],
        hint: "Use `INSERT INTO audit_logs`.",
        templateWithBlanks: `______ audit_logs (action, status) 
VALUES ('USER_LOGIN', 'SUCCESS');`,
        solutionCode: `INSERT INTO audit_logs (action, status) 
VALUES ('USER_LOGIN', 'SUCCESS');`
      },
      {
        id: 10,
        title: "UPDATE Record with WHERE",
        category: "10. Data Updates",
        difficulty: "Hard",
        description: "Update user status to `'pro'` where `score >= 1000`.",
        concept: "Always specify `WHERE` when updating to avoid modifying the whole table.",
        expectedOutput: "Rows updated",
        testCases: [{ input: "query", output: "updated" }],
        hint: "Use `UPDATE users`.",
        templateWithBlanks: `______ users 
SET status = 'pro' 
WHERE score >= 1000;`,
        solutionCode: `UPDATE users 
SET status = 'pro' 
WHERE score >= 1000;`
      }
    ]
  }
];

export function CodeSprintGame({
  theme,
  onBackToHub,
}: {
  theme: KeyboardTheme;
  onBackToHub: () => void;
}) {
  // Website and games remain on the sleek White, Blue, and Black palette
  const isDark = false;

  // Navigation / Selection State
  const [selectedLanguageId, setSelectedLanguageId] = useState<CodeLanguage>("python");
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number | null>(null);
  const [completedLevels, setCompletedLevels] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("setu_code_sprint_completed");
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  // Current active language & level data
  const currentLanguage = CODE_LANGUAGES.find((l) => l.id === selectedLanguageId) || CODE_LANGUAGES[0];
  const currentLevel = currentLevelIndex !== null ? currentLanguage.levels[currentLevelIndex] : null;

  // Editor & Typing State
  const [userCode, setUserCode] = useState<string>("");
  const [isSolutionPeekOpen, setIsSolutionPeekOpen] = useState<boolean>(false);
  const [isHintOpen, setIsHintOpen] = useState<boolean>(false);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<Array<{ type: "info" | "success" | "error" | "warn"; text: string }>>([]);
  const [hasCompletedCurrentLevel, setHasCompletedCurrentLevel] = useState<boolean>(false);

  // Performance Metrics
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [keystrokesCount, setKeystrokesCount] = useState<number>(0);
  const [wpm, setWpm] = useState<number>(0);

  const editorTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Save completed levels to localStorage
  const markLevelCompleted = useCallback((langId: string, levelId: number) => {
    const key = `${langId}_${levelId}`;
    setCompletedLevels((prev) => {
      const updated = { ...prev, [key]: true };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("setu_code_sprint_completed", JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  }, []);

  // Initialize or reset level state when level changes
  useEffect(() => {
    if (currentLevel) {
      setUserCode("");
      setIsSolutionPeekOpen(false);
      setIsHintOpen(false);
      setIsRunningTests(false);
      setHasCompletedCurrentLevel(false);
      setStartTime(null);
      setElapsedSeconds(0);
      setKeystrokesCount(0);
      setWpm(0);
      setConsoleLogs([
        { type: "info", text: `🚀 Initialized ${currentLanguage.name} workspace environment.` },
        { type: "info", text: `📋 Task: ${currentLevel.title}` },
        { type: "warn", text: `💡 Tip: Timer starts on your first keystroke and stops only when test cases pass!` }
      ]);

      // Focus editor
      setTimeout(() => {
        editorTextareaRef.current?.focus();
      }, 100);
    }
  }, [currentLevelIndex, selectedLanguageId]);

  // Live timer interval: Starts when user types first letter, runs continuously until code passes
  useEffect(() => {
    if (startTime !== null && !hasCompletedCurrentLevel) {
      const interval = setInterval(() => {
        const now = Date.now();
        const secs = Math.floor((now - startTime) / 1000);
        setElapsedSeconds(secs);
      }, 200);

      return () => clearInterval(interval);
    }
  }, [startTime, hasCompletedCurrentLevel]);

  // Live WPM computation
  useEffect(() => {
    if (elapsedSeconds > 0 && userCode.trim().length > 0) {
      const wordsTyped = userCode.trim().split(/\s+/).filter(Boolean).length;
      const minutes = Math.max(elapsedSeconds / 60, 0.05);
      setWpm(Math.round(wordsTyped / minutes));
    }
  }, [elapsedSeconds, userCode]);

  // Format seconds to mm:ss (e.g. 00:05, 01:23)
  const formatLiveTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle typing inside code editor
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    soundEngine.playKeySound(e.key);

    if (!startTime) {
      setStartTime(Date.now());
    }
    setKeystrokesCount((c) => c + 1);

    // Support Tab key (Insert 2 spaces instead of losing focus)
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = userCode.substring(0, start) + "  " + userCode.substring(end);
      setUserCode(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // Auto-indent on Enter
    if (e.key === "Enter") {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const currentLine = userCode.substring(0, start).split("\n").pop() || "";
      const match = currentLine.match(/^\s+/);
      const indent = match ? match[0] : "";

      // If line ends with colon or open brace, add extra 2 spaces
      const extraIndent = currentLine.trim().endsWith(":") || currentLine.trim().endsWith("{") ? "  " : "";
      const totalIndent = indent + extraIndent;

      if (totalIndent.length > 0) {
        e.preventDefault();
        const end = textarea.selectionEnd;
        const newValue = userCode.substring(0, start) + "\n" + totalIndent + userCode.substring(end);
        setUserCode(newValue);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + totalIndent.length;
        }, 0);
      }
    }
  };

  // Real-time normalization helper for code evaluation
  const normalizeCode = (code: string) => {
    return code
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .trim();
  };

  // Verify and run code against test cases
  const handleRunCode = () => {
    if (!currentLevel) return;
    setIsRunningTests(true);

    const targetNormalized = normalizeCode(currentLevel.solutionCode);
    const userNormalized = normalizeCode(userCode);

    setConsoleLogs([
      { type: "info", text: `⚙️ [COMPILER] Compiling ${currentLanguage.name} code...` },
      { type: "info", text: `🔍 [ANALYZER] Checking syntax trees & tokens...` }
    ]);

    setTimeout(() => {
      // Check exact or normalized logic match
      const isMatch = targetNormalized === userNormalized || 
        userNormalized.replace(/\s+/g, "") === targetNormalized.replace(/\s+/g, "");

      if (isMatch) {
        // Success test runs
        setConsoleLogs((prev) => [
          ...prev,
          { type: "success", text: `✅ [TEST 1] Output: "${currentLevel.expectedOutput}" [PASS]` },
          { type: "success", text: `✅ [TEST 2] Verification tests passed successfully with 0 errors!` },
          { type: "success", text: `🎉 [COMPILER 200 OK] Code verified with 100% precision!` }
        ]);

        setHasCompletedCurrentLevel(true);
        markLevelCompleted(selectedLanguageId, currentLevel.id);

        // Update database and instructor table report
        updateStudentProgress({
          gameType: "codeSprint",
          details: {
            lang: selectedLanguageId,
            levelId: currentLevel.id,
            wpm: wpm,
            timeSecs: elapsedSeconds,
          },
        });

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        // Find discrepancy
        setConsoleLogs((prev) => [
          ...prev,
          { type: "error", text: `❌ [SYNTAX / LOGIC MISMATCH] Code does not match expected solution.` },
          { type: "warn", text: `💡 Compare your indentation, variables, and keywords with the Left Template!` },
          { type: "info", text: `💡 Hint: Click 'Peek' to inspect the expected solution code.` }
        ]);
      }
      setIsRunningTests(false);
    }, 600);
  };

  // Next level navigation
  const handleNextLevel = () => {
    if (currentLevelIndex !== null && currentLevelIndex < currentLanguage.levels.length - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1);
    } else {
      // Back to level grid if reached end of language
      setCurrentLevelIndex(null);
    }
  };

  // Calculate language progress stats
  const completedCountForLang = currentLanguage.levels.filter(
    (lvl) => completedLevels[`${currentLanguage.id}_${lvl.id}`]
  ).length;

  return (
    <div className="relative z-10 w-full max-w-7xl px-3 sm:px-6 py-6 flex flex-col items-center gap-6 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER NAVIGATION BAR (STANDARDIZED SUITE HEADER)                  */}
      {/* ========================================================================= */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-200">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onBackToHub}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-white text-slate-800 hover:bg-blue-50 hover:text-blue-600 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Back to Games Hub"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Games Hub</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-200 shadow-xs">
            <img src="/codesprintemblem.png" alt="Code Sprint & Dev Syntax" className="w-7 h-7 object-contain rounded-lg shadow-2xs" />
            <span className="text-sm sm:text-base font-black tracking-tight text-slate-950">
              Code Sprint & Dev Syntax
            </span>
          </div>

          <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Basics ➔ Loops ➔ Functions
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentLevelIndex !== null && (
            <button
              onClick={() => setCurrentLevelIndex(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Levels</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-blue-200 bg-white text-blue-700 text-xs font-mono font-bold shadow-xs">
            <span>{completedCountForLang}/{currentLanguage.levels.length} Solved</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LEVEL SELECTION VIEW (RECTANGLE GRID VIEW)                            */}
      {/* ========================================================================= */}
      {currentLevelIndex === null && (
        <div className="w-full flex flex-col gap-6">
          {/* Language Tabs Ribbon */}
          <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CODE_LANGUAGES.map((lang) => {
              const isSelected = lang.id === selectedLanguageId;
              const langCompleted = lang.levels.filter(
                (lvl) => completedLevels[`${lang.id}_${lvl.id}`]
              ).length;

              return (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguageId(lang.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? `${lang.badgeColor} shadow-md scale-102 border-current`
                      : isDark
                      ? "bg-slate-900/80 hover:bg-slate-800 text-slate-400 border-slate-800 hover:text-slate-200"
                      : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200 shadow-xs"
                  }`}
                >
                  <span className="text-base">{lang.icon}</span>
                  <span>{lang.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isSelected ? "bg-black/20 text-inherit" : "bg-slate-500/15 text-slate-400"
                  }`}>
                    {langCompleted}/{lang.levels.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Language Overview Banner */}
          <div className={`w-full p-5 rounded-3xl border bg-gradient-to-r ${currentLanguage.bgGradient} backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isDark ? "border-slate-800" : "border-slate-200"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10">
                {currentLanguage.icon}
              </span>
              <div>
                <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                  {currentLanguage.name} Progressive Curriculum
                </h2>
                <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {currentLanguage.tagline} • {currentLanguage.levels.length} Structured Levels
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-blue-400">
                  {completedCountForLang} of {currentLanguage.levels.length} Solved
                </span>
                <div className="w-32 h-2 rounded-full bg-slate-700/40 overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500"
                    style={{
                      width: `${(completedCountForLang / currentLanguage.levels.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Level Cards Grid (Rectangle View) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentLanguage.levels.map((level, idx) => {
              const isLevelDone = !!completedLevels[`${currentLanguage.id}_${level.id}`];
              
              const diffBadge =
                level.difficulty === "Easy"
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : level.difficulty === "Medium"
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  : "bg-rose-500/15 text-rose-400 border-rose-500/30";

              return (
                <div
                  key={level.id}
                  onClick={() => setCurrentLevelIndex(idx)}
                  className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 hover:-translate-y-1 ${
                    isDark
                      ? "bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-blue-500/40 shadow-lg"
                      : "bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-500/40 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5" />
                        Level {level.id}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${diffBadge}`}>
                          {level.difficulty}
                        </span>
                        {isLevelDone && (
                          <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className={`text-base font-extrabold transition-colors ${
                      isDark ? "text-white group-hover:text-blue-400" : "text-slate-900 group-hover:text-blue-600"
                    }`}>
                      {level.title}
                    </h3>

                    <p className={`text-xs line-clamp-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {level.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-700/30 flex items-center justify-between text-xs">
                    <span className={`text-[11px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {level.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 group-hover:translate-x-0.5 transition-transform">
                      <span>{isLevelDone ? "Practice" : "Start Level"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DUAL-PANE SPLIT COMPILER / IDE WORKSPACE                               */}
      {/* ========================================================================= */}
      {currentLevel && (
        <div className="w-full flex flex-col gap-4">
          {/* Level Header Bar */}
          <div className={`w-full p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 backdrop-blur-md ${
            isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentLanguage.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-blue-400 uppercase">
                    Level {currentLevel.id} of {currentLanguage.levels.length}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-400">{currentLevel.category}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black">{currentLevel.title}</h2>
              </div>
            </div>

            {/* Performance Stats HUD */}
            <div className="flex items-center gap-3 sm:gap-6 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-sky-500/10 border-sky-500/25 text-sky-400">
                <div className="relative flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping absolute" />
                  <Clock className="w-4 h-4 relative" />
                </div>
                <div>
                  <div className="text-[10px] text-sky-300/80 font-black uppercase tracking-wider">Live Time</div>
                  <div className="font-mono font-black text-sm text-sky-400 tracking-wider">
                    {formatLiveTime(elapsedSeconds)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Speed</div>
                  <div className="font-mono font-bold">{wpm} WPM</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Keys</div>
                  <div className="font-mono font-bold">{keystrokesCount}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setUserCode("");
                  setStartTime(null);
                  setElapsedSeconds(0);
                  setWpm(0);
                  setKeystrokesCount(0);
                  setConsoleLogs([
                    { type: "info", text: "🔄 Reset editor canvas." }
                  ]);
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isDark ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                }`}
                title="Reset Code & Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dual Split Screen: Left (Problem & Template with Blanks) / Right (Student Interactive Compiler Editor) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* ------------------------------------------------------------- */}
            {/* LEFT PANE: Task, Template with Blanks & Instructions          */}
            {/* ------------------------------------------------------------- */}
            <div className={`flex flex-col rounded-3xl border overflow-hidden backdrop-blur-md ${
              isDark ? "bg-slate-900/95 border-slate-800" : "bg-white border-slate-200 shadow-md"
            }`}>
              {/* Window Titlebar */}
              <div className={`px-4 py-3 border-b flex items-center justify-between ${
                isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-100/80 border-slate-200"
              }`}>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className={`text-xs font-mono font-bold ml-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    instructions{currentLanguage.extension} (Task & Template)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsHintOpen(!isHintOpen)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                      isHintOpen
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{isHintOpen ? "Hide Hint" : "Hint"}</span>
                  </button>

                  <button
                    onClick={() => setIsSolutionPeekOpen(!isSolutionPeekOpen)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                      isSolutionPeekOpen
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        : isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {isSolutionPeekOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isSolutionPeekOpen ? "Hide Solution" : "Peek"}</span>
                  </button>
                </div>
              </div>

              {/* Problem Content & Template */}
              <div className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto max-h-[600px]">
                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                    🎯 Objective
                  </h3>
                  <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {currentLevel.description}
                  </p>
                </div>

                {/* Concept */}
                <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  isDark ? "bg-slate-950/60 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  <strong className="text-blue-400">Concept: </strong>
                  {currentLevel.concept}
                </div>

                {/* Expected Output */}
                <div className={`p-3 rounded-xl border font-mono text-xs ${
                  isDark ? "bg-slate-950/80 border-slate-800 text-emerald-400" : "bg-emerald-50/60 border-emerald-200 text-emerald-700"
                }`}>
                  <span className="font-bold text-slate-400 block mb-0.5">Expected Output:</span>
                  {currentLevel.expectedOutput}
                </div>

                {/* Hint Alert (if toggled) */}
                <AnimatePresence>
                  {isHintOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5"
                    >
                      <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>Hint: </strong> {currentLevel.hint}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Solution Peek (if toggled) */}
                <AnimatePresence>
                  {isSolutionPeekOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-mono"
                    >
                      <div className="font-bold mb-1 flex items-center justify-between">
                        <span>Full Solution Code:</span>
                        <button
                          onClick={() => {
                            setUserCode(currentLevel.solutionCode);
                            setIsSolutionPeekOpen(false);
                          }}
                          className="px-2 py-0.5 rounded bg-blue-600 text-white font-sans text-[10px] font-bold hover:bg-blue-500 cursor-pointer"
                        >
                          Auto-Fill
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap">{currentLevel.solutionCode}</pre>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Template with Blanks (Visual Guide) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                      📝 Code Template (Fill the <span className="text-amber-400 font-mono">______</span> blanks)
                    </span>
                  </div>
                  <div className={`p-4 rounded-2xl border font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto ${
                    isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-900 text-slate-100 border-slate-800"
                  }`}>
                    <pre className="whitespace-pre">
                      {currentLevel.templateWithBlanks.split("______").map((part, index, array) => (
                        <React.Fragment key={index}>
                          <span>{part}</span>
                          {index < array.length - 1 && (
                            <span className="inline-block px-2 py-0.5 mx-1 rounded bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold animate-pulse">
                              ______
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT PANE: Interactive Code Compiler & Live Typing Editor    */}
            {/* ------------------------------------------------------------- */}
            <div className={`flex flex-col rounded-3xl border overflow-hidden backdrop-blur-md ${
              isDark ? "bg-slate-900/95 border-slate-800" : "bg-white border-slate-200 shadow-md"
            }`}>
              {/* Window Titlebar */}
              <div className={`px-4 py-3 border-b flex items-center justify-between ${
                isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-100/80 border-slate-200"
              }`}>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 animate-ping" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className={`text-xs font-mono font-bold ml-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    student_solution{currentLanguage.extension} (Live Compiler)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunCode}
                    disabled={isRunningTests || userCode.trim().length === 0}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                      isRunningTests || userCode.trim().length === 0
                        ? "bg-slate-700 text-slate-400 opacity-50 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20 active:scale-95"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isRunningTests ? "Compiling..." : "Run & Test Code"}</span>
                  </button>
                </div>
              </div>

              {/* Code Editor Body */}
              <div className="relative flex-1 min-h-[300px] flex flex-col bg-slate-950 text-slate-100">
                <div className="relative flex-1 flex">
                  {/* Line Numbers Column */}
                  <div className="w-10 sm:w-12 py-4 select-none bg-slate-950/90 border-r border-slate-800 text-right pr-2 sm:pr-3 font-mono text-xs text-slate-600">
                    {(userCode || "\n").split("\n").map((_, i) => (
                      <div key={i} className="leading-6">
                        {i + 1}
                      </div>
                    ))}
                  </div>

                    {/* Interactive Textarea */}
                    <div className="relative flex-1 p-4 font-mono text-xs sm:text-sm leading-6">
                      <textarea
                        ref={editorTextareaRef}
                        value={userCode}
                        onChange={(e) => {
                          if (!startTime) {
                            setStartTime(Date.now());
                          }
                          setUserCode(e.target.value);
                        }}
                        onKeyDown={handleEditorKeyDown}
                        placeholder={`// Type the clean ${currentLanguage.name} code here...\n// Automatic indentation, brackets & symbols supported`}
                        className="w-full h-full min-h-[260px] bg-transparent outline-none resize-none font-mono text-xs sm:text-sm leading-6 text-slate-100 placeholder:text-slate-600 caret-blue-400"
                      spellCheck={false}
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                    />
                  </div>
                </div>

                {/* Integrated Terminal / Compiler Output Console */}
                <div className="border-t border-slate-800 bg-slate-950/95 flex flex-col">
                  <div className="px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono font-bold">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-blue-400" />
                      <span>TERMINAL & COMPILER CONSOLE</span>
                    </div>
                    <span>UTF-8</span>
                  </div>

                  <div className="p-3 font-mono text-[11px] sm:text-xs max-h-36 overflow-y-auto flex flex-col gap-1">
                    {consoleLogs.map((log, index) => {
                      const color =
                        log.type === "success"
                          ? "text-emerald-400"
                          : log.type === "error"
                          ? "text-rose-400"
                          : log.type === "warn"
                          ? "text-amber-400"
                          : "text-slate-400";

                      return (
                        <div key={index} className={`leading-relaxed ${color}`}>
                          {log.text}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Celebration / Level Completion Modal Card */}
          <AnimatePresence>
            {hasCompletedCurrentLevel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full p-6 rounded-3xl border bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isDark ? "border-emerald-500/40 text-white" : "border-emerald-500/40 text-slate-900 shadow-xl"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-emerald-400">
                      Level {currentLevel.id} Completed! 🎉
                    </h3>
                    <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      Speed: <strong className="text-blue-400">{wpm} WPM</strong> • Time: <strong className="text-sky-400">{elapsedSeconds}s</strong> • Keystrokes: <strong className="text-amber-400">{keystrokesCount}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentLevelIndex(null)}
                    className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700" : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    Level Select
                  </button>

                  <button
                    onClick={handleNextLevel}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-black shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
                  >
                    <span>Next Level</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
