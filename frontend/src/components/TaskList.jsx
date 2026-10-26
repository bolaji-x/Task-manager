
import { useState, useEffect } from 'react';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const API = 'http://localhost:5000/api/tasks';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const fetchTasks = async () => {
    const res = await fetch(API, { headers: getHeaders() });
    const data = await res.json();
    setTasks(data);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch(API, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, due_date: dueDate || null }),
    });
    setTitle('');
    setDueDate('');
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`${API}/${id}`, { method: 'DELETE', headers: getHeaders() });
    fetchTasks();
  };

  const toggleComplete = async (task) => {
    await fetch(`${API}/${task.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ completed: !task.completed }),
    });
    fetchTasks();
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async (id) => {
    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ title: editTitle }),
    });
    setEditingId(null);
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const isOverdue = (task) => {
    if (!task.due_date || task.completed) return false;
    return new Date(task.due_date) < new Date().setHours(0, 0, 0, 0);
  };

  const visibleTasks = tasks
    .filter((task) => task.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((task) => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    });

  return (
    <div className="task-box">
      <h2>Tasks</h2>

      <form onSubmit={addTask} className="task-form">
        <input placeholder="New task..." value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      <input
        className="search-input"
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="filter-buttons">
        <button className={filter === 'all' ? 'active-filter' : ''} onClick={() => setFilter('all')}>All</button>
        <button className={filter === 'active' ? 'active-filter' : ''} onClick={() => setFilter('active')}>Active</button>
        <button className={filter === 'completed' ? 'active-filter' : ''} onClick={() => setFilter('completed')}>Completed</button>
      </div>

      <ul className="task-list">
        {visibleTasks.map((task) => (
          <li key={task.id} className="task-item">
            {editingId === task.id ? (
              <>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <button onClick={() => saveEdit(task.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span className={task.completed ? 'completed' : isOverdue(task) ? 'overdue' : ''}>
                  {task.title}
                  {task.due_date && <small className="due-date"> — due {task.due_date}</small>}
                </span>
                <div className="task-actions">
                  <button onClick={() => toggleComplete(task)}>
                    {task.completed ? 'Undo' : 'Done'}
                  </button>
                  <button onClick={() => startEditing(task)}>Edit</button>
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;