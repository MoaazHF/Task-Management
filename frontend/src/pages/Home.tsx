import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
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
} from "@ionic/react";
import { close, closeCircle, create, prismSharp, trash } from "ionicons/icons";
import { useEffect, useState } from "react";

const Home: React.FC = () => {
  interface Task {
    id: string;
    title: string;
    description: string;
    status: string;
    deadline: Date;
    priority: string;
  }

  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState<string>("");
  const [textDescription, setTextDescription] = useState<string>("");
  const [newPriority, setNewPriority] = useState<string>();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<string>();
  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
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
      priority: newPriority,
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
    setNewPriority("");
    setDeadline("");
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

  const getColorPriority = (priority: string) => {
    if (priority === "HIGH") return "red";
    if (priority === "MEDIUM") return "orange";
    if (priority === "LOW") return "green";
    return "#888";
  };
  const getColorStatus = (status: string) => {
    if (status === "OPEN") return "red";
    if (status === "IN_PROGRESS") return "orange";
    if (status === "DONE") return "green";
    return "#888";
  };

  return (
    <IonPage className="center-div">
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            Todo <span className="text-color">RobinFood</span>
          </IonTitle>
          {/* Search Bar */}
          <IonSearchbar
            value={searchText}
            debounce={500}
            onIonChange={(e) => setSearchText(e.detail.value!)}
            placeholder="Search tasks..."
          ></IonSearchbar>

          {/* Filter Controls Row */}
          <IonGrid>
            <IonRow>
              {/* 1. Status Filter */}
              <IonCol size="6">
                <IonItem lines="none">
                  <IonSelect
                    interface="popover"
                    placeholder="All Statuses"
                    value={filterStatus}
                    onIonChange={(e) => setFilterStatus(e.detail.value)}
                  >
                    <IonSelectOption value="">All Statuses</IonSelectOption>
                    <IonSelectOption value="OPEN">Open</IonSelectOption>
                    <IonSelectOption value="IN_PROGRESS">
                      In Progress
                    </IonSelectOption>
                    <IonSelectOption value="DONE">Done</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonCol>

              {/* 2. Priority Filter */}
              <IonCol size="6">
                <IonItem lines="none">
                  <IonSelect
                    interface="popover"
                    placeholder="All Priorities"
                    value={filterPriority}
                    onIonChange={(e) => setFilterPriority(e.detail.value)}
                  >
                    <IonSelectOption value="">All Priorities</IonSelectOption>
                    <IonSelectOption value="LOW">Low</IonSelectOption>
                    <IonSelectOption value="MEDIUM">Medium</IonSelectOption>
                    <IonSelectOption value="HIGH">High</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* Input Area */}
        <IonGrid className="input-fields">
          <IonRow>
            <IonCol sizeLg="12" size="3" sizeMd="4" sizeSm="6" sizeXs="12">
              <IonInput
                className="IonInput"
                value={text}
                placeholder="What needs to be done?"
                onIonInput={(e) => setText(e.detail.value!)}
              />
            </IonCol>
            <IonCol sizeLg="12" size="3" sizeMd="4" sizeSm="6" sizeXs="12">
              <IonInput
                value={textDescription}
                placeholder="Write The Description"
                onIonInput={(e) => setTextDescription(e.detail.value!)}
                className="IonInput"
              />
            </IonCol>
            <IonCol sizeLg="12" size="3" sizeMd="4" sizeSm="6" sizeXs="12">
              <h2 className="text-color-deadline">Enter The Deadline</h2>
              <IonDatetime
                className="IonInput"
                presentation="date"
                onIonChange={(e) => {
                  setDeadline(e.detail.value as string);
                }}
              ></IonDatetime>
            </IonCol>
            <IonCol
              sizeLg="12"
              size="3"
              sizeMd="4"
              sizeSm="6"
              sizeXs="12"
              className="btn-div"
            >
              <IonSelect
                className="IonInput"
                interface="popover"
                id="select-label"
                value={newPriority}
                placeholder="Choose the task priority"
                onIonChange={(e) => {
                  console.log(e.detail.value);
                  setNewPriority(e.detail.value as string);
                }}
              >
                <IonSelectOption value={"LOW"}>low</IonSelectOption>
                <IonSelectOption value={"MEDIUM"}>MEDIUM</IonSelectOption>
                <IonSelectOption value={"HIGH"}>HIGH</IonSelectOption>
              </IonSelect>
              <IonButton onClick={() => handleAddTask()} className="btn">
                +
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Task List */}
        <IonList>
          {tasks.map((task) => (
            <div className="card-space" key={task.id}>
              <div className="card-text-color ">
                <div className="card-text-color ">
                  <h1>
                    Title: <span style={{ color: "white" }}>{task.title}</span>
                  </h1>
                  Description:
                  <span style={{ color: "white" }}> {task.description}</span>
                  <p style={{ color: "#888" }}>{}</p>
                  <p>
                    Priority:&nbsp;&nbsp;
                    <span style={{ color: getColorPriority(task.priority) }}>
                      {task.priority}{" "}
                    </span>
                  </p>
                  <p>
                    Status:&nbsp;&nbsp;
                    <span style={{ color: getColorStatus(task.status) }}>
                      {task.status}{" "}
                    </span>
                  </p>
                </div>

                <div className="button-div">
                  <IonButton
                    fill="clear"
                    onClick={() => setSelectedTaskId(task.id)}
                    className="btn-create"
                  >
                    <IonIcon icon={create} size="large" />
                  </IonButton>
                  <IonButton
                    onClick={() => handleDelete(task.id)}
                    className="btn-delete"
                  >
                    <IonIcon icon={closeCircle} size="large">
                      {" "}
                    </IonIcon>
                  </IonButton>
                </div>
              </div>
            </div>
          ))}
        </IonList>
        <IonAlert
          className="ion-alert"
          isOpen={!!selectedTaskId}
          onDidDismiss={() => setSelectedTaskId(null)}
          header="Update Status"
          message="Change task status"
          inputs={[
            { label: "🔴Open", type: "radio", value: "OPEN" },
            { label: "🟡In Progress", type: "radio", value: "IN_PROGRESS" },
            { label: "🟢Done", type: "radio", value: "DONE" },
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
      </IonContent>
    </IonPage>
  );
};

export default Home;
