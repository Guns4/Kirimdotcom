'use client';

import { useState, useEffect, useCallback } from 'react';
import { StickyNote, CheckSquare, Square, Plus, Trash2, Save } from 'lucide-react';

interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
}

interface StickyNotesProps {
    storageKey?: string;
    onSave?: (content: string, todos: TodoItem[]) => Promise<void>;
}

const STORAGE_KEY = 'cekkirim-sticky-notes';
const DEBOUNCE_MS = 1000;

/**
 * Sticky Notes Widget with Auto-Save
 */
export function StickyNotesWidget({ storageKey = STORAGE_KEY, onSave }: StickyNotesProps) {
    const [mode, setMode] = useState<'notes' | 'todos'>('notes');
    const [notes, setNotes] = useState('');
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [newTodo, setNewTodo] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setNotes(data.notes || '');
                setTodos(data.todos || []);
                setMode(data.mode || 'notes');
            } catch {
                // Invalid JSON, ignore
            }
        }
    }, [storageKey]);

    // Debounced auto-save
    const saveToStorage = useCallback(() => {
        const data = { notes, todos, mode };
        localStorage.setItem(storageKey, JSON.stringify(data));
        setLastSaved(new Date());
        setIsSaving(false);

        // Also save to server if callback provided
        if (onSave) {
            onSave(notes, todos);
        }
    }, [notes, todos, mode, storageKey, onSave]);

    useEffect(() => {
        setIsSaving(true);
        const timer = setTimeout(saveToStorage, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [notes, todos, saveToStorage]);

    // Todo handlers
    const addTodo = () => {
        if (!newTodo.trim()) return;
        setTodos([...todos, { id: Date.now().toString(), text: newTodo.trim(), completed: false }]);
        setNewTodo('');
    };

    const toggleTodo = (id: string) => {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTodo = (id: string) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    return (
        <div className="bg-yellow-100 rounded-xl border-2 border-yellow-300 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-yellow-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <StickyNote className="w-5 h-5 text-yellow-700" />
                    <span className="font-semibold text-yellow-800">Catatan Cepat</span>
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-yellow-300 rounded-lg p-0.5">
                    <button
                        onClick={() => setMode('notes')}
                        className={`px-3 py-1 text-sm rounded-md transition ${mode === 'notes' ? 'bg-white text-yellow-800 shadow' : 'text-yellow-700'
                            }`}
                    >
                        Notes
                    </button>
                    <button
                        onClick={() => setMode('todos')}
                        className={`px-3 py-1 text-sm rounded-md transition ${mode === 'todos' ? 'bg-white text-yellow-800 shadow' : 'text-yellow-700'
                            }`}
                    >
                        To-Do
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {mode === 'notes' ? (
                    /* Notes Mode */
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tulis catatan di sini...

Contoh:
• Besok kirim paket Bu Ani yang ketinggalan
• Cek stok bubble wrap
• Follow up customer JNE123456"
                        className="w-full h-48 bg-transparent resize-none focus:outline-none text-yellow-900 placeholder-yellow-600/50"
                    />
                ) : (
                    /* Todos Mode */
                    <div className="space-y-2">
                        {/* Add Todo */}
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newTodo}
                                onChange={(e) => setNewTodo(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                                placeholder="Tambah tugas baru..."
                                className="flex-1 px-3 py-2 bg-white/50 rounded-lg border border-yellow-300 focus:border-yellow-500 focus:outline-none text-yellow-900 placeholder-yellow-600/50"
                            />
                            <button
                                onClick={addTodo}
                                className="p-2 bg-yellow-400 text-yellow-800 rounded-lg hover:bg-yellow-500 transition"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Todo List */}
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {todos.length === 0 ? (
                                <p className="text-yellow-600/70 text-sm text-center py-4">
                                    Belum ada tugas. Tambahkan di atas!
                                </p>
                            ) : (
                                todos.map((todo) => (
                                    <div
                                        key={todo.id}
                                        className={`flex items-center gap-3 p-2 rounded-lg transition ${todo.completed ? 'bg-yellow-200/50' : 'bg-white/30'
                                            }`}
                                    >
                                        <button
                                            onClick={() => toggleTodo(todo.id)}
                                            className="flex-shrink-0"
                                        >
                                            {todo.completed ? (
                                                <CheckSquare className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-yellow-600" />
                                            )}
                                        </button>
                                        <span
                                            className={`flex-1 ${todo.completed ? 'line-through text-yellow-600' : 'text-yellow-900'
                                                }`}
                                        >
                                            {todo.text}
                                        </span>
                                        <button
                                            onClick={() => deleteTodo(todo.id)}
                                            className="p-1 text-red-500 hover:bg-red-100 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer - Save Status */}
            <div className="px-4 py-2 bg-yellow-200/50 flex items-center justify-between text-xs text-yellow-700">
                <div className="flex items-center gap-1">
                    <Save className="w-3 h-3" />
                    {isSaving ? 'Menyimpan...' : lastSaved ? `Tersimpan ${lastSaved.toLocaleTimeString('id-ID')}` : 'Auto-save aktif'}
                </div>
                {mode === 'todos' && (
                    <span>
                        {todos.filter(t => t.completed).length}/{todos.length} selesai
                    </span>
                )}
            </div>
        </div>
    );
}

export default StickyNotesWidget;
