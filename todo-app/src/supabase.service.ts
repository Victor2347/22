import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njprkxbesjyexlqbuoyk.supabase.co';
const supabaseKey = 'sb_publishable_e6bFnzqwy3w62DrsoetYbw_ezKF9htu';//你的 anon public key
export const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchTodos() {
  const { data, error } = await supabase.from('todos').select().order('id');
  if (error) throw error;
  return data;
}

export async function addTodo(title: string) {
  const { data, error } = await supabase.from('todos').insert({ title, done: false }).select().single();
  if (error) throw error;
  return data;
}

export async function toggleTodo(id: number, done: boolean) {
  const { error } = await supabase.from('todos').update({ done }).eq('id', id);
  if (error) throw error;
}

export async function removeTodo(id: number) {
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) throw error;
}

export async function updateTodoTitle(id: number, title: string) {
  const { data, error } = await supabase
    .from('todos')
    .update({ title })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}