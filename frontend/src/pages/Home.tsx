import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonDatetime,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert,
  IonSelect,
  IonSelectOption,
  IonSearchbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonBadge,
  IonChip,
  IonLabel,
  IonButtons,
  ScrollDetail,
} from "@ionic/react";
import {
  create,
  calendarOutline,
  add,
  trash,
  moon,
  sunny,
} from "ionicons/icons";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Home.css";

const Home: React.FC = () => {
  interface Task {
    id: string;
    title: string;
    description: string;
    status: string;
    deadline: Date;
    priority: string;
  }
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState<string>("");
  const [textDescription, setTextDescription] = useState<string>("");
  const [newPriority, setNewPriority] = useState<string>();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<string>();
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [typedMessage, setTypedMessage] = useState<string>("");
  const fullMessage = "Hello RobinFood Team! I hope you have a good day! <3";

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const statusCounts = useMemo(() => {
    const result = { DONE: 0, IN_PROGRESS: 0, OPEN: 0 };
    tasks.forEach((task) => {
      if (task.status === "DONE") result.DONE += 1;
      else if (task.status === "IN_PROGRESS") result.IN_PROGRESS += 1;
      else result.OPEN += 1;
    });
    return result;
  }, [tasks]);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(prefersDark.matches);
    toggleBodyClass(prefersDark.matches);

    const listener = (mediaQuery: MediaQueryListEvent) => {
      setIsDarkMode(mediaQuery.matches);
      toggleBodyClass(mediaQuery.matches);
    };

    prefersDark.addEventListener("change", listener);
    return () => prefersDark.removeEventListener("change", listener);
  }, []);

  const toggleBodyClass = (shouldBeDark: boolean) => {
    document.body.classList.toggle("dark", shouldBeDark);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    toggleBodyClass(newMode);
  };

  const formatDateLabel = (value?: string) => {
    if (!value) return "Select Deadline";
    const normalized = value.includes("T") ? value : `${value}T00:00:00`;
    return new Date(normalized).toLocaleDateString();
  };

  const parseJsonSafely = async (res: Response) => {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response (status ${res.status})`);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [searchText, filterStatus, filterPriority]);

  useEffect(() => {
    let index = 0;
    setTypedMessage("");
    const interval = setInterval(() => {
      index += 1;
      setTypedMessage(fullMessage.slice(0, index));
      if (index >= fullMessage.length) {
        clearInterval(interval);
      }
    }, 110);
    return () => clearInterval(interval);
  }, [fullMessage]);

  const fetchTasks = () => {
    const params = new URLSearchParams();
    if (searchText) params.append("search", searchText);
    if (filterStatus) params.append("status", filterStatus);
    if (filterPriority) params.append("priority", filterPriority);

    const url = `/api/tasks?${params.toString()}`;

    fetch(url)
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
      .catch((err) => console.error("Filter Error:", err));
  };

  const handleAddTask = () => {
    const isValid =
      text.trim().length > 0 &&
      textDescription.trim().length > 0 &&
      !!newPriority &&
      !!deadline;
    if (!isValid) return;
    const newTask = {
      title: text,
      description: textDescription,
      priority: newPriority || "LOW",
      deadline: deadline,
    };

    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Add task failed (status ${res.status})`);
        }
        return parseJsonSafely(res);
      })
      .then((task) => {
        if (task) setTasks([task, ...tasks]);
      })
      .catch((err) => console.error("Add task error:", err));

    setText("");
    setTextDescription("");
    setNewPriority(undefined);
    setDeadline(undefined);
  };

  const handleUpdate = (
    id: string,
    newStatus: string,
    newPriority?: string,
  ) => {
    const updatedTask: any = { status: newStatus };
    if (newPriority) updatedTask.priority = newPriority;

    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Update task failed (status ${res.status})`);
        }
        return parseJsonSafely(res);
      })
      .then((task) => {
        if (task) {
          const newArray = tasks.map((i) => (i.id === id ? task : i));
          setTasks(newArray);
        }
      })
      .catch((err) => console.log(`Error updating task ${id}`, err));
  };

  const handleDelete = (id: string) => {
    fetch(`/api/tasks/${id}`, { method: "DELETE" })
      .then(() => {
        setTasks(tasks.filter((task) => task.id !== id));
      })
      .catch((err) => console.error(`Error deleting task ${id}`, err));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "danger";
      case "MEDIUM":
        return "warning";
      case "LOW":
        return "success";
      default:
        return "medium";
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "primary";
      case "IN_PROGRESS":
        return "tertiary";
      case "DONE":
        return "success";
      default:
        return "medium";
    }
  };
  const handleScroll = (ev: CustomEvent<ScrollDetail>) => {
    const currentY = ev.detail.scrollTop;

    if (currentY < 0) return;

    if (Math.abs(currentY - lastScrollY) < 50) return;

    if (currentY > lastScrollY && currentY > 60) {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }

    setLastScrollY(currentY);
  };

  const totalStatus =
    statusCounts.DONE + statusCounts.IN_PROGRESS + statusCounts.OPEN;
  const percent = (value: number) => {
    if (totalStatus === 0) return 0;
    return Math.round((value / totalStatus) * 100);
  };

  //I have Updated the UI using Ai , because i concern about styling not just the app functionality, i have added some animations and transitions to make the app more smooth and modern, also i have added a dark mode toggle button to switch between light and dark themes, and i have added a confirmation alert before deleting a task to prevent accidental deletions, i have also added a search bar and filters for status and priority to make it easier for users to find specific tasks, and i have made the header hide on scroll down and show on scroll up for better user experience on mobile devices.
  return (
    <IonPage>
      <IonContent
        className="page-background"
        scrollEvents={true}
        onIonScroll={handleScroll}
      >
        {" "}
        <IonHeader
          className={`ion-no-border ${showHeader ? "" : "header-hidden"}`}
        >
          {" "}
          <IonToolbar className="custom-header-toolbar">
            <IonTitle className="app-title">
              Todo App <span className="highlight-text">RobinFood</span>
            </IonTitle>

            <IonButtons slot="end">
              <IonButton onClick={toggleTheme} className="theme-toggle-btn">
                <IonIcon
                  icon={isDarkMode ? sunny : moon}
                  style={{
                    fontSize: "1.4rem",
                    color: isDarkMode ? "#ffeb3b" : "#6c5ce7",
                  }}
                />
              </IonButton>
            </IonButtons>
          </IonToolbar>
          <IonToolbar className="filter-toolbar">
            <IonGrid>
              <IonRow className="ion-align-items-center ion-justify-content-center">
                <IonCol size="12">
                  <IonSearchbar
                    value={searchText}
                    debounce={0}
                    onIonInput={(e) => setSearchText(e.detail.value!)}
                    placeholder="Search tasks..."
                    className="custom-searchbar"
                  ></IonSearchbar>
                </IonCol>

                <IonCol size="6">
                  <IonSelect
                    interface="popover"
                    placeholder="Status"
                    value={filterStatus}
                    onIonChange={(e) => setFilterStatus(e.detail.value)}
                    className="filter-select"
                    fill="outline"
                    shape="round"
                  >
                    <IonSelectOption value="">All Status</IonSelectOption>
                    <IonSelectOption value="OPEN">Open</IonSelectOption>
                    <IonSelectOption value="IN_PROGRESS">
                      In Progress
                    </IonSelectOption>
                    <IonSelectOption value="DONE">Done</IonSelectOption>
                  </IonSelect>
                </IonCol>

                <IonCol size="6">
                  <IonSelect
                    interface="popover"
                    placeholder="Priority"
                    value={filterPriority}
                    onIonChange={(e) => setFilterPriority(e.detail.value)}
                    className="filter-select"
                    fill="outline"
                    shape="round"
                  >
                    <IonSelectOption value="">All Priority</IonSelectOption>
                    <IonSelectOption value="LOW">Low</IonSelectOption>
                    <IonSelectOption value="MEDIUM">Medium</IonSelectOption>
                    <IonSelectOption value="HIGH">High</IonSelectOption>
                  </IonSelect>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonToolbar>
        </IonHeader>{" "}
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol sizeMd="8" sizeLg="6" sizeXs="12">
              <div
                className="typing-message typing-message--above-inputs"
                aria-live="polite"
              >
                {typedMessage}
                <span className="typing-cursor" aria-hidden="true">
                  |
                </span>
              </div>
              <IonCard className="input-card">
                <IonCardContent>
                  <IonItem lines="none" className="input-item">
                    <IonInput
                      value={text}
                      placeholder="What needs to be done?"
                      onIonInput={(e) => setText(e.detail.value!)}
                      style={{ fontWeight: "bold" }}
                    />
                  </IonItem>
                  <IonItem lines="none" className="input-item ion-margin-top">
                    <IonInput
                      value={textDescription}
                      placeholder="Add details..."
                      onIonInput={(e) => setTextDescription(e.detail.value!)}
                    />
                  </IonItem>

                  <IonRow className="ion-margin-top">
                    <IonCol size="6">
                      <IonSelect
                        interface="popover"
                        value={newPriority}
                        placeholder="Priority"
                        onIonChange={(e) =>
                          setNewPriority(e.detail.value as string)
                        }
                        fill="solid"
                        label="Priority"
                        labelPlacement="stacked"
                        className="input-item"
                        style={{ margin: 0 }}
                      >
                        <IonSelectOption value="LOW">Low</IonSelectOption>
                        <IonSelectOption value="MEDIUM">Medium</IonSelectOption>
                        <IonSelectOption value="HIGH">High</IonSelectOption>
                      </IonSelect>
                    </IonCol>
                    <IonCol size="6">
                      <IonItem
                        lines="none"
                        style={{ "--background": "transparent", padding: 0 }}
                        button
                        onClick={() => setIsDateOpen((v) => !v)}
                      >
                        <IonLabel>{formatDateLabel(deadline)}</IonLabel>
                      </IonItem>
                      {isDateOpen && (
                        <IonDatetime
                          id="datetime"
                          presentation="date"
                          value={deadline}
                          showDefaultButtons={false}
                          onIonChange={(e) => {
                            const raw = e.detail.value as string;
                            const dateOnly = raw ? raw.split("T")[0] : raw;
                            setDeadline(dateOnly);
                            setIsDateOpen(false);
                          }}
                        ></IonDatetime>
                      )}
                    </IonCol>
                  </IonRow>

                  <IonButton
                    expand="block"
                    className="add-btn"
                    onClick={handleAddTask}
                    disabled={
                      !text.trim() ||
                      !textDescription.trim() ||
                      !newPriority ||
                      !deadline
                    }
                  >
                    <IonIcon icon={add} slot="start" /> Add Task
                  </IonButton>
                </IonCardContent>
              </IonCard>
              <IonCard className="analytics-card">
                <IonCardHeader>Performance (By Status)</IonCardHeader>
                <IonCardContent>
                  {tasks.length === 0 ? (
                    <div className="analytics-empty">
                      No tasks yet to measure performance.
                    </div>
                  ) : (
                    <div className="hchart">
                      <div className="hchart-legend">
                        <span className="legend-item done">DONE</span>
                        <span className="legend-item in-progress">
                          IN PROGRESS
                        </span>
                        <span className="legend-item open">OPEN</span>
                      </div>
                      <div className="hchart-grid">
                        <div className="hchart-row">
                          <div className="hchart-label">DONE</div>
                          <div className="hchart-bars">
                            <div
                              className="hbar done"
                              style={{
                                width: `${percent(statusCounts.DONE)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="hchart-value">
                            {statusCounts.DONE} ({percent(statusCounts.DONE)}%)
                          </div>
                        </div>
                        <div className="hchart-row">
                          <div className="hchart-label">IN PROGRESS</div>
                          <div className="hchart-bars">
                            <div
                              className="hbar in-progress"
                              style={{
                                width: `${percent(
                                  statusCounts.IN_PROGRESS,
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <div className="hchart-value">
                            {statusCounts.IN_PROGRESS} (
                            {percent(statusCounts.IN_PROGRESS)}%)
                          </div>
                        </div>
                        <div className="hchart-row">
                          <div className="hchart-label">OPEN</div>
                          <div className="hchart-bars">
                            <div
                              className="hbar open"
                              style={{
                                width: `${percent(statusCounts.OPEN)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="hchart-value">
                            {statusCounts.OPEN} ({percent(statusCounts.OPEN)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow className="ion-justify-content-center">
            <IonCol sizeMd="8" sizeLg="6" sizeXs="12">
              <div className="task-list">
                <AnimatePresence>
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      layout
                      className="motion-wrapper"
                    >
                      <IonCard
                        className={`task-card ${
                          task.status === "DONE"
                            ? "is-done"
                            : task.status === "IN_PROGRESS"
                              ? "is-in-progress"
                              : ""
                        }`}
                      >
                        <IonCardHeader>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <IonCardSubtitle>
                              <IonBadge color={getPriorityColor(task.priority)}>
                                {task.priority}
                              </IonBadge>
                            </IonCardSubtitle>
                            <IonChip
                              outline
                              color={getStatusColor(task.status)}
                              className="status-chip"
                            >
                              <IonLabel>
                                {task.status.replace("_", " ")}
                              </IonLabel>
                            </IonChip>
                          </div>
                          <h2 className="task-title">{task.title}</h2>
                        </IonCardHeader>

                        <IonCardContent>
                          <p className="task-desc">
                            {task.description || "No description."}
                          </p>

                          {task.deadline && (
                            <div className="deadline-badge">
                              <IonIcon icon={calendarOutline} />
                              <span>
                                {new Date(task.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          <div
                            className="card-actions"
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              marginTop: "10px",
                            }}
                          >
                            <IonButton
                              fill="clear"
                              className="glass-btn edit"
                              onClick={() => setSelectedTaskId(task.id)}
                            >
                              <IonIcon icon={create} slot="icon-only" />
                            </IonButton>

                            <IonButton
                              fill="clear"
                              className="glass-btn delete"
                              onClick={() => setTaskToDelete(task.id)}
                            >
                              <IonIcon icon={trash} slot="icon-only" />
                            </IonButton>
                          </div>
                        </IonCardContent>
                      </IonCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonAlert
          className="custom-alert"
          isOpen={!!selectedTaskId}
          onDidDismiss={() => setSelectedTaskId(null)}
          header="Update Status"
          inputs={[
            { label: "Open", type: "radio", value: "OPEN" },
            { label: "In Progress", type: "radio", value: "IN_PROGRESS" },
            { label: "Done", type: "radio", value: "DONE" },
          ]}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => setSelectedTaskId(null),
            },
            {
              text: "Update",
              handler: (data) => {
                if (selectedTaskId && data) {
                  handleUpdate(selectedTaskId, data, undefined);
                }
              },
            },
          ]}
        />
        <IonAlert
          className="custom-alert delete-alert"
          isOpen={!!taskToDelete}
          onDidDismiss={() => setTaskToDelete(null)}
          header="Confirm Delete"
          message="Are you sure you want to delete this task? This action cannot be undone."
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              cssClass: "alert-cancel-btn",
              handler: () => setTaskToDelete(null),
            },
            {
              text: "Delete",
              role: "confirm",
              cssClass: "alert-delete-btn",
              handler: () => {
                if (taskToDelete) {
                  handleDelete(taskToDelete);
                }
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
