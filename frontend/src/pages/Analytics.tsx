import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import "./Analytics.css";

interface Task {
  id: string;
  status: string;
}

const Analytics: React.FC = () => {
  const history = useHistory();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const parseJsonSafely = async (res: Response) => {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response (status ${res.status})`);
    }
  };

  const fetchTasks = () => {
    setLoading(true);
    fetch("/api/tasks")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Fetch tasks failed (status ${res.status})`);
        }
        return parseJsonSafely(res);
      })
      .then((data) => {
        if (Array.isArray(data)) setTasks(data);
        else if (data) setTasks([data]);
      })
      .catch((err) => console.error("Analytics Error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 2000);
    const onFocus = () => fetchTasks();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const counts = useMemo(() => {
    const result = { DONE: 0, IN_PROGRESS: 0, OPEN: 0 };
    tasks.forEach((task) => {
      if (task.status === "DONE") result.DONE += 1;
      else if (task.status === "IN_PROGRESS") result.IN_PROGRESS += 1;
      else result.OPEN += 1;
    });
    return result;
  }, [tasks]);

  const total = counts.DONE + counts.IN_PROGRESS + counts.OPEN;

  const percent = (value: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="analytics-header">
          <IonTitle>Performance Analytics</IonTitle>
          <IonButton
            slot="end"
            fill="clear"
            className="analytics-back-btn"
            onClick={() => history.push("/home")}
          >
            Back
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="analytics-page">
        <div className="analytics-container">
          <IonCard className="analytics-card">
            <IonCardHeader>
              Status Breakdown
            </IonCardHeader>
            <IonCardContent>
              {loading ? (
                <div className="analytics-empty">Loading...</div>
              ) : total === 0 ? (
                <div className="analytics-empty">
                  No tasks yet to measure performance.
                </div>
              ) : (
                <div className="chart">
                  <div className="chart-row">
                    <div className="chart-label">DONE</div>
                    <div className="chart-bar">
                      <div
                        className="chart-fill done"
                        style={{ width: `${percent(counts.DONE)}%` }}
                      ></div>
                    </div>
                    <div className="chart-value">
                      {counts.DONE} ({percent(counts.DONE)}%)
                    </div>
                  </div>
                  <div className="chart-row">
                    <div className="chart-label">IN PROGRESS</div>
                    <div className="chart-bar">
                      <div
                        className="chart-fill in-progress"
                        style={{ width: `${percent(counts.IN_PROGRESS)}%` }}
                      ></div>
                    </div>
                    <div className="chart-value">
                      {counts.IN_PROGRESS} ({percent(counts.IN_PROGRESS)}%)
                    </div>
                  </div>
                  <div className="chart-row">
                    <div className="chart-label">OPEN</div>
                    <div className="chart-bar">
                      <div
                        className="chart-fill open"
                        style={{ width: `${percent(counts.OPEN)}%` }}
                      ></div>
                    </div>
                    <div className="chart-value">
                      {counts.OPEN} ({percent(counts.OPEN)}%)
                    </div>
                  </div>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Analytics;
