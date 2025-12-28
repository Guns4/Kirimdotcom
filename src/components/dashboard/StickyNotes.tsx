'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, CheckSquare, AlignLeft, Loader2 } from 'lucide-react';

interface Todo {
    id: string;
    text: string;
    completed: boolean;
}

interface StickyNotesProps {
    storageKey?: string;
    onSave?: (notes: string, todos: Todo[]) => Promise<void>;
}

export function StickyNotesWidget({ storageKey = 'sticky_notes_data', onSave }: StickyNotesProps) {
    const [mode, setMode] = useState<'notes' | 'todo'>('notes');
    const [notes, setNotes] = useState('');
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Initial Load
    useEffect(() => {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.notes) setNotes(parsed.notes);
                if (parsed.todos) setTodos(parsed.todos);
                if (parsed.mode) setMode(parsed.mode);
            } catch (e) {
                console.error('Failed to load sticky notes', e);
            }
        }
    }, [storageKey]);

    // Timer for debounce
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const saveData = (currentNotes: string, currentTodos: Todo[], currentMode: string) => {
        setIsSaving(true);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            // Local Save
            localStorage.setItem(storageKey, JSON.stringify({
                notes: currentNotes,
                todos: currentTodos,
                mode: currentMode
            }));

            // Server Save Callback
            if (onSave) {
                try {
                    await onSave(currentNotes, currentTodos);
                } catch (e) {
                    console.error('Server save failed', e);
                }
            }

            setIsSaving(false);
            setLastSaved(new Date());
        }, 1000);
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setNotes(val);
        saveData(val, todos, mode);
    };

    const handleAddTodo = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newTodo.trim()) return;

        const updatedTodos = [...todos, { id: Date.now().toString(), text: newTodo, completed: false }];
        setTodos(updatedTodos);
        setNewTodo('');
        saveData(notes, updatedTodos, mode);
    };

    const toggleTodo = (id: string) => {
        const updatedTodos = todos.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        );
        setTodos(updatedTodos);
        saveData(notes, updatedTodos, mode);
    };

    const deleteTodo = (id: string) => {
        const updatedTodos = todos.filter(t => t.id !== id);
        setTodos(updatedTodos);
        saveData(notes, updatedTodos, mode);
    };

    const completedCount = todos.filter(t => t.completed).length;

    return (
        <div className="bg-yellow-100/90 border border-yellow-300 rounded-xl shadow-sm hover:shadow-md transition-shadow h-[400px] flex flex-col overflow-hidden text-yellow-900">
            {/* Header */}
            <div className="h-12 border-b border-yellow-200/50 flex items-center justify-between px-4 bg-yellow-200/50">
                <div className="flex bg-yellow-300/50 rounded-lg p-1">
                    <button
                        onClick={() => { setMode('notes'); saveData(notes, todos, 'notes'); }}
                        className={`p-1.5 rounded transition ${mode === 'notes' ? 'bg-white shadow-sm text-yellow-900' : 'text-yellow-700 hover:text-yellow-900'}`}
                    >
                        <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => { setMode('todo'); saveData(notes, todos, 'todo'); }}
                        className={`p-1.5 rounded transition ${mode === 'todo' ? 'bg-white shadow-sm text-yellow-900' : 'text-yellow-700 hover:text-yellow-900'}`}
                    >
                        <CheckSquare className="w-4 h-4" />
                    </button>
                </div>
                {mode === 'todo' && (
                    <div className="text-xs font-medium text-yellow-700">
                        {completedCount}/{todos.length} Selesai
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                {mode === 'notes' ? (
                    <textarea
                        value={notes}
                        onChange={handleNotesChange}
                        placeholder="Tulis catatan cepat di sini..."
                        className="w-full h-full bg-transparent resize-none outline-none placeholder:text-yellow-700/50 text-sm leading-relaxed custom-scrollbar"
                    />
                ) : (
                    <div className="space-y-3">
                        <form onSubmit={handleAddTodo} className="flex gap-2">
                            <input
                                type="text"
                                value={newTodo}
                                onChange={(e) => setNewTodo(e.target.value)}
                                placeholder="+ Tambah tugas"
                                className="flex-1 bg-white/50 border-none rounded-lg px-3 py-2 text-sm placeholder:text-yellow-700/50 focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none transition"
                            />
                            <button
                                type="submit"
                                disabled={!newTodo.trim()}
                                className="bg-yellow-400/80 hover:bg-yellow-400 text-yellow-900 p-2 rounded-lg transition disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </form>

                        <div className="space-y-1">
                            {todos.map(todo => (
                                <div key={todo.id} className="group flex items-start gap-2 p-2 hover:bg-yellow-200/50 rounded-lg transition">
                                    <button
                                        onClick={() => toggleTodo(todo.id)}
                                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${todo.completed
                                                ? 'bg-yellow-600 border-yellow-600 text-white'
                                                : 'border-yellow-600/50 hover:border-yellow-600'
                                            }`}
                                    >
                                        {todo.completed && <CheckSquare className="w-3 h-3" />}
                                    </button>
                                    <span className={`text-sm flex-1 break-words ${todo.completed ? 'line-through text-yellow-900/50' : ''}`}>
                                        {todo.text}
                                    </span>
                                    <button
                                        onClick={() => deleteTodo(todo.id)}
                                        className="opacity-0 group-hover:opacity-100 text-yellow-900/40 hover:text-red-500 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {todos.length === 0 && (
                                <p className="text-center text-xs text-yellow-800/40 mt-8">
                                    Belum ada tugas.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="h-8 flex items-center justify-end px-4 gap-2 text-[10px] text-yellow-800/60 border-t border-yellow-200/50 bg-yellow-200/30">
                {isSaving ? (
                    <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Menyimpan...
                    </span>
                ) : lastSaved ? (
                    <span className="flex items-center gap-1">
                        <Save className="w-3 h-3" />
                        Disimpan {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                ) : (
                    <span>Auto-save enabled</span>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(161, 98, 7, 0.2);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(161, 98, 7, 0.4);
                }
            `}</style>
        </div>
    );
}
