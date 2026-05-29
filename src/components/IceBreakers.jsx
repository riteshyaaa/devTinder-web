import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * IceBreakers — AI-powered conversation starters based on shared context.
 *
 * Uses logic-based matching to generate relevant conversation starters.
 * Falls back to generic dev-themed openers when no shared skills exist.
 *
 * Props:
 * - currentUser: { skills, experienceLevel, currentlyBuilding, github }
 * - matchedUser: { firstName, skills, experienceLevel, currentlyBuilding, github }
 * - onSelect: (message) => void — callback when user picks a suggestion
 */

// Skill-based conversation templates
const SKILL_TEMPLATES = {
  React: [
    "What's your favorite state management approach? Redux, Zustand, or Context?",
    "Are you team class components or hooks all the way?",
    "What's the coolest React project you've built recently?",
  ],
  "Node.js": [
    "Express or Fastify — which do you prefer and why?",
    "Have you tried Bun as a Node.js alternative?",
    "What's your go-to database with Node.js?",
  ],
  Python: [
    "Django or Flask — what's your weapon of choice?",
    "Are you into data science Python or backend Python?",
    "What Python library blew your mind recently?",
  ],
  TypeScript: [
    "When did you make the switch to TypeScript? Any regrets?",
    "What's your take on strict mode vs. loose TS configs?",
    "Generics: love them or fear them?",
  ],
  Docker: [
    "Docker Compose or Kubernetes for local dev?",
    "What's your Dockerfile optimization trick?",
    "Multi-stage builds — game changer or overengineered?",
  ],
  AWS: [
    "What's your favorite AWS service that people sleep on?",
    "Serverless or containers — where do you lean?",
    "Any AWS certification war stories?",
  ],
  MongoDB: [
    "When do you choose MongoDB over PostgreSQL?",
    "Aggregation pipelines — love or hate?",
    "What's your approach to schema design in Mongo?",
  ],
  Go: [
    "What made you pick Go over other backend languages?",
    "Goroutines and channels — any cool patterns you've used?",
    "What's your favorite Go package outside the stdlib?",
  ],
  Rust: [
    "How long did it take you to befriend the borrow checker?",
    "What's the most satisfying Rust project you've shipped?",
    "Do you use Rust for backend, systems, or something else?",
  ],
  "Machine Learning": [
    "What kind of ML models are you working with?",
    "PyTorch or TensorFlow — and why?",
    "Any cool datasets you've worked with recently?",
  ],
};

// Generic dev-themed ice breakers
const GENERIC_OPENERS = [
  "What's the most interesting bug you've debugged recently?",
  "Are you working on any side projects right now?",
  "What tech are you most excited about learning next?",
  "Tabs or spaces? (Just kidding... unless? 😄)",
  "What's your dev setup like — OS, editor, terminal?",
  "Have you attended any good tech conferences or meetups?",
  "What's one piece of advice you'd give to your junior self?",
  "Coffee or tea while coding? ☕🍵",
  "What's the tech stack at your current/last job?",
  "Remote, hybrid, or office — what's your ideal setup?",
];

// Context-specific templates
const BUILDING_TEMPLATES = [
  "I saw you're building {project} — that sounds awesome! What stage are you at?",
  "Tell me more about {project} — what's the biggest challenge so far?",
  "I'm curious about {project} — what inspired you to start it?",
];

const GITHUB_TEMPLATES = [
  "I checked out your GitHub — {repo} looks really cool! What motivated that project?",
  "Nice GitHub profile! How do you maintain a {stars}-star project?",
  "Your contribution graph is impressive — any tips for staying consistent?",
];

const IceBreakers = ({ currentUser, matchedUser, onSelect }) => {
  const suggestions = useMemo(() => {
    if (!matchedUser) return GENERIC_OPENERS.slice(0, 4);

    const results = [];
    const currentSkills = currentUser?.skills || [];
    const matchedSkills = matchedUser?.skills || [];

    // 1. Shared skills-based suggestions
    const shared = currentSkills.filter((s) => matchedSkills.includes(s));
    for (const skill of shared.slice(0, 2)) {
      const templates = SKILL_TEMPLATES[skill];
      if (templates) {
        const random = templates[Math.floor(Math.random() * templates.length)];
        results.push({ text: random, reason: `You both know ${skill}` });
      }
    }

    // 2. Their unique skills (things they know that you don't)
    const theirUnique = matchedSkills.filter((s) => !currentSkills.includes(s));
    if (theirUnique.length > 0) {
      const skill = theirUnique[0];
      results.push({
        text: `I see you work with ${skill} — I've been wanting to learn that! Any tips for getting started?`,
        reason: `They know ${skill}`,
      });
    }

    // 3. "Currently Building" based
    if (matchedUser.currentlyBuilding) {
      const template = BUILDING_TEMPLATES[Math.floor(Math.random() * BUILDING_TEMPLATES.length)];
      results.push({
        text: template.replace("{project}", matchedUser.currentlyBuilding),
        reason: "Based on their current project",
      });
    }

    // 4. GitHub based
    if (matchedUser.github?.topRepos?.length > 0) {
      const repo = matchedUser.github.topRepos[0];
      results.push({
        text: `I saw your ${repo.name} repo — ${repo.stars} stars! What's the story behind it?`,
        reason: "From their GitHub",
      });
    } else if (matchedUser.github?.totalStars > 10) {
      results.push({
        text: `${matchedUser.github.totalStars} stars on GitHub — impressive! Which project are you most proud of?`,
        reason: "From their GitHub stats",
      });
    }

    // 5. Experience level based
    if (matchedUser.experienceLevel && currentUser?.experienceLevel) {
      if (matchedUser.experienceLevel === "senior" || matchedUser.experienceLevel === "lead") {
        results.push({
          text: `As a ${matchedUser.experienceLevel} dev, what's the biggest lesson you've learned in your career?`,
          reason: "Based on their experience",
        });
      }
    }

    // 6. Fill remaining with generic openers
    while (results.length < 4) {
      const generic = GENERIC_OPENERS[Math.floor(Math.random() * GENERIC_OPENERS.length)];
      if (!results.find((r) => r.text === generic)) {
        results.push({ text: generic, reason: "Conversation starter" });
      }
    }

    return results.slice(0, 4);
  }, [currentUser, matchedUser]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium opacity-60 flex items-center gap-1">
        <span aria-hidden="true">💡</span>
        Conversation starters for you:
      </p>
      <div className="grid gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            type="button"
            onClick={() => onSelect(suggestion.text)}
            className="text-left bg-base-300 hover:bg-primary/10 border border-base-content/5 hover:border-primary/30 rounded-lg p-3 transition-all group"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            aria-label={`Use suggestion: ${suggestion.text}`}
          >
            <p className="text-sm leading-relaxed">{suggestion.text}</p>
            {suggestion.reason && (
              <p className="text-[10px] opacity-40 mt-1 group-hover:opacity-60">
                {suggestion.reason}
              </p>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default IceBreakers;
