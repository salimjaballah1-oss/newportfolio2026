import { useEffect, useState } from "react";
import "./App.css";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

async function fetchFromApi(path, options = {}) {
  return fetch(`${apiBaseUrl}${path}`, options);
}

function formatDay(day) {
  return new Date(`${day}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function App() {
  const [meal, setMeal] = useState("");
  const [calories, setCalories] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoadingEntries(true);
        const response = await fetchFromApi("/entries");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Impossible de charger l'historique.");
        }

        setEntries(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Impossible de charger l'historique.");
      } finally {
        setLoadingEntries(false);
      }
    };

    fetchEntries();
  }, []);

  const handleAnalyze = async () => {
    if (!meal.trim()) {
      setError("Veuillez entrer un repas.");
      setCalories(null);
      setAiResponse("");
      setReasoning("");
      setSaveMessage("");
      return;
    }

    setLoading(true);
    setError("");
    setSaveMessage("");
    setCalories(null);
    setAiResponse("");
    setReasoning("");

    try {
      const response = await fetchFromApi("/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meal }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setCalories(data.calories);
      setAiResponse(data.aiResponse || "");
      setReasoning(data.reasoning || "");
    } catch (err) {
      setError(err.message || "Impossible d'analyser ce repas.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (calories === null) {
      return;
    }

    setSaving(true);
    setError("");
    setSaveMessage("");

    try {
      const response = await fetchFromApi("/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meal,
          calories,
          reasoning,
          aiResponse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible d'enregistrer ce repas.");
      }

      setEntries((currentEntries) => [data, ...currentEntries]);
      setSaveMessage("Repas enregistre pour aujourd'hui.");
    } catch (err) {
      setError(err.message || "Impossible d'enregistrer ce repas.");
    } finally {
      setSaving(false);
    }
  };

  const dailyTotals = entries
    .reduce((totals, entry) => {
      const existing = totals.find((item) => item.day === entry.day);

      if (existing) {
        existing.calories += entry.calories;
      } else {
        totals.push({ day: entry.day, calories: entry.calories });
      }

      return totals;
    }, [])
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-7);

  const maxCalories = Math.max(...dailyTotals.map((item) => item.calories), 1);

  return (
    <main className="page">
      <div className="decor decor-top-left" />
      <div className="decor decor-bottom-right" />

      <section className="hero">
        <div className="hero-topbar">
          <div className="hero-badge">Nutrition simple et rapide</div>
        </div>

        <div className="hero-grid">
          <div className="hero-character">🥦</div>

          <div className="hero-copy">
            <h1>
              Track your <span>calories</span>
            </h1>
            <p>
              Decris ton repas, estime ses calories, puis enregistre-le pour
              suivre ton evolution jour apres jour.
            </p>
          </div>

          <div className="hero-character hero-character-right">🤖</div>
        </div>
      </section>

      <section className="card input-card">
        <p className="section-label">Description du repas</p>

        <div className="input-row">
          <input
            className="meal-input"
            placeholder="Ex: Sandwich omelette fromage et jus d'orange"
            value={meal}
            onChange={(event) => setMeal(event.target.value)}
          />

          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? "Analyse..." : "Estimer"}
          </button>
        </div>

        <p className="helper-text">
          Exemple: 2 tacos, une portion de frites et un coca.
        </p>

        {error && <p className="message error-message">{error}</p>}
        {saveMessage && <p className="message success-message">{saveMessage}</p>}
      </section>

      <section className="results">
        <div className="results-header">
          <p className="section-label">Calories estimees</p>
        </div>

        <div className="card result-card">
          <div className="result-copy">
            <p className="result-kicker">Estimation nutritionnelle</p>

            {calories !== null ? (
              <>
                <h2>{calories} kcal</h2>
                <p className="result-text">
                  Cela represente environ {calories} calories pour le repas
                  decrit. Tu peux l'enregistrer pour l'ajouter au suivi du jour.
                </p>
                <div className="action-row">
                  <button
                    className="save-button"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Enregistrement..." : "Enregistrer ce repas"}
                  </button>
                  <span className="today-chip">
                    Date du jour: {new Date().toLocaleDateString("fr-FR")}
                  </span>
                </div>
                {reasoning && (
                  <div className="ai-response">
                    <p className="ai-response-title">Explication de l'IA</p>
                    <p>{reasoning}</p>
                  </div>
                )}
                {aiResponse && (
                  <div className="ai-response ai-response-raw">
                    <p className="ai-response-title">Reponse brute</p>
                    <pre>{aiResponse}</pre>
                  </div>
                )}
                <div className="tip-bubble">
                  Essaie de decrire les portions et boissons pour une estimation
                  encore plus utile.
                </div>
              </>
            ) : (
              <>
                <h2>En attente</h2>
                <p className="result-text">
                  Entre un repas puis lance l'analyse pour afficher une
                  estimation ici.
                </p>
                <div className="tip-bubble">
                  Exemple utile: "un burger maison, des potatoes et une eau".
                </div>
              </>
            )}
          </div>

          <div className="result-visual" aria-hidden="true">
            <div className="visual-halo" />
            <div className="plate">🥪</div>
            <div className="floating floating-heart">💚</div>
            <div className="floating floating-fruit">🍎</div>
            <div className="floating floating-water">💧</div>
          </div>
        </div>
      </section>

      <section className="history-grid">
        <div className="card chart-card">
          <div className="results-header">
            <p className="section-label">Graphique sur 7 jours</p>
          </div>

          {dailyTotals.length > 0 ? (
            <div className="chart">
              {dailyTotals.map((item) => (
                <div className="chart-column" key={item.day}>
                  <span className="chart-value">{item.calories}</span>
                  <div className="chart-bar-wrap">
                    <div
                      className="chart-bar"
                      style={{
                        height: `${Math.max(
                          14,
                          (item.calories / maxCalories) * 180,
                        )}px`,
                      }}
                    />
                  </div>
                  <span className="chart-label">{formatDay(item.day)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">
              Aucun repas enregistre pour le moment. Enregistre ton premier
              repas pour voir le graphique apparaitre.
            </p>
          )}
        </div>

        <div className="card history-card">
          <div className="results-header">
            <p className="section-label">Historique des repas</p>
          </div>

          {loadingEntries ? (
            <p className="empty-text">Chargement de l'historique...</p>
          ) : entries.length > 0 ? (
            <div className="history-list">
              {entries.slice(0, 8).map((entry) => (
                <article className="history-item" key={entry.id}>
                  <div>
                    <p className="history-meal">{entry.meal}</p>
                    <p className="history-date">
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                  <strong className="history-calories">
                    {entry.calories} kcal
                  </strong>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-text">
              Aucun repas enregistre pour l'instant.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
