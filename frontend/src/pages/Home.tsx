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
  IonDatetimeButton,
  IonModal,
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
import { useEffect, useState } from "react";
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
  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");

  // 1. حالات الـ Dark Mode والحذف
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // 2. كشف وتطبيق الـ Dark Mode
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

  useEffect(() => {
    fetchTasks();
  }, [searchText, filterStatus, filterPriority]);

  const fetchTasks = () => {
    const params = new URLSearchParams();
    if (searchText) params.append("search", searchText);
    if (filterStatus) params.append("status", filterStatus);
    if (filterPriority) params.append("priority", filterPriority);

    const url = `/api/tasks?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("Filter Error:", err));
  };

  const handleAddTask = () => {
    if (!text) return;
    const newTask = {
      title: text,
      description: textDescription,
      deadline: deadline,
      priority: newPriority || "LOW",
    };

    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    })
      .then((res) => res.json())
      .then((res) => setTasks([res, ...tasks]));

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
      .then((res) => res.json())
      .then((task) => {
        const newArray = tasks.map((i) => (i.id === id ? task : i));
        setTasks(newArray);
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
                    debounce={500}
                    onIonChange={(e) => setSearchText(e.detail.value!)}
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
                  <IonItem lines="none" className="input-item">
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
                      >
                        <IonDatetimeButton datetime="datetime"></IonDatetimeButton>
                        <IonModal
                          keepContentsMounted={true}
                          className="date-background-blur"
                        >
                          <IonDatetime
                            id="datetime"
                            presentation="date"
                            className="date-background-blur"
                            onIonChange={(e) =>
                              setDeadline(e.detail.value as string)
                            }
                          ></IonDatetime>
                        </IonModal>
                      </IonItem>
                    </IonCol>
                  </IonRow>

                  <IonButton
                    expand="block"
                    className="add-btn"
                    onClick={handleAddTask}
                    disabled={!text}
                  >
                    <IonIcon icon={add} slot="start" /> Add Task
                  </IonButton>
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
                      <IonCard className="task-card">
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
