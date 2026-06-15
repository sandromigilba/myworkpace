import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlay, FiPause, FiRotateCcw, FiFlag, FiBell } from 'react-icons/fi'

export default function ClockCenter() {
  const [activeTab, setActiveTab] = useState<'digital' | 'stopwatch' | 'timer'>('digital')

  // --- TAB 1: DIGITAL CLOCK ---
  const [digitalTime, setDigitalTime] = useState(new Date())
  const [blink, setBlink] = useState(true)

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setDigitalTime(new Date())
      setBlink((b) => !b)
    }, 1000)
    return () => clearInterval(clockTimer)
  }, [])

  // --- TAB 2: STOPWATCH ---
  const [swTime, setSwTime] = useState(0) // Centiseconds (1/100s)
  const [swIsRunning, setSwIsRunning] = useState(false)
  const [swLaps, setSwLaps] = useState<number[]>([])
  const swIntervalRef = useRef<any>(null)
  const swStartRef = useRef<number>(0)
  const swAccumulatedRef = useRef<number>(0)

  const handleStartStopwatch = () => {
    if (!swIsRunning) {
      swStartRef.current = Date.now()
      swIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - swStartRef.current
        setSwTime(swAccumulatedRef.current + elapsed)
      }, 10)
      setSwIsRunning(true)
    } else {
      clearInterval(swIntervalRef.current)
      swAccumulatedRef.current = swTime
      setSwIsRunning(false)
    }
  }

  const handleResetStopwatch = () => {
    clearInterval(swIntervalRef.current)
    swAccumulatedRef.current = 0
    setSwTime(0)
    setSwLaps([])
    setSwIsRunning(false)
  }

  const handleLapStopwatch = () => {
    setSwLaps([swTime, ...swLaps])
  }

  const formatStopwatch = (timeMs: number) => {
    const centiseconds = Math.floor((timeMs % 1000) / 10);
    const seconds = Math.floor((timeMs / 1000) % 60);
    const minutes = Math.floor((timeMs / (1000 * 60)) % 60);
    const hours = Math.floor(timeMs / (1000 * 60 * 60));

    const csStr = centiseconds.toString().padStart(2, '0');
    const secStr = seconds.toString().padStart(2, '0');
    const minStr = minutes.toString().padStart(2, '0');
    const hrStr = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';

    return `${hrStr}${minStr}:${secStr}.${csStr}`;
  }

  // --- TAB 3: TIMER ---
  const [inputH, setInputH] = useState(0)
  const [inputM, setInputM] = useState(5)
  const [inputS, setInputS] = useState(0)
  const [timerTotal, setTimerTotal] = useState(300) // Total seconds
  const [timerRemaining, setTimerRemaining] = useState(300) // Remaining seconds
  const [timerIsRunning, setTimerIsRunning] = useState(false)
  const timerIntervalRef = useRef<any>(null)

  const handleStartTimer = () => {
    if (!timerIsRunning) {
      if (timerRemaining === 0) {
        // Reset to initial settings if complete
        const total = inputH * 3600 + inputM * 60 + inputS
        if (total === 0) return // Nothing to count
        setTimerTotal(total)
        setTimerRemaining(total)
      }
      
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current)
            setTimerIsRunning(false)
            playTimerAlarm()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      setTimerIsRunning(true)
    } else {
      clearInterval(timerIntervalRef.current)
      setTimerIsRunning(false)
    }
  }

  const handleResetTimer = () => {
    clearInterval(timerIntervalRef.current)
    setTimerIsRunning(false)
    const total = inputH * 3600 + inputM * 60 + inputS
    setTimerTotal(total)
    setTimerRemaining(total)
  }

  const handleApplyTimerInput = () => {
    const total = inputH * 3600 + inputM * 60 + inputS
    setTimerTotal(total)
    setTimerRemaining(total)
    if (timerIsRunning) {
      clearInterval(timerIntervalRef.current)
      setTimerIsRunning(false)
    }
  }

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Synth Beep Alarm using Web Audio API
  const playTimerAlarm = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playBeep = (delay: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + delay); // A5 pitch

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + 0.3);

        osc.start(delay);
        osc.stop(audioCtx.currentTime + delay + 0.35);
      };
      // 3 beeps
      playBeep(0);
      playBeep(0.4);
      playBeep(0.8);
    } catch (e) {
      console.error('AudioContext fail', e);
    }
  }

  // Timer SVG Circular Progress calculations
  const timerCircleProgress = timerTotal > 0 ? (timerRemaining / timerTotal) * 502.65 : 0; // 502.65 is 2 * PI * r (r=80)

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (swIntervalRef.current) clearInterval(swIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center max-w-4xl mx-auto w-full">
      {/* Switch Tabs Bar */}
      <div className="flex border-4 border-slate-800 rounded-3xl p-1 bg-white shadow-cartoon-sm shrink-0 m-1.5 mb-8 w-full max-w-lg justify-around gap-2">
        {(['digital', 'stopwatch', 'timer'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold capitalize transition-all ${
              activeTab === tab
                ? 'bg-brand-primary text-slate-800 shadow-cartoon-sm border-2 border-slate-800 scale-[1.01]'
                : 'text-slate-550 hover:bg-slate-50'
            }`}
          >
            {tab === 'digital' ? 'Jam Digital' : tab === 'stopwatch' ? 'Stopwatch' : 'Timer'}
          </button>
        ))}
      </div>

      {/* Main Content card */}
      <div className="w-full bg-white border-4 border-slate-800 rounded-[30px] p-6 sm:p-10 shadow-cartoon min-h-[400px] flex flex-col items-center justify-center m-1.5">
        <AnimatePresence mode="wait">
          {activeTab === 'digital' && (
            <motion.div
              key="digital"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-center gap-4"
            >
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Waktu Lokal Sekarang
              </span>
              
              {/* Giant Digital display - Light Blue background */}
              <div className="text-5xl sm:text-7xl md:text-8xl font-black text-slate-800 font-mono bg-blue-50 px-8 py-5 border-4 border-slate-800 rounded-3xl shadow-cartoon select-none flex items-center justify-center gap-2">
                <span>{digitalTime.getHours().toString().padStart(2, '0')}</span>
                <span className={`transition-opacity duration-300 ${blink ? 'opacity-100' : 'opacity-20'}`}>:</span>
                <span>{digitalTime.getMinutes().toString().padStart(2, '0')}</span>
                <span className={`transition-opacity duration-300 ${blink ? 'opacity-100' : 'opacity-20'}`}>:</span>
                <span className="text-brand-primary-dark text-3xl sm:text-5xl md:text-6xl self-end mb-1">
                  {digitalTime.getSeconds().toString().padStart(2, '0')}
                </span>
              </div>

              {/* Date String details */}
              <div className="mt-4">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-700 capitalize">
                  {digitalTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <p className="text-xs font-semibold text-slate-400 uppercase mt-1">
                  Semoga hari Anda menyenangkan! ☕
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'stopwatch' && (
            <motion.div
              key="stopwatch"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center gap-6"
            >
              {/* Stopwatch display - Light Blue background */}
              <div className="text-5xl sm:text-7xl font-extrabold text-slate-800 font-mono bg-blue-50 px-8 py-5 border-4 border-slate-800 rounded-3xl shadow-cartoon select-none">
                {formatStopwatch(swTime)}
              </div>

              {/* Controls */}
              <div className="flex gap-4">
                <button
                  onClick={handleStartStopwatch}
                  className={`w-14 h-14 rounded-2xl border-3 border-slate-800 flex items-center justify-center font-bold text-lg shadow-cartoon-sm hover:scale-105 transition-all ${
                    swIsRunning ? 'bg-blue-100 text-blue-700' : 'bg-brand-primary text-slate-800'
                  }`}
                >
                  {swIsRunning ? <FiPause /> : <FiPlay className="ml-1" />}
                </button>

                {swIsRunning && (
                  <button
                    onClick={handleLapStopwatch}
                    className="w-14 h-14 rounded-2xl bg-white border-3 border-slate-800 flex items-center justify-center font-bold text-lg shadow-cartoon-sm hover:scale-105 transition-all"
                  >
                    <FiFlag />
                  </button>
                )}

                <button
                  onClick={handleResetStopwatch}
                  className="w-14 h-14 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 border-3 border-slate-800 flex items-center justify-center font-bold text-lg shadow-cartoon-sm hover:scale-105 transition-all"
                >
                  <FiRotateCcw />
                </button>
              </div>

              {/* Laps List */}
              {swLaps.length > 0 && (
                <div className="w-full max-w-sm max-h-48 overflow-y-auto pr-1 flex flex-col gap-2 mt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase text-center mb-1">Catatan Putaran</h4>
                  {swLaps.map((lap, index) => {
                    const lapNumber = swLaps.length - index;
                    const prevLap = swLaps[index + 1] || 0;
                    const diff = lap - prevLap;
                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center px-4 py-2 bg-blue-50/50 border-2 border-slate-800 rounded-xl"
                      >
                        <span className="text-xs font-extrabold text-slate-550">Putaran {lapNumber}</span>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-slate-800">{formatStopwatch(lap)}</span>
                          <span className="text-[10px] text-slate-450 block font-bold">+{formatStopwatch(diff)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'timer' && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col md:flex-row items-center justify-center gap-10"
            >
              
              {/* Left: Progress Circle & Display */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-48 h-48 transform -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    strokeWidth="8"
                    stroke="#E2E8F0"
                    fill="transparent"
                  />
                  {/* Foreground Animated Ring */}
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    strokeWidth="10"
                    stroke="#60A5FA"
                    strokeDasharray={502.65}
                    strokeDashoffset={502.65 - timerCircleProgress}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-300"
                  />
                </svg>
                
                {/* Inside Circle Display text */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-slate-800 font-mono">
                    {formatTimer(timerRemaining)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                    {timerRemaining === 0 ? 'Waktu Habis!' : 'Tersisa'}
                  </span>
                </div>
              </div>

              {/* Right: Input Settings and Controls */}
              <div className="flex-1 flex flex-col gap-6 w-full max-w-sm">
                
                {/* Time Picker Controls if Timer is stopped */}
                {!timerIsRunning && (
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">Setel Timer</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Jam</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={inputH}
                          onChange={(e) => {
                            setInputH(Math.max(0, Math.min(23, Number(e.target.value))));
                            setTimeout(handleApplyTimerInput, 50);
                          }}
                          className="w-full text-center py-2 bg-blue-50 border-3 border-slate-800 rounded-xl font-bold font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Menit</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={inputM}
                          onChange={(e) => {
                            setInputM(Math.max(0, Math.min(59, Number(e.target.value))));
                            setTimeout(handleApplyTimerInput, 50);
                          }}
                          className="w-full text-center py-2 bg-blue-50 border-3 border-slate-800 rounded-xl font-bold font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Detik</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={inputS}
                          onChange={(e) => {
                            setInputS(Math.max(0, Math.min(59, Number(e.target.value))));
                            setTimeout(handleApplyTimerInput, 50);
                          }}
                          className="w-full text-center py-2 bg-blue-50 border-3 border-slate-800 rounded-xl font-bold font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Main controls button bar */}
                <div className="flex gap-4 items-center">
                  <button
                    onClick={handleStartTimer}
                    disabled={timerRemaining === 0 && inputH === 0 && inputM === 0 && inputS === 0}
                    className={`flex-1 py-3 px-6 rounded-2xl border-3 border-slate-800 font-bold text-sm flex items-center justify-center gap-2 shadow-cartoon-sm hover:scale-105 active:scale-95 transition-all ${
                      timerIsRunning ? 'bg-blue-100 text-blue-700' : 'bg-brand-primary text-slate-855'
                    }`}
                  >
                    {timerIsRunning ? (
                      <>
                        <FiPause /> Pause
                      </>
                    ) : (
                      <>
                        <FiPlay /> Mulai
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleResetTimer}
                    className="p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 border-3 border-slate-800 shadow-cartoon-sm hover:scale-105 active:scale-95 transition-all"
                  >
                    <FiRotateCcw className="w-5 h-5" />
                  </button>
                </div>

                {/* Web audio beep alert details indicator */}
                <div className="flex items-center gap-2 text-slate-400">
                  <FiBell className="stroke-[2.5] w-4 h-4 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Alarm bunyi saat hitung mundur selesai
                  </span>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
