'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'motion/react';
import { ThumbsDown, ThumbsUp, Play, RotateCcw, ChevronRight, Check, X, Plus } from 'lucide-react';
import Image from 'next/image';
import { Movie } from '@/lib/tmdb';

import { getMatchedMoviesAction } from '@/app/actions';

interface Question {
  id: string;
  text: string;
  options: { label: string; value: string }[];
}

const coreQuestions: Question[] = [
  {
    id: 'genre',
    text: 'What vibe are you looking for?',
    options: [
      { label: 'Action Packed', value: 'action' },
      { label: 'Comedy Gold', value: 'comedy' },
      { label: 'Deep Drama', value: 'drama' },
      { label: 'Sci-Fi Adventure', value: 'sci-fi' },
      { label: 'Romantic', value: 'romance' },
      { label: 'Thrilling', value: 'thriller' },
      { label: 'Animated Fun', value: 'animation' },
    ],
  },
  {
    id: 'time',
    text: 'How much time do you have?',
    options: [
      { label: 'Quick Watch', value: 'quick' },
      { label: 'Standard Length', value: 'standard' },
      { label: 'A Long Story', value: 'long' },
      { label: 'Epic Journey', value: 'epic' },
    ],
  },
  {
    id: 'era',
    text: 'What era of movies?',
    options: [
      { label: 'Classic', value: 'classic' },
      { label: 'Golden Age (80s-90s)', value: 'golden age' },
      { label: 'Modern (00s-10s)', value: 'modern' },
      { label: 'New Releases', value: 'new releases' },
    ],
  },
  {
    id: 'mood',
    text: 'How do you want to feel?',
    options: [
      { label: 'Energetic', value: 'energetic' },
      { label: 'Happy', value: 'happy' },
      { label: 'Intense', value: 'intense' },
      { label: 'Nostalgic', value: 'nostalgic' },
    ],
  },
  {
    id: 'pacing',
    text: 'What pacing do you prefer?',
    options: [
      { label: 'Fast-paced', value: 'fast-paced' },
      { label: 'Standard', value: 'standard' },
      { label: 'Slow-burn', value: 'dark' },
    ],
  },
];

const deepQuestionsBank: Question[] = [
  {
    id: 'deep_setting',
    text: 'Where should the story primarily take place?',
    options: [
      { label: 'Space or Future', value: 'sci-fi' },
      { label: 'Real World', value: 'drama' },
      { label: 'Fantasy Realm', value: 'fantasy' },
      { label: 'Historical Setting', value: 'classic' },
    ],
  },
  {
    id: 'deep_protagonist',
    text: 'What kind of protagonist do you prefer?',
    options: [
      { label: 'Underdog', value: 'happy' },
      { label: 'Anti-hero', value: 'dark' },
      { label: 'Ensemble Cast', value: 'standard' },
      { label: 'Chosen One', value: 'action' },
    ],
  },
  {
    id: 'deep_ending',
    text: 'How do you want it to end?',
    options: [
      { label: 'Neatly Resolved', value: 'happy' },
      { label: 'Ambiguous', value: 'thriller' },
      { label: 'Twist Ending', value: 'thriller' },
      { label: 'Tragic but Beautiful', value: 'drama' },
    ],
  },
  {
    id: 'deep_visuals',
    text: 'What visual style catches your eye?',
    options: [
      { label: 'Bright and Colorful', value: 'happy' },
      { label: 'Dark and Gritty', value: 'dark' },
      { label: 'Visually Stunning', value: 'sci-fi' },
      { label: 'Grounded and Realistic', value: 'drama' },
    ],
  },
  {
    id: 'deep_stakes',
    text: 'What should be at stake?',
    options: [
      { label: 'The Entire World', value: 'action' },
      { label: 'Personal Relationships', value: 'romance' },
      { label: 'Survival', value: 'thriller' },
      { label: 'Discovering the Truth', value: 'drama' },
    ],
  },
  {
    id: 'deep_focus',
    text: 'What should the movie focus on more?',
    options: [
      { label: 'Heart-pumping Action', value: 'action' },
      { label: 'Deep Character Study', value: 'drama' },
      { label: 'Mind-bending Plot', value: 'sci-fi' },
      { label: 'Laughs and Jokes', value: 'comedy' },
    ],
  },
  {
    id: 'deep_indie',
    text: 'Blockbuster or Indie?',
    options: [
      { label: 'Huge Blockbuster', value: 'action' },
      { label: 'Hidden Indie Gem', value: 'drama' },
      { label: 'Critical Darling', value: 'drama' },
      { label: 'Cult Classic', value: 'horror' },
    ],
  },
  {
    id: 'deep_suspense',
    text: 'How do you like your suspense?',
    options: [
      { label: 'Jump Scares', value: 'horror' },
      { label: 'Psychological Tension', value: 'thriller' },
      { label: 'Action Sequences', value: 'action' },
      { label: 'Slow Reveal', value: 'drama' },
    ],
  },
  {
    id: 'deep_world',
    text: 'Which world to explore?',
    options: [
      { label: 'Earth Cityscapes', value: 'action' },
      { label: 'Alien Planets', value: 'sci-fi' },
      { label: 'Ancient Times', value: 'classic' },
      { label: 'Magical Kingdoms', value: 'fantasy' },
    ],
  },
  {
    id: 'deep_hero',
    text: 'Capabilities of the hero?',
    options: [
      { label: 'Superpowered', value: 'sci-fi' },
      { label: 'Highly Trained', value: 'action' },
      { label: 'Everyday Person', value: 'drama' },
      { label: 'Flawed Survivalist', value: 'thriller' },
    ],
  },
  {
    id: 'deep_villain',
    text: 'What makes a great villain?',
    options: [
      { label: 'Relatable Motives', value: 'drama' },
      { label: 'Pure Evil', value: 'horror' },
      { label: 'Corporate Greed', value: 'thriller' },
      { label: 'Comical Buffoon', value: 'comedy' },
    ],
  },
  {
    id: 'deep_music',
    text: 'The ideal soundtrack?',
    options: [
      { label: 'Epic Orchestral', value: 'action' },
      { label: 'Pop Anthems', value: 'happy' },
      { label: 'Eerie Synths', value: 'sci-fi' },
      { label: 'Classical or Jazz', value: 'drama' },
    ],
  },
  {
    id: 'deep_humor',
    text: 'What is your sense of humor?',
    options: [
      { label: 'Slapstick', value: 'comedy' },
      { label: 'Dry and Witty', value: 'drama' },
      { label: 'Dark Humor', value: 'intense' },
      { label: 'Goofy Parody', value: 'comedy' },
    ],
  },
  {
    id: 'deep_violence',
    text: 'Level of action intensity?',
    options: [
      { label: 'Clean and PG-13', value: 'standard' },
      { label: 'Gritty and Gory', value: 'intense' },
      { label: 'Stylized Violence', value: 'action' },
      { label: 'No Violence', value: 'happy' },
    ],
  },
  {
    id: 'deep_dialogue',
    text: 'Dialogue or Action?',
    options: [
      { label: 'Lots of Witty Banter', value: 'comedy' },
      { label: 'Deep Monologues', value: 'drama' },
      { label: 'Show, Don\'t Tell', value: 'thriller' },
      { label: 'Explosions Speaking', value: 'action' },
    ],
  },
  {
    id: 'deep_tropes',
    text: 'Favorite story trope?',
    options: [
      { label: 'Enemies to Lovers', value: 'romance' },
      { label: 'The Chosen One', value: 'fantasy' },
      { label: 'Whodunit Mystery', value: 'thriller' },
      { label: 'Fish out of Water', value: 'comedy' },
    ],
  },
  {
    id: 'deep_based_on',
    text: 'Source material?',
    options: [
      { label: 'Based on a True Story', value: 'drama' },
      { label: 'Book Adaptation', value: 'standard' },
      { label: 'Comic Book', value: 'action' },
      { label: 'Completely Original', value: 'indie' },
    ],
  },
  {
    id: 'deep_color',
    text: 'Dominant color palette?',
    options: [
      { label: 'Neon Cyberpunk', value: 'sci-fi' },
      { label: 'Washed-out Muted', value: 'dark' },
      { label: 'Warm and Golden', value: 'happy' },
      { label: 'Cold Blues', value: 'thriller' },
    ],
  },
  {
    id: 'deep_magic',
    text: 'Level of Magic/Tech?',
    options: [
      { label: 'Hard Sci-Fi', value: 'sci-fi' },
      { label: 'High Fantasy Magic', value: 'fantasy' },
      { label: 'Slightly Supernatural', value: 'thriller' },
      { label: 'Completely Grounded', value: 'drama' },
    ],
  },
  {
    id: 'deep_family',
    text: 'Who are you watching with?',
    options: [
      { label: 'Family Friendly', value: 'animation' },
      { label: 'Mature Audiences', value: 'dark' },
      { label: 'Date Night', value: 'romance' },
      { label: 'Just Me', value: 'standard' },
    ],
  },
  {
    id: 'deep_animation',
    text: 'Animation style preferences?',
    options: [
      { label: 'Classic 2D', value: 'animation' },
      { label: 'Cutting-edge 3D', value: 'animation' },
      { label: 'Stop Motion', value: 'animation' },
      { label: 'Live Action Only', value: 'standard' },
    ],
  },
  {
    id: 'deep_tech',
    text: 'Favorite futuristic setting?',
    options: [
      { label: 'Dystopian AI', value: 'sci-fi' },
      { label: 'Utopian Space Trek', value: 'sci-fi' },
      { label: 'Cyberpunk Streets', value: 'action' },
      { label: 'Not futuristic', value: 'standard' },
    ],
  },
  {
    id: 'deep_plot',
    text: 'Plot structure preference?',
    options: [
      { label: 'Straightforward Linear', value: 'action' },
      { label: 'Mind-bending Timeline', value: 'sci-fi' },
      { label: 'Multiple Intersecting Stories', value: 'drama' },
      { label: 'Anthology format', value: 'indie' },
    ],
  },
  {
    id: 'deep_leads',
    text: 'Number of leading characters?',
    options: [
      { label: 'A Lone Wolf', value: 'action' },
      { label: 'A Dynamic Duo', value: 'comedy' },
      { label: 'A Love Triangle', value: 'romance' },
      { label: 'A Massive Ensemble', value: 'standard' },
    ],
  },
  {
    id: 'deep_emotion',
    text: 'Which emotion do you want to feel?',
    options: [
      { label: 'A good cry', value: 'drama' },
      { label: 'Adrenaline rush', value: 'action' },
      { label: 'Belly laughs', value: 'comedy' },
      { label: 'Paranoia', value: 'thriller' },
    ],
  },
  {
    id: 'deep_budget',
    text: 'You prefer movies that look...',
    options: [
      { label: 'Extremely Expensive', value: 'action' },
      { label: 'Rough and Raw', value: 'indie' },
      { label: 'Period Accurate', value: 'drama' },
      { label: 'Doesn\'t matter', value: 'standard' },
    ],
  },
  {
    id: 'deep_subtitles',
    text: 'Are subtitles okay?',
    options: [
      { label: 'Yes, love foreign films', value: 'drama' },
      { label: 'Only if dubbed', value: 'standard' },
      { label: 'Prefer English original', value: 'standard' },
      { label: 'Any language is fine', value: 'indie' },
    ],
  },
  {
    id: 'deep_creatures',
    text: 'Monsters or Humans?',
    options: [
      { label: 'Giant Monsters', value: 'sci-fi' },
      { label: 'Vampires/Zombies', value: 'horror' },
      { label: 'Animals/Pets', value: 'happy' },
      { label: 'Just humans', value: 'drama' },
    ],
  },
  {
    id: 'deep_weather',
    text: 'Preferred weather setting?',
    options: [
      { label: 'Sunny Beach', value: 'comedy' },
      { label: 'Dark and Rainy', value: 'thriller' },
      { label: 'Snowy Isolation', value: 'horror' },
      { label: 'Outer Space Void', value: 'sci-fi' },
    ],
  },
  {
    id: 'deep_sports',
    text: 'Is sports/competition appealing?',
    options: [
      { label: 'Yes, sports drama', value: 'drama' },
      { label: 'Martial Arts Tournament', value: 'action' },
      { label: 'E-Sports/Gaming', value: 'sci-fi' },
      { label: 'Not really', value: 'standard' },
    ],
  }
];

type Stage = 'start' | 'questions' | 'matching' | 'completed';

export function MovieMatchClient() {
  const [stage, setStage] = useState<Stage>('start');
  const [allQuestions, setAllQuestions] = useState<Question[]>([...coreQuestions]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ id: string; value: string }[]>([]);
  
  const [movieQueue, setMovieQueue] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [skippedMovieIds, setSkippedMovieIds] = useState<Set<number>>(new Set());
  const [skipCount, setSkipCount] = useState(0);
  const [deepQuestionsAsked, setDeepQuestionsAsked] = useState<Set<string>>(new Set());
  
  const [isLoading, setIsLoading] = useState(false);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacityLike = useTransform(x, [0, 100], [0, 1]);
  const opacitySkip = useTransform(x, [0, -100], [0, 1]);

  useEffect(() => {
    let mounted = true;
    setTimeout(() => {
      if (!mounted) return;
      try {
        const storedSkipped = JSON.parse(localStorage.getItem('wtw_skippedMovies') || '[]');
        setSkippedMovieIds(new Set(storedSkipped));
        
        const storedWatchlist = JSON.parse(localStorage.getItem('wtw_watchlist') || '[]');
        setWatchlist(storedWatchlist);
      } catch (e) {
        console.error('Failed to load local storage data', e);
      }
    }, 0);
    return () => { mounted = false; };
  }, []);

  // Extract variables from answers
  const buildFiltersFromAnswers = () => {
    const withGenres = new Set<string>();
    let sortBy = 'popularity.desc';
    let voteAverageMin = 0;
    let yearMin: number | null = null;
    let yearMax: number | null = null;
    let runtimeMin: number | null = null;
    let runtimeMax: number | null = null;

    answers.forEach((ans) => {
      const val = ans.value.toLowerCase();
      
      // Genres
      if (val.includes('action')) withGenres.add('28');
      if (val.includes('comedy')) withGenres.add('35');
      if (val.includes('drama')) withGenres.add('18');
      if (val.includes('horror')) withGenres.add('27');
      if (val.includes('sci-fi')) withGenres.add('878');
      if (val.includes('romance')) withGenres.add('10749');
      if (val.includes('thriller')) withGenres.add('53');
      if (val.includes('animation')) withGenres.add('16');
      if (val.includes('fantasy')) withGenres.add('14');

      // Mood
      if (val.includes('energetic') || val.includes('fast-paced')) sortBy = 'vote_average.desc';
      if (val.includes('happy') || val.includes('uplifting')) voteAverageMin = 7;
      if (val.includes('dark') || val.includes('intense')) {
        withGenres.add('53');
        withGenres.add('27');
      }
      if (val.includes('nostalgic')) {
        yearMin = 1980;
        yearMax = 2000;
      }

      // Runtime
      if (val.includes('quick') || val.includes('under 90')) runtimeMax = 90;
      if (val.includes('standard')) {
        runtimeMin = 90;
        runtimeMax = 120;
      }
      if (val.includes('long')) {
        runtimeMin = 120;
        runtimeMax = 150;
      }
      if (val.includes('epic')) runtimeMin = 150;

      // Era
      if (val.includes('classic')) {
        yearMin = 1950;
        yearMax = 1980;
      }
      if (val.includes('golden age') || val.includes('80s-90s')) {
        yearMin = 1980;
        yearMax = 2000;
      }
      if (val.includes('modern')) {
        yearMin = 2000;
        yearMax = 2015;
      }
      if (val.includes('new releases')) {
        yearMin = 2020;
        yearMax = 2025;
      }
    });

    return {
      withGenres: Array.from(withGenres),
      sortBy,
      voteAverageMin,
      yearMin,
      yearMax,
      runtimeMin,
      runtimeMax,
    };
  };

  const fetchMatchedMovies = async () => {
    setIsLoading(true);
    try {
      const filters = buildFiltersFromAnswers();
      const skippedAndWatchlisted = Array.from(skippedMovieIds).concat(watchlist.map(m => m.id));

      const topMovies = await getMatchedMoviesAction({
        withGenres: filters.withGenres,
        sortBy: filters.sortBy,
        voteAverageMin: filters.voteAverageMin,
        yearMin: filters.yearMin,
        yearMax: filters.yearMax,
        runtimeMin: filters.runtimeMin,
        runtimeMax: filters.runtimeMax,
        skippedMovieIds: skippedAndWatchlisted,
      });

      setMovieQueue(topMovies);
      
      if (topMovies.length === 0 && allQuestions.length === (5 + deepQuestionsAsked.size)) {
        setStage('completed');
      } else if (topMovies.length > 0) {
        setStage('matching');
      } else {
        // Queue empty but fallback didn't help? Just show completed.
        setStage('completed');
      }
      
    } catch (e) {
      console.error(e);
      setStage('completed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (val: string) => {
    const currentQ = allQuestions[currentQuestionIndex];
    setAnswers(prev => [...prev, { id: currentQ.id, value: val }]);
    
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      fetchMatchedMovies();
    }
  };

  const addDeepQuestions = () => {
    const available = deepQuestionsBank.filter(q => !deepQuestionsAsked.has(q.id));
    // Shuffle and pick up to 3
    const shuffled = available.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    
    if (selected.length > 0) {
      setAllQuestions(prev => [...prev, ...selected]);
      setCurrentQuestionIndex(allQuestions.length); // Next index will be the current length
      setStage('questions');
      
      const newAsked = new Set(deepQuestionsAsked);
      selected.forEach(q => newAsked.add(q.id));
      setDeepQuestionsAsked(newAsked);
    } else {
      setStage('completed');
    }
  };

  const handleSkip = () => {
    if (movieQueue.length === 0) return;
    
    const currentMovie = movieQueue[0];
    const newSkipped = new Set(skippedMovieIds);
    newSkipped.add(currentMovie.id);
    setSkippedMovieIds(newSkipped);

    try {
        localStorage.setItem('wtw_skippedMovies', JSON.stringify(Array.from(newSkipped)));
    } catch (e) {
        console.error('Failed to sync skipped movies', e);
    }
    
    const newQueue = movieQueue.slice(1);
    setMovieQueue(newQueue);
    
    const newSkipCount = skipCount + 1;
    setSkipCount(newSkipCount);
    x.set(0);

    if (newQueue.length === 0) {
        fetchMatchedMovies(); // Refetch more movies
    }

    if (newSkipCount % 3 === 0) {
      addDeepQuestions();
    }
  };

  const handleAccept = () => {
    if (movieQueue.length === 0) return;
    const currentMovie = movieQueue[0];

    setWatchlist(prev => {
        const next = [...prev, currentMovie];
        try {
            const existingDataStr = localStorage.getItem('wtw_watchlist') || '[]';
            const existingData: Movie[] = JSON.parse(existingDataStr);
            if (!existingData.some((m: Movie) => m.id === currentMovie.id)) {
                existingData.push(currentMovie);
                localStorage.setItem('wtw_watchlist', JSON.stringify(existingData));
            }
        } catch (e) {
            console.error('Failed to sync to watchlist', e);
        }
        return next;
    });
    
    const newQueue = movieQueue.slice(1);
    setMovieQueue(newQueue);
    x.set(0);

    if (newQueue.length === 0) {
        fetchMatchedMovies();
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    const offset = info.offset.x;
    if (offset > 100) {
      handleAccept();
    } else if (offset < -100) {
      handleSkip();
    } else {
        // Reset to center done automatically by drag constraint logic combined with framer motion
    }
  };

  const resetQuiz = () => {
    setStage('start');
    setAllQuestions([...coreQuestions]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setMovieQueue([]);
    // Do not clear watchlist as it should persist
    setSkippedMovieIds(new Set());
    setSkipCount(0);
    setDeepQuestionsAsked(new Set());
  };

  return (
    <div className="min-h-screen bg-[#05050A] flex flex-col p-4 pt-24 pb-12 overflow-x-hidden relative">
      <div className="w-full max-w-5xl mx-auto flex justify-between items-center mb-4 px-4 z-20 relative">
          {stage === 'matching' ? (
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-[10px] sm:text-xs text-gray-500 font-mono tracking-widest uppercase">
                  <span>Queue: {movieQueue.length}</span>
                  <span className="hidden sm:inline">|</span>
                  <span>{3 - (skipCount % 3)} skips to next Q</span>
              </div>
          ) : <div />}
          <div className="bg-[#0F0F1A] border border-[#1F2937] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-3 shadow-lg shrink-0">
             <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Watchlist</span>
             <span className="font-bold text-white text-lg sm:text-xl">{watchlist.length}</span>
          </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1">
        <AnimatePresence mode="wait">
          {stage === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-xl text-center flex flex-col items-center relative z-10"
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 text-white drop-shadow-xl">
              Movie <span className="text-[#E50914]">Match</span>
            </h1>
            <p className="text-gray-400 font-mono tracking-widest uppercase mb-12 max-w-sm mx-auto text-sm leading-relaxed">
              Answer a few questions and find the perfect movie to watch tonight.
            </p>
            <button
              onClick={() => setStage('questions')}
              className="group relative flex items-center gap-3 bg-[#E50914] text-white px-8 py-4 font-bold tracking-widest uppercase rounded-lg overflow-hidden transition-transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 pointer-events-none" />
              <span>Start Matching</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {stage === 'questions' && allQuestions[currentQuestionIndex] && (
          <motion.div
            key={`q-${currentQuestionIndex}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-2xl relative z-10"
          >
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4 text-xs font-mono text-gray-500 uppercase tracking-widest">
                <span>Question {currentQuestionIndex + 1} of {allQuestions.length}</span>
                <span>{Math.round((currentQuestionIndex / allQuestions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-[#1F2937] h-1 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#E50914] transition-all duration-500" 
                  style={{ width: `${(currentQuestionIndex / allQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-black uppercase text-center mb-10 text-white tracking-tighter">
              {allQuestions[currentQuestionIndex].text}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allQuestions[currentQuestionIndex].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt.value)}
                  className="bg-[#0F0F1A] border-2 border-[#1F2937] p-6 text-center rounded-xl font-bold tracking-widest uppercase transition-all duration-200 hover:border-[#E50914] hover:bg-[#E50914]/10 active:scale-95 text-sm md:text-base text-gray-200"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {stage === 'matching' && movieQueue.length > 0 && (
          <motion.div
            key="matching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-md flex flex-col items-center relative z-10 flex-1 my-auto justify-center"
          >
             <div className="relative w-full max-w-[280px] sm:max-w-[320px] mx-auto min-h-[350px] sm:min-h-[400px] max-h-[50vh] flex items-center justify-center -mt-6">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#05050A]/80 flex-col gap-4">
                    <div className="w-8 h-8 border-4 border-[#1F2937] border-t-[#E50914] rounded-full animate-spin"></div>
                    <span className="font-mono text-xs uppercase text-gray-400 tracking-widest">Building your queue...</span>
                  </div>
                )}
                
                {/* Visual Stack behind the top card */}
                {movieQueue[1] && (
                    <div className="absolute w-[80%] aspect-[2/3] max-h-full bg-[#0F0F1A] border border-[#1F2937] rounded-2xl scale-95 -mt-6 opacity-50 pointer-events-none" />
                )}
                {movieQueue[2] && (
                    <div className="absolute w-[70%] aspect-[2/3] max-h-full bg-[#0F0F1A] border border-[#1F2937] rounded-2xl scale-90 -mt-12 opacity-30 pointer-events-none" />
                )}

                {movieQueue[0] && (
                    <motion.div
                        className="w-[90%] aspect-[2/3] max-h-full absolute cursor-grab active:cursor-grabbing"
                        style={{ x, rotate }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.8}
                        onDragEnd={handleDragEnd}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <div className="w-full h-full relative rounded-2xl overflow-hidden bg-[#0F0F1A] border border-[#1F2937] shadow-xl group">
                            <Image
                                src={`https://image.tmdb.org/t/p/w780${movieQueue[0].poster_path}`}
                                alt={movieQueue[0].title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
                                draggable={false}
                                priority
                            />
                            
                            {/* Dragging Indicators */}
                            <motion.div 
                              style={{ opacity: opacityLike }} 
                              className="absolute top-8 left-8 border-4 border-green-500 text-green-500 font-black text-2xl uppercase tracking-widest px-4 py-2 rounded-lg rotate-[-15deg] pointer-events-none"
                            >
                                ADD
                            </motion.div>
                            <motion.div 
                              style={{ opacity: opacitySkip }} 
                              className="absolute top-8 right-8 border-4 border-[#E50914] text-[#E50914] font-black text-2xl uppercase tracking-widest px-4 py-2 rounded-lg rotate-[15deg] pointer-events-none"
                            >
                                SKIP
                            </motion.div>

                            <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/40 to-transparent pointer-events-none" />
                            <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-white drop-shadow-md mb-2">{movieQueue[0].title}</h3>
                                <div className="flex flex-wrap gap-2 text-xs font-mono text-gray-300 uppercase tracking-widest">
                                    <span className="bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10 flex items-center gap-1">
                                        ★ {movieQueue[0].vote_average?.toFixed(1) || 'NR'}
                                    </span>
                                    {movieQueue[0].release_date && (
                                        <span className="bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                                            {movieQueue[0].release_date.substring(0, 4)}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-400 mt-4 leading-relaxed hidden sm:block">
                                    {movieQueue[0].overview?.split(' ').slice(0, 10).join(' ')}
                                    {(movieQueue[0].overview?.split(' ').length || 0) > 10 && '...'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
             </div>

             <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 mt-6 mx-auto w-full max-w-[280px] sm:max-w-full sm:px-4">
                 <button
                    onClick={handleSkip}
                    className="flex w-14 h-14 sm:w-auto sm:flex-1 items-center justify-center gap-2 bg-[#0F0F1A] border-2 border-[#1F2937] sm:px-4 py-3 sm:py-4 rounded-xl font-bold tracking-widest uppercase text-gray-400 hover:text-[#E50914] hover:border-[#E50914] transition-all duration-200 active:scale-95 text-xs sm:text-sm shrink-0"
                 >
                     <X className="w-6 h-6 shrink-0" />
                     <span className="hidden sm:inline">Skip</span>
                 </button>
                 <a
                    href={`/${movieQueue[0]?.title ? `${movieQueue[0].title.toLowerCase().replace(/\s+/g, '-')}-${movieQueue[0].id}` : ''}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-white text-black h-14 sm:h-auto sm:py-4 px-2 sm:px-6 rounded-xl font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 text-[11px] sm:text-sm whitespace-nowrap"
                 >
                     <Play className="w-5 h-5 fill-black shrink-0 hidden sm:block" />
                     <span>Watch Now</span>
                 </a>
                 <button
                    onClick={handleAccept}
                    className="flex w-14 h-14 sm:w-auto sm:flex-1 items-center justify-center gap-2 bg-[#0F0F1A] border-2 border-[#1F2937] sm:px-4 py-3 sm:py-4 rounded-xl font-bold tracking-widest uppercase text-gray-400 hover:text-green-500 hover:border-green-500 transition-all duration-200 active:scale-95 text-xs sm:text-sm shrink-0"
                 >
                     <Plus className="w-6 h-6 shrink-0" />
                     <span className="hidden sm:inline">Add</span>
                 </button>
             </div>
          </motion.div>
        )}

        {stage === 'completed' && (
          <motion.div
             key="completed"
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-full max-w-md text-center flex flex-col items-center relative z-10"
          >
              <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center border border-green-500/50 mb-6">
                  <Check className="w-10 h-10" />
              </div>
              <h2 className="text-4xl font-black uppercase text-white tracking-tighter drop-shadow-lg mb-4">
                  Match Completed
              </h2>
              <div className="text-gray-400 font-mono tracking-widest text-sm uppercase flex flex-col gap-2 bg-[#0F0F1A] w-full p-6 pb-6 rounded-xl border border-[#1F2937] mb-8">
                  <div className="flex justify-between border-b border-[#1F2937] pb-2">
                      <span>Questions Answered:</span>
                      <span className="text-white font-bold">{answers.length}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1F2937] pb-2 pt-2">
                      <span>Movies Saved:</span>
                      <span className="text-white font-bold">{watchlist.length}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                      <span>Movies Skipped:</span>
                      <span className="text-white font-bold">{skipCount}</span>
                  </div>
              </div>

              {watchlist.length > 0 && (
                <div className="w-full mb-8">
                  <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-4 text-left">Your Matches</h3>
                  <div className="flex overflow-x-auto gap-4 custom-scrollbar pb-4">
                    {watchlist.map((movie) => (
                      <a 
                        key={movie.id} 
                        href={`/${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${movie.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-24 shrink-0 rounded-md overflow-hidden border border-[#1F2937] hover:border-[#E50914] transition-colors"
                      >
                        <Image
                            src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                            alt={movie.title}
                            width={96}
                            height={144}
                            className="w-full h-auto object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <button
                  onClick={resetQuiz}
                  className="flex items-center gap-2 text-white bg-[#E50914] px-8 py-4 font-bold tracking-widest uppercase rounded-lg hover:bg-white hover:text-black transition-colors"
              >
                  <RotateCcw className="w-5 h-5" />
                  <span>Take Quiz Again</span>
              </button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
