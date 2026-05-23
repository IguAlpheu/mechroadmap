import { Star, TrendingUp, BookOpen, Code } from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  type: 'course' | 'book' | 'tool' | 'community';
  reason: string;
  relevance: number;
  url: string;
  icon: React.ReactNode;
}

function generateRecommendations(goalId: string, progress: number): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Base recommendations by goal
  const baseRecs: Record<string, Recommendation[]> = {
    coding: [
      {
        id: '1',
        title: 'LeetCode Premium',
        type: 'tool',
        reason: 'Practice competitive programming for microcontroller optimization',
        relevance: 95,
        url: 'https://leetcode.com',
        icon: <Code className="w-4 h-4" />,
      },
      {
        id: '2',
        title: 'C++ Reference',
        type: 'book',
        reason: 'Deep dive into modern C++ features for embedded systems',
        relevance: 90,
        url: 'https://cppreference.com',
        icon: <BookOpen className="w-4 h-4" />,
      },
      {
        id: '3',
        title: 'Arduino Community',
        type: 'community',
        reason: 'Connect with embedded systems developers',
        relevance: 85,
        url: 'https://arduino.cc/forum',
        icon: <Star className="w-4 h-4" />,
      },
    ],
    japanese: [
      {
        id: '1',
        title: 'Anki Deck',
        type: 'tool',
        reason: 'Spaced repetition for kanji mastery',
        relevance: 98,
        url: 'https://ankiweb.net',
        icon: <Code className="w-4 h-4" />,
      },
      {
        id: '2',
        title: 'NHK World Easy Japanese',
        type: 'course',
        reason: 'Structured lessons for conversational fluency',
        relevance: 92,
        url: 'https://nhkworld.com',
        icon: <BookOpen className="w-4 h-4" />,
      },
    ],
    calculus: [
      {
        id: '1',
        title: '3Blue1Brown Calculus',
        type: 'course',
        reason: 'Visual intuition for advanced calculus concepts',
        relevance: 97,
        url: 'https://3blue1brown.com',
        icon: <BookOpen className="w-4 h-4" />,
      },
      {
        id: '2',
        title: 'Wolfram Alpha',
        type: 'tool',
        reason: 'Verify complex calculations and explore solutions',
        relevance: 88,
        url: 'https://wolframalpha.com',
        icon: <Code className="w-4 h-4" />,
      },
    ],
  };
  
  const recs = baseRecs[goalId] || [];
  
  // Adjust relevance based on progress
  return recs.map((rec) => ({
    ...rec,
    relevance: Math.min(100, rec.relevance + (progress > 50 ? 5 : 0)),
  }));
}

export default function ResourceRecommendations({ goalId, progress }: { goalId: string; progress: number }) {
  const recommendations = generateRecommendations(goalId, progress);
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'book':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'tool':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      case 'community':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-primary/20 text-primary border-primary/50';
    }
  };
  
  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  const getRelevanceBar = (relevance: number) => {
    if (relevance >= 95) return 'w-full bg-green-500';
    if (relevance >= 85) return 'w-5/6 bg-cyan-500';
    if (relevance >= 75) return 'w-4/5 bg-blue-500';
    return 'w-3/4 bg-yellow-500';
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          Recommended Resources
        </h3>
        <span className="text-xs text-white/50">Based on your progress</span>
      </div>
      
      <div className="space-y-3">
        {recommendations.length > 0 ? (
          recommendations.map((rec) => (
            <a
              key={rec.id}
              href={rec.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mission-card rounded-lg p-4 hover:border-primary/50 transition-smooth group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-primary mt-1">{rec.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white group-hover:text-primary transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-white/60 mt-1">{rec.reason}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getTypeColor(rec.type)}`}>
                  {getTypeLabel(rec.type)}
                </span>
              </div>
              
              {/* Relevance Bar */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50 w-12">Relevance</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full transition-all ${getRelevanceBar(rec.relevance)}`} />
                </div>
                <span className="text-xs text-white/50 w-8 text-right">{rec.relevance}%</span>
              </div>
            </a>
          ))
        ) : (
          <div className="mission-card rounded-lg p-4 text-center">
            <p className="text-sm text-white/60">No recommendations available yet</p>
          </div>
        )}
      </div>
      
      <div className="mission-card rounded-lg p-4 bg-primary/5 border border-primary/20">
        <p className="text-xs text-white/70">
          💡 <strong>Tip:</strong> Resources are personalized based on your progress and learning style. 
          Check back regularly for new recommendations.
        </p>
      </div>
    </div>
  );
}
