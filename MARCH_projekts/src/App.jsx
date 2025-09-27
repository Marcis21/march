import { useState, useRef, useEffect } from "react";
import "./App.css";

export default function App() {
  const [step, setStep] = useState(0); // 0=1.video, 1=Q1 overlay, 2=2.video, 3=Q2 overlay
  const [feedback, setFeedback] = useState("");
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showSecondInline, setShowSecondInline] = useState(false); // 2. jautājums zem Q1
  const videoRef = useRef(null);

  // Atjauno video, kad step mainās uz 0 vai 2
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (step === 0 || step === 2) {
      // Ja 2.video, neizmainām src, ja tas jau ir ielādēts
      if (step === 2 && v.src.includes("2.mp4")) {
        v.currentTime = 0;
      } else if (step === 0) {
        v.src = "/videos/1.mp4";
        v.currentTime = 0;
      }

      v.play().catch(() => {});
    }
  }, [step]);

  // Video beigu loģika
  const handleVideoEnd = () => {
    if (step === 0) setStep(1);        // 1. video beidzās → Q1
    else if (step === 2) {
      videoRef.current.pause();         // pauzē pēdējo kadru
      setStep(3);                       // nākamais jautājums
    }
  };

  // 1. jautājums
  const handleInitial = (isSafe) => {
    if (!isSafe) {
      setFeedback("Pareizi — netuvojies, ja sektors nav drošs, tas apdraud arī Tavu dzīvību!");
      setAnswered(true);
      setSelected(null);
      setShowSecondInline(true); // 2. jautājums zem feedback
    } else {
      setFeedback("Nepareizi — ja dosies palīgā, Tu riskē ar savu dzīvību!");
      setAnswered(true);
      setShowSecondInline(false);
    }
  };

  // 2. jautājums (tieši zem Q1)
  const handleFollowup = (choice) => {
    setSelected(choice);
    setAnswered(true);

    if (choice === "a") {
      setFeedback("Pareizi — ziņo tiešajam komandierim.");
      setShowSecondInline(false);

      // Feedback vismaz 4 sekundes, pēc tam start 2.video
      setTimeout(() => {
        setFeedback("");
        setAnswered(false);
        setSelected(null);

        if (videoRef.current) {
          videoRef.current.src = "/videos/2.mp4";
          videoRef.current.currentTime = 0;
          setStep(2); // 2. video
          videoRef.current.play().catch(() => {});
        }
      }, 4000);
    } else if (choice === "b") {
      setFeedback("Nepareizi — sastādīt 9-line ziņojumu aizņem laiku, tas apdraud cietušā dzīvību!");
    } else {
      setFeedback("Nepareizi — dot nomācošo uguni individuāli var būt pārāk riskanti, Tu atklāj savas pozīcijas.");
    }
  };

  // 3. jautājums pēc 2. video
  const handlePostVideoQuestion = (choice) => {
    setSelected(choice);
    setAnswered(true);

    if (choice === "a") {
      setFeedback("Nepareizi — sākumā (Adresāts) un tad seko (sūtītājs).");
    } else if (choice === "b") {
      setFeedback("Pareizi — (Adresāts), te (sūtītājs), (info), tad seko (stāvoklis).");
    } else {
      setFeedback("Nepareizi — nedrīkst atklāt sensitīvu informāciju - pakāpi un uzvārdu, jo frekvenci var noklausīties pretinieks.");
    }
  };

  const resetAll = () => {
    setStep(0);
    setFeedback("");
    setAnswered(false);
    setSelected(null);
    setShowSecondInline(false);

    const v = videoRef.current;
    if (v) {
      v.src = "/videos/1.mp4";
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };

  return (
    <div className="app-container">
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          className="video"
        >
          <source src={step < 2 ? "/videos/1.mp4" : "/videos/2.mp4"} type="video/mp4" />
        </video>

        {(step === 1 || step === 3) && (
          <div className="overlay">
            {feedback && (
              <p className={`feedback ${feedback.includes("Pareizi") ? "correct" : "wrong"}`}>
                {feedback}
              </p>
            )}

            {/* 1. jautājums */}
            {step === 1 && (
              <>
                {!answered && (
                  <>
                    <p>Tu redzi, ka Tavs kolēģis ir ticis ievainots. Vai steigsies viņam palīgā?</p>
                    <div className="btn-group">
                      <button className="btn" onClick={() => handleInitial(true)}>Jā</button>
                      <button className="btn" onClick={() => handleInitial(false)}>Nē</button>
                    </div>
                  </>
                )}

                {answered && showSecondInline && (
                  <>
                    <hr style={{ margin: "12px 0", borderColor: "rgba(255,255,255,0.15)" }} />
                    <p style={{ marginTop: 8 }}>Kā tu rīkosies tālāk?</p>
                    <div className="btn-column">
                      <button className="btn" onClick={() => handleFollowup("a")}>a) Ziņosi tiešajam komandierim.</button>
                      <button className="btn" onClick={() => handleFollowup("b")}>b) Sastādisi 9-line ziņojumu.</button>
                      <button className="btn" onClick={() => handleFollowup("c")}>c) Dosi nomācošo uguni, lai aizbiedētu pretinieku.</button>
                    </div>
                  </>
                )}

                {answered && !showSecondInline && (
                  <div className="btn-group" style={{ marginTop: 12 }}>
                    <button className="btn" onClick={resetAll}>Sākt no jauna</button>
                  </div>
                )}
              </>
            )}

            {/* 3. jautājums pēc 2. video */}
            {step === 3 && (
              <>
                <p>Tavs izsaukuma signāls ir Alfa, bet komadiera signāls ir Bravo, ko Tu teiksi?</p>
                <div className="btn-column">
                  <button className="btn" onClick={() => handlePostVideoQuestion("a")}>a) Alfa te Bravo, viens cietušais, nezināma lokācija, vajadzīga palīdzība.</button>
                  <button className="btn" onClick={() => handlePostVideoQuestion("b")}>b) Bravo, te Alfa. Notiek apšaude, viens cietušais, stāvoklis nezināms.</button>
                  <button className="btn" onClick={() => handlePostVideoQuestion("c")}>c) Seržant Bērziņ, viens ievainotais, lūdzu norādes kā rīkoties?</button>
                </div>

                {answered && (
                  <div className="btn-group" style={{ marginTop: 12 }}>
                    <button className="btn" onClick={resetAll}>Sākt no jauna</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
