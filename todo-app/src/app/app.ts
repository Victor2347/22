import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  addTodo as addTodoApi,
  fetchTodos,
  removeTodo as removeTodoApi,
  toggleTodo as toggleTodoApi
} from '../supabase.service';

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
  protected newTitle = '';
  protected filter = signal<Filter>('all');
  protected todos = signal<Todo[]>([]);
  protected loading = signal(false);
  protected error = signal<string | null>(null);

  constructor() {
    if (this.isBrowser) this.loadTodos();
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

  protected async loadTodos(): Promise<void> {
    if (!this.isBrowser) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await fetchTodos();
      this.todos.set(data ?? []);
    } catch (err: any) {
      console.error(err);
      this.error.set(err?.message ?? '載入失敗，請重試');
    } finally {
      this.loading.set(false);
    }
  }

  protected async addTodo(): Promise<void> {
    const title = this.newTitle.trim();

    if (!title) {
      return;
    }

    try {
      const created = await addTodoApi(title);
      if (created) {
        this.todos.update((list) => [...list, created]);
      }
      this.newTitle = '';
    } catch (err: any) {
      console.error(err);
      this.error.set(err?.message ?? '新增失敗');
    }
  }

  protected async toggleTodo(id: number): Promise<void> {
    const list = this.todos();
    const target = list.find((t) => t.id === id);
    if (!target) return;

    const nextDone = !target.done;
    this.todos.update((items) =>
      items.map((todo) => (todo.id === id ? { ...todo, done: nextDone } : todo))
    );

    try {
      await toggleTodoApi(id, nextDone);
    } catch (err: any) {
      // revert on error
      this.todos.update((items) =>
        items.map((todo) => (todo.id === id ? { ...todo, done: target.done } : todo))
      );
      console.error(err);
      this.error.set(err?.message ?? '更新狀態失敗');
    }
  }

  protected async removeTodo(id: number): Promise<void> {
    const prev = this.todos();
    this.todos.update((list) => list.filter((todo) => todo.id !== id));

    try {
      await removeTodoApi(id);
    } catch (err: any) {
      // revert on error
      this.todos.set(prev);
      console.error(err);
      this.error.set(err?.message ?? '刪除失敗');
    }
  }

  protected async clearCompleted(): Promise<void> {
    const completed = this.todos()
      .filter((todo) => todo.done)
      .map((todo) => todo.id);

    if (!completed.length) return;

    const prev = this.todos();
    this.todos.update((list) => list.filter((todo) => !todo.done));

    try {
      await Promise.all(completed.map((id) => removeTodoApi(id)));
    } catch (err: any) {
      this.todos.set(prev);
      console.error(err);
      this.error.set(err?.message ?? '清除已完成失敗');
    }
  }
}
