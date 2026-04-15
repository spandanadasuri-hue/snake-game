import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 200;

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
}

export default function SnakeGame({ onScoreChange }: SnakeGameProps) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Performance & State Refs
  const snakeRef = useRef(snake);
  const directionRef = useRef(direction);
  const inputQueueRef = useRef<{x: number, y: number}[]>([]);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);

  useEffect(() => {
    snakeRef.current = snake;
    directionRef.current = direction;
  }, [snake, direction]);

  const generateFood = useCallback((currentSnake: {x: number, y: number}[]) => {
    // Prevent infinite loop freeze if player wins (fills the board)
    if (currentSnake.length >= GRID_SIZE * GRID_SIZE) return { x: -1, y: -1 };
    
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    inputQueueRef.current = [];
    setScore(0);
    onScoreChange(0);
    setGameOver(false);
    setIsPaused(false);
    setHasStarted(true);
    setFood(generateFood(INITIAL_SNAKE));
    lastTimeRef.current = performance.now();
    accumulatorRef.current = 0;
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ') {
        if (gameOver) {
          resetGame();
        } else if (!hasStarted) {
          setHasStarted(true);
          setIsPaused(false);
          lastTimeRef.current = performance.now();
        } else {
          setIsPaused(prev => {
            if (prev) lastTimeRef.current = performance.now(); // Reset timer on resume to prevent speed burst
            return !prev;
          });
        }
        return;
      }

      if (gameOver || isPaused || !hasStarted) return;

      // Use the last queued input to prevent rapid double-keypress suicide
      const lastInput = inputQueueRef.current.length > 0 
        ? inputQueueRef.current[inputQueueRef.current.length - 1] 
        : directionRef.current;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (lastInput.y !== 1) inputQueueRef.current.push({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (lastInput.y !== -1) inputQueueRef.current.push({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (lastInput.x !== 1) inputQueueRef.current.push({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (lastInput.x !== -1) inputQueueRef.current.push({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused, hasStarted]);

  useEffect(() => {
    if (gameOver || isPaused || !hasStarted) return;

    const moveSnake = () => {
      const currentSnake = snakeRef.current;
      let currentDirection = directionRef.current;

      // Process the next queued input
      if (inputQueueRef.current.length > 0) {
        currentDirection = inputQueueRef.current.shift()!;
        setDirection(currentDirection);
      }

      const head = currentSnake[0];
      const newHead = { x: head.x + currentDirection.x, y: head.y + currentDirection.y };

      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return;
      }

      if (currentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return;
      }

      const newSnake = [newHead, ...currentSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        const newScore = score + 10;
        setScore(newScore);
        onScoreChange(newScore);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    };

    // Fixed-timestep game loop using requestAnimationFrame
    const update = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      accumulatorRef.current += deltaTime;

      // If the browser lags, this ensures the game catches up logically
      while (accumulatorRef.current >= INITIAL_SPEED) {
        moveSnake();
        accumulatorRef.current -= INITIAL_SPEED;
      }

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [food, gameOver, isPaused, hasStarted, score, onScoreChange, generateFood]);

  return (
    <div 
      className="relative w-full max-w-[500px] aspect-square border-4 border-[#ff00ff] flex-shrink-0 focus:outline-none bg-[#020202]"
      tabIndex={0}
      ref={gameContainerRef}
    >
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)',
          backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`
        }}
      />

      {/* Game Area */}
      <div className="absolute inset-0">
        {snake.map((segment, index) => {
          const isHead = index === 0;
          return (
            <div
              key={`${segment.x}-${segment.y}-${index}`}
              className={`absolute transition-all duration-75 ${
                isHead 
                  ? 'bg-[#ffffff] z-10 border-2 border-[#ff00ff]' 
                  : 'bg-[#00ffff] border border-[#020202]'
              }`}
              style={{
                left: `${(segment.x / GRID_SIZE) * 100}%`,
                top: `${(segment.y / GRID_SIZE) * 100}%`,
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
              }}
            />
          );
        })}
        
        {/* Food */}
        <div
          className="absolute bg-[#ff00ff] border-2 border-[#ffffff] animate-[pulse_0.2s_infinite]"
          style={{
            left: `${(food.x / GRID_SIZE) * 100}%`,
            top: `${(food.y / GRID_SIZE) * 100}%`,
            width: `${100 / GRID_SIZE}%`,
            height: `${100 / GRID_SIZE}%`,
          }}
        />
      </div>

      {/* Overlays */}
      {(!hasStarted || gameOver || isPaused) && (
        <div className="absolute inset-0 bg-[#020202]/90 flex flex-col items-center justify-center z-20 border-4 border-[#00ffff] m-4">
          <h2 className={`text-6xl font-pixel mb-4 glitch ${gameOver ? 'text-[#ff00ff]' : 'text-[#00ffff]'}`} data-text={!hasStarted ? 'SYSTEM_READY' : gameOver ? 'FATAL_ERROR' : 'SYSTEM_PAUSED'}>
            {!hasStarted ? 'SYSTEM_READY' : gameOver ? 'FATAL_ERROR' : 'SYSTEM_PAUSED'}
          </h2>
          <p className="text-[#ffffff] font-pixel mb-8 text-2xl">
            {!hasStarted ? 'AWAITING_INITIALIZATION' : gameOver ? `DATA_LOST: ${score}` : 'AWAITING_INPUT'}
          </p>
          <button
            onClick={() => {
              if (gameOver) resetGame();
              else {
                setHasStarted(true);
                setIsPaused(false);
              }
            }}
            className="px-6 py-3 bg-[#00ffff] text-[#020202] font-pixel text-2xl uppercase hover:bg-[#ff00ff] hover:text-[#ffffff] transition-colors cursor-pointer"
          >
            {!hasStarted ? '[ INITIALIZE ]' : gameOver ? '[ REBOOT_SEQUENCE ]' : '[ RESUME_EXECUTION ]'}
          </button>
        </div>
      )}
    </div>
  );
}
