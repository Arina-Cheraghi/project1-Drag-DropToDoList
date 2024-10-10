import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

function CreateTask({ tasks, setTasks }) {
    const [task, setTask] = useState({
        id: "",
        name: "",
        status: "todo"
    });


    const handleSubmit = (e) => {
        e.preventDefault();
        if (task.name.length < 3) return toast.error("A task must have more than 3 characters")
        if (task.name.length > 100) return toast.error("A task must not be more than 100 characters")

        setTasks((prev) => {
            const list = [...prev, task];
            localStorage.setItem("tasks", JSON.stringify(list));
            return list;
        });

        toast.success("Task created")

        setTask({
            id: "",
            name: "",
            status: "todo"
        })
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={task.name}
                type='text'
                className='border-2 border-zinc-700 bg-zinc-200 rounded-md mr-4 h-10 w-64 px-1'
                onChange={(e) => setTask({ ...task, id: uuidv4(), name: e.target.value })}
            />
            <button className='bg-pink-600 rounded-md p-2 '>
                create
            </button>
        </form>
    )
}

export default CreateTask;