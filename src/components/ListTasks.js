import React, { useEffect, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import toast from 'react-hot-toast';
import { FcCancel, FcLikePlaceholder } from 'react-icons/fc';
import { IoIosRemoveCircleOutline } from "react-icons/io";

function ListTasks({ tasks, setTasks }) {
  const [todos, setTodos] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [closed, setClosed] = useState([]);

  useEffect(() => {
    const fTodos = tasks.filter(task => task.status === "todo");
    const fInProgress = tasks.filter(task => task.status === "inProgress");
    const fClosed = tasks.filter(task => task.status === "closed");

    setTodos(fTodos);
    setInProgress(fInProgress);
    setClosed(fClosed);
  }, [tasks]);

  const statuses = ["todo", "inProgress", "closed"];

  return (
    <div className='flex gap-16'>
      {statuses.map((status, index) => (
        <Section
          key={index}
          status={status}
          tasks={tasks}
          setTasks={setTasks}
          todos={todos}
          inProgress={inProgress}
          closed={closed}
        />
      ))}
    </div>
  );
}

export default ListTasks;

const Section = ({ status, tasks, setTasks, todos, inProgress, closed }) => {

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item) => addItemToSection(item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  let text = "ToDo";
  let bg = "bg-zinc-500";
  let tasksToMap = todos;

  if (status === "inProgress") {
    text = "In Progress";
    bg = "bg-fuchsia-500";
    tasksToMap = inProgress;
  }

  if (status === "closed") {
    text = "Closed";
    bg = "bg-pink-500";
    tasksToMap = closed;
  }
  const addItemToSection = (id) => {
    setTasks((prev) => {
      const mTasks = prev.map(t => {
        if (t.id === id) {
          return { ...t, status: status }
        }
        return t;
      })
      localStorage.setItem("tasks", JSON.stringify(mTasks))
      toast("Task status changed", { icon: <FcLikePlaceholder /> })
      return mTasks;
    })
  };

  return (
    <div className={`w-64 p-2 ${isOver ? "bg-gray-500 bg-opacity-25 rounded-md transition-all ease-in-out " : ""}`} ref={drop}>
      <Header text={text} bg={bg} count={tasksToMap.length} />
      {tasksToMap.length > 0 &&
        tasksToMap.map((task, index) => (
          <Task
            key={task.id}
            tasks={tasks}
            setTasks={setTasks}
            task={task}
            index={index}
            status={status}
            bg={bg}
          />
        ))}
    </div>
  );
}

const Header = ({ text, bg, count }) => {
  return (
    <div className={`${bg} flex items-center h-12 pl-4 rounded-md text-sm text-white`}>
      {text}
      <div className='ml-2 bg-white w-5 h-5 text-black rounded-full flex items-center justify-center font-bold'>
        {count}
      </div>
    </div>
  );
}

const Task = ({ task, tasks, setTasks, index, status, bg }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id, index, status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));


  const [{ isOver }, drop] = useDrop({
    accept: "task",
    hover: (draggedItem) => {
      if (draggedItem.id !== task.id) {
        moveTask(draggedItem.index, index, draggedItem.status, status);
        draggedItem.index = index;
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const moveTask = (fromIndex, toIndex, fromStatus, toStatus) => {
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      const [movedTask] = updatedTasks.splice(
        prevTasks.findIndex((t) => t.id === tasks[fromIndex].id),
        1
      );
      movedTask.status = toStatus;
      updatedTasks.splice(toIndex, 0, movedTask);
      return updatedTasks;
    });
  };

  const handleRemove = (id) => {
    const fTasks = tasks.filter(t => t.id !== id)
    localStorage.setItem("tasks", JSON.stringify(fTasks))
    setTasks(fTasks)
    toast("Task removed", { icon: <FcCancel /> })
  };

  const taskTextStyle =
    task.status === "closed" ? "line-through text-gray-500" : "text-white";


  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`p-4 flex items-center justify-between mt-6 shadow-2xl border-gray-400 border-[2px] rounded-md relative ${isDragging ? "opacity-25" : "opacity-100"
        } cursor-grab ${isOver ? "bg-gray-100" : ""} ${bg}`}
    >
      <p className={`${taskTextStyle} text-2xl`}>{task.name}</p>
      {task.status === "closed" ? (
        <button
          onClick={() => handleRemove(task.id)}
          className="bottom-4 text-white transition-all duration-200 delay-100 font-bold ease-out border-[2px] border-white rounded-lg p-1 hover:bg-white hover:text-black"
        >
          Delete
        </button>
      ) : null}
    </div>
  );
}
