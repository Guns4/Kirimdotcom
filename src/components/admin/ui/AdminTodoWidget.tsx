'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Clock } from 'lucide-react';

export default function AdminTodoWidget({ adminKey }: { adminKey: string }) {
    const [todos, setTodos] = useState<any[]>([]);
    const [newTask, setNewTask] = useState('');

    const fetchTodos = async () => {
        try {
            const res = await fetch('/api/admin/productivity/todos', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setTodos(data.todos || []);
            }
        } catch (error) {
            console.error('Failed to fetch todos:', error);
        }
    };

    useEffect(() => {
        if (adminKey) fetchTodos();
    }, [adminKey]);

    const handleAdd = async () => {
        if (!newTask.trim()) return;

        try {
            const res = await fetch('/api/admin/productivity/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({ task: newTask })
            });

            if (res.ok) {
                setNewTask('');
                fetchTodos();
            }
        } catch (error) {
            console.error('Failed to add todo:', error);
        }
    };

    const handleToggle = async (id: string, isDone: boolean) => {
        try {
            await fetch('/api/admin/productivity/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({ id, is_done: !isDone })
            });
            fetchTodos();
        } catch (error) {
            console.error('Failed to toggle todo:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/admin/productivity/todos?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-admin-secret': adminKey }
            });
            fetchTodos();
        } catch (error) {
            console.error('Failed to delete todo:', error);
        }
    };

    const pendingCount = todos.filter(t => !t.is_done).length;

    return (
        <div className="bg-white rounded-lg border p-4">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Clock size={16} />
                    My Tasks
                </h4>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                    {pendingCount} pending
                </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
                {todos.slice(0, 5).map((todo) => (
                    <div
                        key={todo.id}
                        className="flex items-center gap-2 group hover:bg-slate-50 p-1 rounded"
                    >
                        <button
                            onClick={() => handleToggle(todo.id, todo.is_done)}
                            className="shrink-0"
                        >
                            {todo.is_done ? (
                                <CheckCircle2 size={18} className="text-green-600" />
                            ) : (
                                <Circle size={18} className="text-slate-300" />
                            )}
                        </button>
                        <span
                            className={`flex-1 text-xs ${todo.is_done ? 'line-through text-slate-400' : 'text-slate-700'
                                }`}
                        >
                            {todo.task}
                        </span>
                        <button
                            onClick={() => handleDelete(todo.id)}
                            className="opacity-0 group-hover:opacity-100 transition shrink-0"
                        >
                            <Trash2 size={12} className="text-red-400 hover:text-red-600" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="Add quick task..."
                    className="flex-1 border rounded px-2 py-1 text-xs"
                />
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
}
