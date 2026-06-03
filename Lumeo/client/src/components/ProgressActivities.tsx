import { useState } from 'react';
import { ChevronDown, CheckCircle2, Circle, Zap, Award, Target, BookOpen } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  steps: ActivityStep[];
  reward: number;
  completed: boolean;
  icon: React.ReactNode;
}

interface ActivityStep {
  id: string;
  title: string;
  description: string;
  tips: string[];
  completed: boolean;
}

interface ProgressActivitiesProps {
  goalId: string;
}

const activitiesByGoal: { [key: string]: Activity[] } = {
  coding: [
    {
      id: 'algo-challenge-1',
      title: 'Algorithm Challenge: Two Sum',
      description: 'Solve the classic two-sum problem using multiple approaches',
      difficulty: 'beginner',
      icon: <Target className="w-5 h-5" />,
      reward: 50,
      completed: false,
      steps: [
        {
          id: 'step-1',
          title: 'Understand the Problem',
          description: 'Read and understand the problem statement thoroughly',
          tips: [
            'Given an array of integers and a target, find two numbers that add up to target',
            'Return the indices of the two numbers',
            'You may not use the same element twice',
          ],
          completed: false,
        },
        {
          id: 'step-2',
          title: 'Brute Force Approach',
          description: 'Implement the brute force O(n²) solution first',
          tips: [
            'Use nested loops to check all pairs',
            'This helps you understand the problem better',
            'Write clean, readable code with comments',
          ],
          completed: false,
        },
        {
          id: 'step-3',
          title: 'Optimize with Hash Map',
          description: 'Implement the O(n) solution using a hash map',
          tips: [
            'Store visited numbers in a hash map',
            'For each number, check if (target - number) exists in the map',
            'This reduces time complexity significantly',
          ],
          completed: false,
        },
        {
          id: 'step-4',
          title: 'Test & Debug',
          description: 'Test your solution with various test cases',
          tips: [
            'Test with edge cases (empty array, single element)',
            'Test with negative numbers',
            'Test with duplicate values',
          ],
          completed: false,
        },
      ],
    },
    {
      id: 'project-1',
      title: 'Build a CLI Calculator',
      description: 'Create a command-line calculator with advanced operations',
      difficulty: 'intermediate',
      icon: <Zap className="w-5 h-5" />,
      reward: 100,
      completed: false,
      steps: [
        {
          id: 'step-1',
          title: 'Setup Project Structure',
          description: 'Create project files and organize your code',
          tips: [
            'Create main.cpp, calculator.h, calculator.cpp',
            'Use header guards to prevent multiple inclusions',
            'Plan your class structure before coding',
          ],
          completed: false,
        },
        {
          id: 'step-2',
          title: 'Implement Basic Operations',
          description: 'Add, subtract, multiply, divide operations',
          tips: [
            'Create separate functions for each operation',
            'Handle division by zero',
            'Add input validation',
          ],
          completed: false,
        },
        {
          id: 'step-3',
          title: 'Add Advanced Features',
          description: 'Implement power, square root, factorial',
          tips: [
            'Use cmath library for mathematical functions',
            'Handle edge cases for each operation',
            'Add error handling',
          ],
          completed: false,
        },
        {
          id: 'step-4',
          title: 'Create User Interface',
          description: 'Build an interactive command-line interface',
          tips: [
            'Display a menu of available operations',
            'Accept user input gracefully',
            'Show results clearly',
          ],
          completed: false,
        },
        {
          id: 'step-5',
          title: 'Testing & Documentation',
          description: 'Test thoroughly and document your code',
          tips: [
            'Write unit tests for each function',
            'Add comments explaining complex logic',
            'Create a README with usage instructions',
          ],
          completed: false,
        },
      ],
    },
    {
      id: 'deep-dive-1',
      title: 'Deep Dive: Memory Management',
      description: 'Master pointers, dynamic allocation, and memory leaks',
      difficulty: 'advanced',
      icon: <BookOpen className="w-5 h-5" />,
      reward: 150,
      completed: false,
      steps: [
        {
          id: 'step-1',
          title: 'Understand Pointers',
          description: 'Learn pointer basics and address-of operator',
          tips: [
            'Understand the & (address-of) operator',
            'Understand the * (dereference) operator',
            'Practice with simple pointer exercises',
          ],
          completed: false,
        },
        {
          id: 'step-2',
          title: 'Dynamic Memory Allocation',
          description: 'Learn new, delete, and memory management',
          tips: [
            'Use new to allocate memory on the heap',
            'Always delete what you new',
            'Understand stack vs heap memory',
          ],
          completed: false,
        },
        {
          id: 'step-3',
          title: 'Detect Memory Leaks',
          description: 'Use tools to find and fix memory leaks',
          tips: [
            'Use Valgrind on Linux to detect leaks',
            'Use Dr. Memory on Windows',
            'Learn to read memory profiler output',
          ],
          completed: false,
        },
        {
          id: 'step-4',
          title: 'Smart Pointers',
          description: 'Learn about unique_ptr and shared_ptr',
          tips: [
            'Use smart pointers to avoid manual memory management',
            'Understand RAII principle',
            'Know when to use unique_ptr vs shared_ptr',
          ],
          completed: false,
        },
      ],
    },
    {
      id: 'data-structures-1',
      title: 'Master Data Structures',
      description: 'Build and understand fundamental data structures',
      difficulty: 'intermediate',
      icon: <Target className="w-5 h-5" />,
      reward: 120,
      completed: false,
      steps: [
        {
          id: 'step-1',
          title: 'Implement Linked List',
          description: 'Build a singly linked list from scratch',
          tips: [
            'Create Node structure with data and next pointer',
            'Implement insert, delete, search operations',
            'Handle edge cases like empty list',
          ],
          completed: false,
        },
        {
          id: 'step-2',
          title: 'Build Binary Search Tree',
          description: 'Implement BST with insertion and traversal',
          tips: [
            'Maintain BST property: left < parent < right',
            'Implement in-order, pre-order, post-order traversal',
            'Handle tree balancing basics',
          ],
          completed: false,
        },
        {
          id: 'step-3',
          title: 'Create Hash Table',
          description: 'Build a hash table with collision handling',
          tips: [
            'Choose appropriate hash function',
            'Implement chaining or open addressing',
            'Optimize for load factor',
          ],
          completed: false,
        },
        {
          id: 'step-4',
          title: 'Implement Graph Algorithms',
          description: 'Build BFS and DFS algorithms',
          tips: [
            'Represent graphs using adjacency list/matrix',
            'Implement breadth-first search',
            'Implement depth-first search',
          ],
          completed: false,
        },
      ],
    },
  ],
  japanese: [
    {
      id: 'kanji-sprint',
      title: 'Kanji Sprint: 100 Characters',
      description: 'Learn 100 essential kanji characters with context',
      difficulty: 'beginner',
      icon: <Target className="w-5 h-5" />,
      reward: 75,
      completed: false,
      steps: [
        {
          id: 'step-1',
          title: 'Learn Radicals',
          description: 'Master the building blocks of kanji',
          tips: [
            'Radicals are the components of kanji characters',
            'Learn the 214 main radicals',
            'Understand how radicals relate to meaning',
          ],
          completed: false,
        },
        {
          id: 'step-2',
          title: 'Study First 50 Kanji',
          description: 'Focus on most common kanji characters',
          tips: [
            'Use mnemonic stories to remember characters',
            'Write each character 10 times',
            'Learn both on\'yomi and kun\'yomi readings',
          ],
          completed: false,
        },
        {
          id: 'step-3',
          title: 'Practice Writing',
          description: 'Write kanji from memory repeatedly',
          tips: [
            'Use stroke order correctly',
            'Practice 5-10 minutes daily',
            'Use apps like Kanji Study',
          ],
          completed: false,
        },
        {
          id: 'step-4',
          title: 'Use in Context',
          description: 'Learn kanji in real sentences',
          tips: [
            'Read simple Japanese texts',
            'Create flashcards with example sentences',
            'Practice reading comprehension',
          ],
          completed: false,
        },
      ],
    },
    {
      id: 'conversation-1',
      title: 'Master Daily Conversations',
      description: 'Build conversational fluency for everyday situations',
      difficulty: 'intermediate',
      icon: <Zap className="w-5 h-5" />,
      reward: 100,
      completed: false,
      steps: [
        {
          id: 'step-1',
          title: 'Learn Greetings & Introductions',
          description: 'Master basic social interactions',
          tips: [
            'おはようございます (ohayou gozaimasu) - Good morning',
            'こんにちは (konnichiwa) - Hello',
            'はじめまして (hajimemashite) - Nice to meet you',
          ],
          completed: false,
        },
        {
          id: 'step-2',
          title: 'Restaurant & Food Vocabulary',
          description: 'Order food and discuss dining',
          tips: [
            'Learn food names and preferences',
            'Practice ordering politely',
            'Understand menu descriptions',
          ],
          completed: false,
        },
        {
          id: 'step-3',
          title: 'Travel & Directions',
          description: 'Navigate and ask for directions',
          tips: [
            'Learn location words (near, far, left, right)',
            'Practice asking for directions',
            'Understand transportation vocabulary',
          ],
          completed: false,
        },
        {
          id: 'step-4',
          title: 'Role Play Scenarios',
          description: 'Practice real conversations',
          tips: [
            'Record yourself speaking',
            'Practice with language exchange partners',
            'Repeat until natural',
          ],
          completed: false,
        },
      ],
    },
  ],
  discipline: [
    {
      id: 'habit-tracker',
      title: 'Build a Daily Habit',
      description: 'Establish a consistent 30-day habit',
      difficulty: 'beginner',
      icon: <Target className="w-5 h-5" />,
      reward: 60,
      completed: false,
      steps: [
        {
          id: 'step-1',
          title: 'Define Your Habit',
          description: 'Choose a specific, measurable habit',
          tips: [
            'Make it specific (not "exercise", but "run 5km")',
            'Make it achievable in 30 days',
            'Write it down clearly',
          ],
          completed: false,
        },
        {
          id: 'step-2',
          title: 'Create a Trigger',
          description: 'Link your habit to an existing routine',
          tips: [
            'Use habit stacking: "After [current habit], I will [new habit]"',
            'Set a specific time each day',
            'Put a reminder on your phone',
          ],
          completed: false,
        },
        {
          id: 'step-3',
          title: 'Track Daily Progress',
          description: 'Mark each day you complete the habit',
          tips: [
            'Use a calendar or habit tracker app',
            'Never break the chain',
            'Celebrate small wins',
          ],
          completed: false,
        },
        {
          id: 'step-4',
          title: 'Overcome Obstacles',
          description: 'Plan for challenges and setbacks',
          tips: [
            'Identify potential obstacles in advance',
            'Have a backup plan for missed days',
            'Reflect on what\'s working and what\'s not',
          ],
          completed: false,
        },
      ],
    },
    {
      id: 'morning-routine',
      title: 'Design an Optimal Morning Routine',
      description: 'Create a productive morning that sets your day up for success',
      difficulty: 'intermediate',
      icon: <Zap className="w-5 h-5" />,
      reward: 90,
      completed: false,
      steps: [
        {
          id: 'step-1',
          title: 'Plan Your Wake-up Time',
          description: 'Establish a consistent wake-up schedule',
          tips: [
            'Choose a time that gives you 1-2 hours before obligations',
            'Stick to it even on weekends',
            'Place alarm across the room to force you up',
          ],
          completed: false,
        },
        {
          id: 'step-2',
          title: 'Add Physical Activity',
          description: 'Include exercise in your morning',
          tips: [
            'Start with 10-15 minutes of stretching or yoga',
            'Gradually increase to 30 minutes',
            'Exercise boosts energy and focus',
          ],
          completed: false,
        },
        {
          id: 'step-3',
          title: 'Healthy Breakfast & Hydration',
          description: 'Fuel your body properly',
          tips: [
            'Drink water immediately after waking',
            'Eat protein-rich breakfast within 1 hour',
            'Avoid sugar and processed foods',
          ],
          completed: false,
        },
        {
          id: 'step-4',
          title: 'Plan Your Day',
          description: 'Set intentions and priorities',
          tips: [
            'Review your top 3 priorities',
            'Block time for deep work',
            'Identify potential distractions',
          ],
          completed: false,
        },
      ],
    },
  ],
  calculus: [
    {
      id: 'limit-mastery',
      title: 'Master Limits',
      description: 'Deep understanding of limits and continuity',
      difficulty: 'intermediate',
      icon: <BookOpen className="w-5 h-5" />,
      reward: 120,
      completed: false,
      steps: [
        {
          id: 'step-1',
          title: 'Intuitive Understanding',
          description: 'Understand limits conceptually',
          tips: [
            'Visualize limits graphically',
            'Understand left and right limits',
            'Learn the epsilon-delta definition',
          ],
          completed: false,
        },
        {
          id: 'step-2',
          title: 'Limit Laws',
          description: 'Learn and apply limit laws',
          tips: [
            'Sum, product, quotient rules',
            'Power rule for limits',
            'Squeeze theorem',
          ],
          completed: false,
        },
        {
          id: 'step-3',
          title: 'Solve Problems',
          description: 'Practice limit calculations',
          tips: [
            'Factor and cancel technique',
            'Rationalization method',
            'L\'Hôpital\'s rule',
          ],
          completed: false,
        },
        {
          id: 'step-4',
          title: 'Continuity',
          description: 'Understand continuity and discontinuities',
          tips: [
            'Types of discontinuities',
            'Intermediate Value Theorem',
            'Extreme Value Theorem',
          ],
          completed: false,
        },
      ],
    },
    {
      id: 'derivative-mastery',
      title: 'Master Derivatives',
      description: 'Understand derivatives and their applications',
      difficulty: 'advanced',
      icon: <Target className="w-5 h-5" />,
      reward: 150,
      completed: false,
      steps: [
        {
          id: 'step-1',
          title: 'Derivative Definition',
          description: 'Understand the limit definition of derivative',
          tips: [
            'f\'(x) = lim(h→0) [f(x+h) - f(x)] / h',
            'Geometric interpretation: slope of tangent line',
            'Practice computing derivatives from definition',
          ],
          completed: false,
        },
        {
          id: 'step-2',
          title: 'Derivative Rules',
          description: 'Learn power, product, quotient, chain rules',
          tips: [
            'Power rule: d/dx(x^n) = nx^(n-1)',
            'Product rule: (fg)\' = f\'g + fg\'',
            'Chain rule: (f∘g)\' = f\'(g) · g\'',
          ],
          completed: false,
        },
        {
          id: 'step-3',
          title: 'Applications: Optimization',
          description: 'Find maxima and minima',
          tips: [
            'Find critical points where f\'(x) = 0',
            'Use second derivative test',
            'Solve real-world optimization problems',
          ],
          completed: false,
        },
        {
          id: 'step-4',
          title: 'Applications: Related Rates',
          description: 'Solve related rates problems',
          tips: [
            'Identify all variables and rates',
            'Write equation relating variables',
            'Differentiate implicitly with respect to time',
          ],
          completed: false,
        },
      ],
    },
  ],
};

export default function ProgressActivities({ goalId }: ProgressActivitiesProps) {
  const activities = activitiesByGoal[goalId] || [];
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<{ [key: string]: boolean }>({});

  const toggleStep = (activityId: string, stepId: string) => {
    const key = `${activityId}-${stepId}`;
    setCompletedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'expert':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">Learning Activities</h3>
      </div>

      {activities.length === 0 ? (
        <div className="mission-card rounded-lg p-6 text-center">
          <p className="text-white/60">No activities available for this goal yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="mission-card rounded-lg overflow-hidden">
              <button
                onClick={() =>
                  setExpandedActivity(
                    expandedActivity === activity.id ? null : activity.id
                  )
                }
                className="w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-smooth"
              >
                <div className="flex-shrink-0 mt-1">{activity.icon}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">{activity.title}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(
                        activity.difficulty
                      )}`}
                    >
                      {activity.difficulty.charAt(0).toUpperCase() +
                        activity.difficulty.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mb-2">{activity.description}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-primary font-semibold">
                      +{activity.reward} XP
                    </span>
                    <span className="text-white/40">
                      {activity.steps.length} steps
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-white/40 transition-transform ${
                    expandedActivity === activity.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedActivity === activity.id && (
                <div className="border-t border-white/10 p-4 space-y-3">
                  {activity.steps.map((step, stepIdx) => {
                    const stepKey = `${activity.id}-${step.id}`;
                    const isCompleted = completedSteps[stepKey] || false;

                    return (
                      <div key={step.id} className="space-y-2">
                        <button
                          onClick={() => toggleStep(activity.id, step.id)}
                          className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-smooth text-left"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-5 h-5 text-white/30 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h5
                              className={`font-medium text-sm ${
                                isCompleted
                                  ? 'text-white/60 line-through'
                                  : 'text-white'
                              }`}
                            >
                              Step {stepIdx + 1}: {step.title}
                            </h5>
                            <p className="text-xs text-white/50 mt-1">
                              {step.description}
                            </p>
                          </div>
                        </button>

                        {/* Tips */}
                        <div className="ml-8 space-y-1 text-xs">
                          {step.tips.map((tip, tipIdx) => (
                            <div
                              key={tipIdx}
                              className="flex gap-2 text-white/60 p-2 rounded bg-white/5"
                            >
                              <span className="text-primary flex-shrink-0">💡</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Complete Activity Button */}
                  <button className="w-full mt-4 px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-smooth text-sm font-medium">
                    Mark Activity as Complete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
