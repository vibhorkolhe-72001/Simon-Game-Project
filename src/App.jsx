import { useRef, useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { AnimatePresence, motion } from "motion/react"
import green from "./assets/1.wav";
import red from "./assets/2.wav";
import orange from "./assets/3.wav";
import blue from "./assets/4.wav";
import bg from "./assets/bg.jpg";
import start from "./assets/play.svg";
import resets from "./assets/reset.svg";
import scores from "./assets/score.svg";
import gameover from "./assets/gameover.mp3";
import gameovervideo from "./assets/aa.mp4";
import levelss from "./assets/levelup (1).svg";
import levelupaudio from "./assets/level-up-05-326133.mp3";

function App() {
  // Loader
  const [loading, setloading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setloading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);


  // Available colors
  const color = ["green", "red", "orange", "blue"];

  // Game states
  const [gameSeq, setGameSeq] = useState([]);
  const [userSeq, setUserSeq] = useState([]);
  const [colorFlash, setColorFlash] = useState("");
  const [round, setRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [boxDisable, setBoxDisable] = useState(false);
  const [activeUserColor, setActiveUserColor] = useState("");

  // UI state flags
  const [gameovers, setgameover] = useState(false);
  const [levels, setlevel] = useState(false);
  const [bonus, setbonus] = useState(false);
  const [highscore, sethighscore] = useState(0);
  const cancelAnimation = useRef(false);

  // Audio refs (initialized in useEffect)
  const sounds = useRef({
    green: null,
    red: null,
    orange: null,
    blue: null,
    levelup: null,
    gameover: null,
  });

  useEffect(() => {
    sounds.current.green = new Audio(green);
    sounds.current.red = new Audio(red);
    sounds.current.orange = new Audio(orange);
    sounds.current.blue = new Audio(blue);
    sounds.current.levelup = new Audio(levelupaudio);
    sounds.current.gameover = new Audio(gameover);
  }, []);

  // Helper to play audio with reset
  const playSound = (colorFlash) => {
    const sound = sounds.current[colorFlash];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
      sound.play();
    }
  };

  // Start a new round and animate sequence
  const randomColor = async () => {
    setIsPlaying(true);
    cancelAnimation.current = false;

    const colorIndex = Math.floor(Math.random() * 4);
    const newgameSeq = [...gameSeq, color[colorIndex]];
    setGameSeq(newgameSeq);
    setUserSeq([]);

    const newround = round + 1;
    setRound(newround);

    // Play level up animation after round 1
    if (round) {
      setlevel(true);
      playSound("levelup");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setlevel(false);
      await new Promise((resolve) => setTimeout(resolve, 200));
      // setTimeout(() => setlevel(false), 2100);
    }
    const projectedScore = highscore + 10;
    // Show bonus animation every 30 points
    if (newround > 1 && projectedScore % 30 === 0) {
      setbonus(true);
      playSound("levelup");
      sethighscore((pre) => pre + 100);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setbonus(false);
      await new Promise((resolve) => setTimeout(resolve, 200));
      // setTimeout(() => setbonus(false), 2100);
    }

    await sequenceAnimation(newgameSeq);
  };

  // Animate game sequence with flashes and sounds
  const sequenceAnimation = async (newgameSeq) => {
    setBoxDisable(true);
    for (let colorFlash of newgameSeq) {
      if (cancelAnimation.current) break;
      setColorFlash(colorFlash);
      playSound(colorFlash);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setColorFlash("");
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    setBoxDisable(false);
  };

  // Handle user input
  const handleClick = async (idx) => {
    if (!isPlaying || boxDisable) return;
    setBoxDisable(true);

    const userColor = color[idx];
    const newUserSeq = [...userSeq, userColor];
    setUserSeq(newUserSeq);

    setActiveUserColor(userColor);
    playSound(userColor);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setActiveUserColor("");

    const currentIndex = newUserSeq.length - 1;
    if (newUserSeq[currentIndex] !== gameSeq[currentIndex]) {
      playSound("gameover");
      setgameover(true);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      setgameover(false);
      reset();
      return;
    }

    if (newUserSeq.length === gameSeq.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      sethighscore((prev) => prev + 10);
      await randomColor();
    }
    setBoxDisable(false);
  };

  // Reset game state
  const reset = () => {
    cancelAnimation.current = true;
    setGameSeq([]);
    setUserSeq([]);
    setIsPlaying(false);
    setColorFlash("");
    setRound(0);
    sethighscore(0);
  };

  return (
    <>
      {loading ? (
        // Loader Screen
        <div className="h-screen w-screen bg-black flex justify-center items-center" style={{ backgroundImage: `url(${bg})` }}>
          <DotLottieReact className="size-89" src="./src/assets/Loading.lottie" loop autoplay />
        </div>
      ) : (
        <div
          className="relative min-h-screen w-full bg-no-repeat bg-cover p-10 max-sm:p-5 flex justify-center items-center"
          style={{ backgroundImage: `url(${bg})` }}
        >
          {/* Main game container */}
          <div className="h-full w-full text-white border-2 flex flex-col gap-2 p-2">

            {/* Header with title and score */}
            <div className="h-full w-full text-white border flex justify-between items-center px-10 max-lg:flex-col max-lg:p-10">
              <h1 className="text-4xl capitalize text-white font-cust max-lg:text-5xl max-sm:text-4xl text-center lg:text-6xl">simon color game</h1>
              <div className="relative px-10 py-2">
                <img src={scores} alt="" />
                <div className="absolute top-0 left-0 flex items-center justify-center text-xl h-full w-full font-cust flex-col">
                  <h1>High Score </h1>
                  <p className="text-2xl">{highscore}</p>
                </div>
              </div>
            </div>

            {/* Color buttons */}
            <div className="relative h-full w-full text-white border flex justify-center items-center gap-2 p-2">
              <div className="absolute size-14 text-2xl border bg-gray-800 rounded-full text-white flex justify-center items-center z-10">
                <h1>{round}</h1>
              </div>
              <div className="flex flex-col gap-2">
                <div className={`size-52 max-sm:size-40 transition duration-200 ease-in-out border-2 ${colorFlash === "green" ? "bg-white" : "bg-green-500"} ${activeUserColor === "green" ? "scale-95" : "scale-100"}`} onClick={() => !boxDisable && handleClick(0)}></div>
                <div className={`size-52 max-sm:size-40 transition duration-200 ease-in-out border-2 ${colorFlash === "red" ? "bg-white" : "bg-red-500"} ${activeUserColor === "red" ? "scale-95" : "scale-100"}`} onClick={() => !boxDisable && handleClick(1)}></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className={`size-52 max-sm:size-40 transition duration-200 ease-in-out border-2 ${colorFlash === "orange" ? "bg-white" : "bg-orange-300"} ${activeUserColor === "orange" ? "scale-95" : "scale-100"}`} onClick={() => !boxDisable && handleClick(2)}></div>
                <div className={`size-52 max-sm:size-40 transition duration-200 ease-in-out border-2 ${colorFlash === "blue" ? "bg-white" : "bg-blue-500"} ${activeUserColor === "blue" ? "scale-95" : "scale-100"}`} onClick={() => !boxDisable && handleClick(3)}></div>
              </div>
            </div>

            {/* Buttons for start and reset */}
            <div className="h-full w-full text-white border flex flex-col justify-center items-center gap-2">
              <div className="flex justify-center items-center gap-10">
                <button className="px-10 py-2 active:scale-95 transition-transform duration-100" onClick={randomColor} disabled={isPlaying}>
                  <img src={start} className="size-50" alt="Start" />
                </button>
                <button className="px-10 py-2 active:scale-95 transition-transform duration-100" onClick={reset}>
                  <img src={resets} alt="Reset" />
                </button>
              </div>
            </div>
          </div>

          {/* Game over overlay */}
          {gameovers && (
            <div className="absolute top-0 left-0 h-full w-full z-10 flex justify-center items-center">
              <div className="h-full w-full flex justify-center items-center">
                <DotLottieReact className="size-[300px] relative bottom-10" src="./src/assets/Game Over.lottie" loop autoplay />
              </div>
            </div>
          )}

          {/* Level up animation */}
          <AnimatePresence>
            {levels && (
              <div className="absolute top-0 left-0 h-full w-full z-10 flex justify-center items-center">
                <div className="relative h-full w-full flex justify-center items-center">
                  <motion.img initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="size-[300px]" src={levelss} alt="Level Up" />
                  <motion.h1 initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-5xl text-white absolute font-extrabold">
                    <span className="relative right-1 bottom-18">{round}</span>
                  </motion.h1>
                  <div className="absolute scale-150">
                    <DotLottieReact src="./src/assets/Confetti.lottie" loop autoplay />
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Bonus reward animation */}
          {bonus && (
            <div className="absolute top-0 left-0 h-full w-full z-10 flex justify-center items-center">
              <div className="relative h-full w-full flex justify-center items-center">
                <div className="h-full w-full relative flex flex-col items-center justify-center">
                  <div className="flex justify-center items-center relative h-full w-full bottom-13">
                    <DotLottieReact className="absolute z-10" src="./src/assets/Rewards and Discounts.lottie" loop autoplay />
                    <DotLottieReact className="absolute " src="./src/assets/Reward light effect.lottie" loop autoplay />
                    <DotLottieReact className="absolute z-20" src="./src/assets/Coin.lottie" loop autoplay />
                    <h1 className="z-50 font-cust text-4xl text-white top-20 relative">100 Pts</h1>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;
