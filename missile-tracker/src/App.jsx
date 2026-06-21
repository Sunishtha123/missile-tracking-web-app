import { useState, useEffect, useRef } from "react";

function App() {
  const [missiles, setMissiles] = useState([]);
  const [interceptors, setInterceptors] = useState([]);
  const [running, setRunning] = useState(false);
  const audioCtxRef = useRef(null);

  const playBeep = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  };

  const launchMissile = () => {
    const newMissile = {
      id: Date.now(),
      angle: Math.random() * 360,
      distance: 0,
      speed: 0.5 + Math.random(),
      type: Math.random() > 0.3 ? "ENEMY" : "FRIENDLY",
    };
    setMissiles((prev) => [...prev, newMissile]);
    playBeep();
  };

  const getThreatLevel = (m) => {
    if (m.distance > 70) return "LOW";
    if (m.distance > 30) return "MEDIUM";
    return "HIGH";
  };

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setMissiles((prev) =>
        prev
          .map((m) => ({ ...m, distance: m.distance + m.speed }))
          .filter((m) => m.distance < 100)
      );

      // Auto AI interception
      setInterceptors((prev) => {
        const newInterceptors = [...prev];

        missiles.forEach((m) => {
          if (m.type === "ENEMY" && getThreatLevel(m) === "HIGH") {
            const exists = prev.find((i) => i.targetId === m.id);
            if (!exists) {
              newInterceptors.push({
                id: Date.now() + Math.random(),
                targetId: m.id,
                angle: m.angle,
                distance: 0,
                speed: 2,
              });
            }
          }
        });

        return newInterceptors.map((i) => ({ ...i, distance: i.distance + i.speed }));
      });

      // Collision detection
      setMissiles((prevMissiles) =>
        prevMissiles.filter((m) => {
          const hit = interceptors.some(
            (i) => i.targetId === m.id && Math.abs(i.distance - m.distance) < 5
          );
          return !hit;
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [running, missiles, interceptors]);

  return (
    <div style={{ padding: "20px", backgroundColor: "#000", color: "#0f0", height: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>Advanced AI Radar Defense System</h1>

      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <button onClick={launchMissile}>Launch Object</button>
        <button onClick={() => setRunning(!running)} style={{ marginLeft: "10px" }}>
          {running ? "Pause" : "Start"}
        </button>
      </div>

      <div
        style={{
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          border: "2px solid #0f0",
          margin: "auto",
          position: "relative",
        }}
      >
        {/* Radar Zones */}
        {[100, 70, 40].map((r, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: `${r}%`,
              height: `${r}%`,
              border: "1px solid #0f0",
              borderRadius: "50%",
              top: `${(100 - r) / 2}%`,
              left: `${(100 - r) / 2}%`,
            }}
          />
        ))}

        {/* Sweep */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "conic-gradient(rgba(0,255,0,0.3), transparent)",
            borderRadius: "50%",
            animation: "spin 2s linear infinite",
          }}
        />

        {/* Missiles */}
        {missiles.map((m) => {
          const x = 200 + m.distance * Math.cos((m.angle * Math.PI) / 180);
          const y = 200 + m.distance * Math.sin((m.angle * Math.PI) / 180);

          return (
            <div
              key={m.id}
              style={{
                position: "absolute",
                width: "10px",
                height: "10px",
                backgroundColor: m.type === "ENEMY" ? "red" : "blue",
                borderRadius: "50%",
                left: `${x}px`,
                top: `${y}px`,
              }}
              title={`${m.type} | ${getThreatLevel(m)}`}
            />
          );
        })}

        {/* Interceptors */}
        {interceptors.map((i) => {
          const x = 200 + i.distance * Math.cos((i.angle * Math.PI) / 180);
          const y = 200 + i.distance * Math.sin((i.angle * Math.PI) / 180);

          return (
            <div
              key={i.id}
              style={{
                position: "absolute",
                width: "6px",
                height: "6px",
                backgroundColor: "cyan",
                borderRadius: "50%",
                left: `${x}px`,
                top: `${y}px`,
              }}
            />
          );
        })}
      </div>

      <h2>Tracking Data</h2>
      <ul>
        {missiles.map((m) => (
          <li key={m.id}>
            ID: {m.id} | Type: {m.type} | Distance: {m.distance.toFixed(1)} | Threat: {getThreatLevel(m)}
          </li>
        ))}
      </ul>

      <style>
        {`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}
      </style>
    </div>
  );
}

export default App;
