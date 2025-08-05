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
import levelss from "./assets/levelup (1).svg";
import levelupaudio from "./assets/level-up-05-326133.mp3";

import gameovergif from "/original-a561071bde0f97f338014ce847a37f1c.gif";



function App() {
  // Loader
  const [loading, setloading] = useState(true);
  useEffect(() => {
    const loadImages = () => {
      const imageSources = [bg, start, resets, scores, levelss, gameovergif];
      const promises = imageSources.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });
      return Promise.all(promises);
    };

    const loadAudios = () => {
      const audioSources = [green, red, orange, blue, levelupaudio, gameover];
      const promises = audioSources.map((src) => {
        return new Promise((resolve, reject) => {
          const audio = new Audio();
          audio.src = src;
          audio.oncanplaythrough = resolve;
          audio.onerror = reject;
        });
      });
      return Promise.all(promises);
    };

    const loadAll = async () => {
      try {
        await Promise.all([
          loadImages(),
          loadAudios(),
          new Promise((resolve) => setTimeout(resolve, 5000)),
        ]);
        setloading(false);
      } catch (error) {
        console.error("Asset loading error:", error);
        setloading(false);
      }
    };

    loadAll();
  }, []);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

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
  const [showInstructions, setShowInstructions] = useState(false);


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
      await delay(1000);
      setlevel(false);
      await delay(200);

    }
    const projectedScore = highscore + 10;
    // Show bonus animation every 40 points
    if (newround > 1 && projectedScore % 40 === 0) {
      setbonus(true);
      playSound("levelup");
      sethighscore((pre) => pre + 100);
      await delay(4000);
      setbonus(false);
      await delay(200);
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
      await delay(1000);
      setColorFlash("");
      await delay(400);
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
    await delay(400);
    setActiveUserColor("");

    const currentIndex = newUserSeq.length - 1;
    if (newUserSeq[currentIndex] !== gameSeq[currentIndex]) {
      playSound("gameover");
      setgameover(true);
      await delay(5000);
      setgameover(false);
      reset();
      return;
    }

    if (newUserSeq.length === gameSeq.length) {
      await delay(1000);
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
        <div className="h-screen w-screen bg-white flex justify-center items-center" >
          <DotLottieReact className="size-89" src="/games icon.lottie" loop autoplay />
        </div>
      ) : (
        <div
          className="relative min-h-screen w-full bg-no-repeat bg-cover p-10 max-sm:p-5 flex justify-center items-center overflow-hidden"
          style={{ backgroundImage: `url(${bg})` }}
        >
          {/* Main game container */}
          <div className="h-full w-full text-white  flex flex-col gap-2 p-2">

            {/* Header with title and score */}
            <div className="h-full w-full text-white flex justify-between items-center px-10 max-lg:flex-col max-lg:p-10">
              <h1 className="capitalize text-white font-cust max-lg:text-4xl max-sm:text-4xl text-center lg:text-5xl">simon color game</h1>
              <div className="relative px-10 py-2">
                <img src={scores} alt="" />
                <div className="absolute top-0 left-0 flex items-center justify-center sm:text-xl h-full w-full font-cust flex-col xs:text-[15px]">
                  <h1>High Score </h1>
                  <p className="sm:text-2xl xs:text-[15px]">{highscore}</p>
                </div>
              </div>
            </div>

            {/* Color buttons */}
            <div className="relative h-full w-full text-white flex justify-center items-center gap-2 p-2">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute size-14 sm:text-2xl xs:text-[18px] border bg-gray-800 rounded-full text-white flex justify-center items-center z-10">
                <h1>{round}</h1>
              </motion.div>
              <div className="flex flex-col gap-2">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`xs:size-40  sm:size-40 md:size-52  transition duration-200 ease-in-out border-2 ${colorFlash === "green" ? "bg-white" : "bg-green-500"} ${activeUserColor === "green" ? "scale-95" : "scale-100"}`} onClick={() => !boxDisable && handleClick(0)}></motion.div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`xs:size-40  sm:size-40 md:size-52  transition duration-200 ease-in-out border-2 ${colorFlash === "red" ? "bg-white" : "bg-red-500"} ${activeUserColor === "red" ? "scale-95" : "scale-100"}`} onClick={() => !boxDisable && handleClick(1)}></motion.div>
              </div>
              <div className="flex flex-col gap-2">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`xs:size-40  sm:size-40 md:size-52  transition duration-200 ease-in-out border-2 ${colorFlash === "orange" ? "bg-white" : "bg-orange-400"} ${activeUserColor === "orange" ? "scale-95" : "scale-100"}`} onClick={() => !boxDisable && handleClick(2)}></motion.div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`xs:size-40  sm:size-40 md:size-52  transition duration-200 ease-in-out border-2 ${colorFlash === "blue" ? "bg-white" : "bg-blue-500"} ${activeUserColor === "blue" ? "scale-95" : "scale-100"}`} onClick={() => !boxDisable && handleClick(3)}></motion.div>
              </div>
            </div>

            {/* Buttons for start and reset */}
            <div className="h-full w-full text-white  flex flex-col justify-center items-center gap-2">
              <div className="flex justify-center items-center gap-10">
                <button className="px-10 py-2 active:scale-95 transition-transform duration-100" onClick={randomColor} disabled={isPlaying}>
                  <img src={start} className="size-50" alt="Start" />
                </button>
                <button className="px-10 py-2 active:scale-95 transition-transform duration-100" onClick={reset}>
                  <img src={resets} alt="Reset" />
                </button>
                <button
                  className="px-10 py-2 active:scale-95 transition-transform duration-100 flex justify-center items-center"
                  onClick={() => setShowInstructions(true)}
                >
                  <DotLottieReact className="size-[100px]" src="/Notification Bell.lottie" loop autoplay />
                </button>

              </div>
            </div>
          </div>

          {/* Game over overlay */}
          {gameovers && (
            <div className="absolute top-0 left-0 h-full w-full z-10 flex justify-center items-center">
              <div className="h-full w-full flex justify-center items-center">
                <DotLottieReact className="size-[400px] relative bottom-10 max-sm:hidden" src="/Game Over.lottie" loop autoplay />
                <img src={gameovergif} className="h-full w-full sm:hidden" alt="" />
              </div>
            </div>
          )}

          {/* Level up animation */}
          <AnimatePresence>
            {levels && (
              <div className="absolute top-0 left-0 h-full w-full z-10 flex justify-center items-center">
                <div className="relative h-full w-full flex justify-center items-center">
                  <motion.img initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="size-[300px]" src={levelss} alt="Level Up" />
                  <motion.h1 initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-4xl text-white absolute font-extrabold">
                    <span className="relative right-1 bottom-18">{round}</span>
                  </motion.h1>
                  <div className="absolute scale-150">
                    <DotLottieReact src="/Confetti.lottie" loop autoplay />
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
                    <DotLottieReact className="absolute z-10" src="/Rewards and Discounts.lottie" loop autoplay />
                    <DotLottieReact className="absolute " src="/Reward light effect.lottie" loop autoplay />
                    <DotLottieReact className="absolute z-20" src="/Coin.lottie" loop autoplay />
                    <h1 className="z-50 font-cust text-4xl text-white top-20 relative">100 Pts</h1>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instruction Section */}
          <AnimatePresence>
            {showInstructions && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="fixed inset-0 z-50 bg-opacity-70 flex items-center justify-center px-4 sm:px-6">
                <div className="bg-white text-black rounded-xl w-full max-w-lg p-5 sm:p-8 shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl sm:text-2xl font-bold text-center font-cust">How to Play</h2>
                  <ul className="list-disc list-inside text-sm sm:text-base space-y-2">
                    <li>
                      Click the <strong>▶ Start</strong> button to begin the game.
                    </li>
                    <li>
                      Watch the sequence of flashing colors.
                    </li>
                    <li>
                      Repeat the sequence by clicking the colors in the same order.
                    </li>
                    <li>
                      Each correct round earns <strong>10 points</strong>.
                    </li>
                    <li>
                      Bonus animations appear every few levels (with extra points!).
                    </li>
                    <li>
                      The game ends if you click the wrong color.
                    </li>
                    <li>
                      Press <strong>🔄 Reset</strong> to restart the game anytime.
                    </li>
                  </ul>
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowInstructions(false)}
                      className="mt-4 px-6 py-2 text-sm sm:text-base bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Got it!
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>


        </div>
      )}
    </>
  );
}

export default App;
