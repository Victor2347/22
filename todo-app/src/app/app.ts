import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Filter = 'all' | 'active' | 'done';

type Todo = {
  id: number;
  title: string;
  done: boolean;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly platformId: Object = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly storageKey = 'todo-app.todos';
  protected newTitle = '';
  protected filter = signal<Filter>('all');
  protected todos = signal<Todo[]>([
    { id: 1, title: '學會新增與刪除待辦', done: false },
    { id: 2, title: '切換任務完成狀態', done: true },
    { id: 3, title: '調整篩選條件', done: false }
  ]);

  constructor() {
    if (this.isBrowser) {
      this.restoreFromStorage();

      // 當待辦列表變動時，寫入 localStorage（僅在瀏覽器）
      effect(() => {
        const data = JSON.stringify(this.todos());
        localStorage.setItem(this.storageKey, data);
      });
    }
  }

  protected filteredTodos = computed(() => {
    const list = this.todos();
    const mode = this.filter();

    if (mode === 'active') {
      return list.filter((todo) => !todo.done);
    }

    if (mode === 'done') {
      return list.filter((todo) => todo.done);
    }

    return list;
  });

  protected remainingCount = computed(
    () => this.todos().filter((todo) => !todo.done).length
  );

  protected hasCompleted = computed(() =>
    this.todos().some((todo) => todo.done)
  );

  protected setFilter(mode: Filter): void {
    this.filter.set(mode);
  }

  protected addTodo(): void {
    const title = this.newTitle.trim();

    if (!title) {
      return;
    }

    const newTodo: Todo = {
      id: Date.now(),
      title,
      done: false
    };

    this.todos.update((list) => [...list, newTodo]);
    this.newTitle = '';
  }

  protected toggleTodo(id: number): void {
    this.todos.update((list) =>
      list.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  }

  protected removeTodo(id: number): void {
    this.todos.update((list) => list.filter((todo) => todo.id !== id));
  }

  protected clearCompleted(): void {
    this.todos.update((list) => list.filter((todo) => !todo.done));
  }

  protected clearStorageData(): void {
    if (!this.isBrowser) {
      return;
    }
    localStorage.removeItem(this.storageKey);
    this.todos.set([]);
    console.log('To-Do list data has been cleared from localStorage.');
  }

  private restoreFromStorage(): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Todo[];
      if (Array.isArray(parsed)) {
        this.todos.set(parsed);
      }
    } catch (err) {
      console.error('Failed to restore todos from storage', err);
    }
  }
}
