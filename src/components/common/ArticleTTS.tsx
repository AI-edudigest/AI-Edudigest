import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

interface ArticleTTSProps {
  articleText: string;
  articleTitle: string;
  className?: string;
  onPlayStateChange?: (isPlaying: boolean, articleId: string) => void;
  articleId: string;
  isActive: boolean;
}

const ArticleTTS: React.FC<ArticleTTSProps> = ({
  articleText,
  articleTitle,
  className = '',
  onPlayStateChange,
  articleId,
  isActive
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      
      // Prefer high-quality voices with good pronunciation
      // Priority: Indian English > English (non-US) > US English > Others
      const indianVoice = voices.find(voice => 
        voice.lang === 'en-IN' || 
        voice.name.toLowerCase().includes('india') ||
        voice.name.toLowerCase().includes('indian')
      );
      
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        !voice.lang.includes('US') && 
        !voice.lang.includes('GB') &&
        voice.name.toLowerCase().includes('neural') === false // Avoid neural voices for better clarity
      );
      
      const usVoice = voices.find(voice => 
        voice.lang === 'en-US' &&
        voice.name.toLowerCase().includes('neural') === false
      );
      
      setSelectedVoice(indianVoice || englishVoice || usVoice || voices[0] || null);
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current && isPlaying) {
        speechSynthesis.cancel();
      }
    };
  }, [isPlaying]);

  // Stop if another article becomes active
  useEffect(() => {
    if (!isActive && isPlaying) {
      stop();
    }
  }, [isActive, isPlaying]);

  const speak = () => {
    if (!articleText.trim()) return;

    // Stop any current speech
    speechSynthesis.cancel();

    // Combine title and content for better context
    let fullText = `${articleTitle}. ${articleText}`;
    
    // Clean HTML tags and formatting elements
    fullText = fullText.replace(/<[^>]*>/g, ' '); // Remove all HTML tags
    fullText = fullText.replace(/&nbsp;/g, ' '); // Replace non-breaking spaces
    fullText = fullText.replace(/&amp;/g, '&'); // Replace HTML entities
    fullText = fullText.replace(/&lt;/g, '<');
    fullText = fullText.replace(/&gt;/g, '>');
    fullText = fullText.replace(/&quot;/g, '"');
    fullText = fullText.replace(/&#39;/g, "'");
    fullText = fullText.replace(/&apos;/g, "'");
    
    // Remove extra whitespace and normalize spacing
    fullText = fullText.replace(/\s+/g, ' '); // Replace multiple spaces with single space
    fullText = fullText.replace(/\n\s*\n/g, ' '); // Replace multiple newlines with single space
    fullText = fullText.replace(/^\s+|\s+$/g, ''); // Trim leading and trailing spaces
    
    // Remove any remaining formatting artifacts
    fullText = fullText.replace(/\b(h[1-6]|p|div|span|strong|b|em|i|u|ul|ol|li|br|hr)\b/gi, ''); // Remove HTML tag names
    fullText = fullText.replace(/\b(font-size|font-weight|color|background|margin|padding|border|width|height)\s*[:=]\s*[^;,\s]+/gi, ''); // Remove CSS properties
    fullText = fullText.replace(/\b(px|em|rem|%|pt|pc|in|cm|mm)\b/g, ''); // Remove CSS units
    fullText = fullText.replace(/\b(#?[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\))\b/g, ''); // Remove color codes
    
    // Remove bullet points and special characters that cause unwanted speech
    fullText = fullText.replace(/•/g, ''); // Remove bullet points
    fullText = fullText.replace(/◦/g, ''); // Remove white bullet points
    fullText = fullText.replace(/▪/g, ''); // Remove small square bullets
    fullText = fullText.replace(/▫/g, ''); // Remove white square bullets
    fullText = fullText.replace(/‣/g, ''); // Remove triangular bullets
    fullText = fullText.replace(/⁃/g, ''); // Remove hyphen bullets
    fullText = fullText.replace(/⁌/g, ''); // Remove reversed bullet
    fullText = fullText.replace(/⁍/g, ''); // Remove bullet
    fullText = fullText.replace(/‎/g, ''); // Remove left-to-right mark
    fullText = fullText.replace(/‏/g, ''); // Remove right-to-left mark
    fullText = fullText.replace(/×/g, ''); // Remove multiplication sign
    fullText = fullText.replace(/÷/g, ''); // Remove division sign
    fullText = fullText.replace(/±/g, ''); // Remove plus-minus sign
    fullText = fullText.replace(/∞/g, ''); // Remove infinity sign
    fullText = fullText.replace(/§/g, ''); // Remove section sign
    fullText = fullText.replace(/¶/g, ''); // Remove paragraph sign
    fullText = fullText.replace(/†/g, ''); // Remove dagger
    fullText = fullText.replace(/‡/g, ''); // Remove double dagger
    fullText = fullText.replace(/‰/g, ''); // Remove per mille sign
    fullText = fullText.replace(/′/g, "'"); // Replace prime with apostrophe
    fullText = fullText.replace(/″/g, '"'); // Replace double prime with quote
    fullText = fullText.replace(/‴/g, '"'); // Replace triple prime with quote
    fullText = fullText.replace(/‵/g, "'"); // Replace reversed prime with apostrophe
    fullText = fullText.replace(/‶/g, '"'); // Replace reversed double prime with quote
    fullText = fullText.replace(/‷/g, '"'); // Replace reversed triple prime with quote
    
    // Clean up any remaining artifacts
    fullText = fullText.replace(/\s+/g, ' '); // Normalize spaces again
    fullText = fullText.replace(/^\s+|\s+$/g, ''); // Trim again
    
    // Improve pronunciation for technical terms and abbreviations
    fullText = fullText.replace(/\bAI\b/g, 'A I'); // AI -> A I for better pronunciation
    fullText = fullText.replace(/\bML\b/g, 'machine learning'); // ML -> machine learning
    fullText = fullText.replace(/\bVR\b/g, 'virtual reality'); // VR -> virtual reality
    fullText = fullText.replace(/\bAR\b/g, 'augmented reality'); // AR -> augmented reality
    fullText = fullText.replace(/\bAPI\b/g, 'A P I'); // API -> A P I
    fullText = fullText.replace(/\bUI\b/g, 'user interface'); // UI -> user interface
    fullText = fullText.replace(/\bUX\b/g, 'user experience'); // UX -> user experience
    fullText = fullText.replace(/\bIoT\b/g, 'Internet of Things'); // IoT -> Internet of Things
    fullText = fullText.replace(/\bSaaS\b/g, 'Software as a Service'); // SaaS -> Software as a Service
    fullText = fullText.replace(/\bPaaS\b/g, 'Platform as a Service'); // PaaS -> Platform as a Service
    fullText = fullText.replace(/\bIaaS\b/g, 'Infrastructure as a Service'); // IaaS -> Infrastructure as a Service
    fullText = fullText.replace(/\bJSON\b/g, 'J S O N'); // JSON -> J S O N
    fullText = fullText.replace(/\bXML\b/g, 'X M L'); // XML -> X M L
    fullText = fullText.replace(/\bHTML\b/g, 'H T M L'); // HTML -> H T M L
    fullText = fullText.replace(/\bCSS\b/g, 'C S S'); // CSS -> C S S
    fullText = fullText.replace(/\bURL\b/g, 'U R L'); // URL -> U R L
    fullText = fullText.replace(/\bHTTP\b/g, 'H T T P'); // HTTP -> H T T P
    fullText = fullText.replace(/\bHTTPS\b/g, 'H T T P S'); // HTTPS -> H T T P S
    fullText = fullText.replace(/\bSQL\b/g, 'S Q L'); // SQL -> S Q L
    fullText = fullText.replace(/\bNoSQL\b/g, 'No S Q L'); // NoSQL -> No S Q L
    fullText = fullText.replace(/\bREST\b/g, 'R E S T'); // REST -> R E S T
    fullText = fullText.replace(/\bGraphQL\b/g, 'Graph Q L'); // GraphQL -> Graph Q L
    
    // Clean up text to prevent stopping at periods
    // Replace multiple periods with single periods
    fullText = fullText.replace(/\.{2,}/g, '.');
    // Replace periods followed by space with period and comma to prevent sentence boundary detection
    fullText = fullText.replace(/\. /g, ', ');
    // Handle other sentence endings
    fullText = fullText.replace(/! /g, ', ');
    fullText = fullText.replace(/\? /g, ', ');
    
    // Remove list formatting that causes unwanted speech
    fullText = fullText.replace(/^\d+\.\s*/gm, ''); // Remove numbered list items (1. 2. 3. etc.)
    fullText = fullText.replace(/^[-*]\s*/gm, ''); // Remove bullet list items (- * etc.)
    fullText = fullText.replace(/^[a-zA-Z]\.\s*/gm, ''); // Remove lettered list items (a. b. c. etc.)
    fullText = fullText.replace(/^[ivx]+\.\s*/gm, ''); // Remove roman numeral list items (i. ii. iii. etc.)
    fullText = fullText.replace(/^[IVX]+\.\s*/gm, ''); // Remove uppercase roman numeral list items (I. II. III. etc.)
    
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.8; // Slower for better clarity and pronunciation
    utterance.pitch = 1.1; // Slightly higher pitch for better clarity
    utterance.volume = 1; // Fixed volume at maximum
    utterance.lang = 'en-IN'; // Set to Indian English
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      onPlayStateChange?.(true, articleId);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      onPlayStateChange?.(false, articleId);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsPlaying(false);
      setIsPaused(false);
      onPlayStateChange?.(false, articleId);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (isPlaying) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    onPlayStateChange?.(false, articleId);
  };

  const handlePlayPause = () => {
    if (isPlaying && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak();
    }
  };


  return (
    <div className={`relative ${className}`}>
      {/* Main TTS Button */}
      <button
        onClick={handlePlayPause}
        disabled={!articleText.trim()}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-[#9b0101] text-white hover:bg-[#7a0101] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
        title={isPlaying && !isPaused ? 'Pause Audio' : isPaused ? 'Resume Audio' : 'Listen to Article'}
        aria-label={isPlaying && !isPaused ? 'Pause Audio' : isPaused ? 'Resume Audio' : 'Listen to Article'}
      >
        {isPlaying && !isPaused ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>


      {/* Playing Indicator */}
      {isPlaying && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};

export default ArticleTTS;
