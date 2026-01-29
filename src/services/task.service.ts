import { axiosClient } from '../lib/axiosCliente';
import type { Task, TaskFilters, TaskResponse } from '../models/task.model';

export const getTasks = async (filters: TaskFilters = {}): Promise<TaskResponse> => {
  const { data } = await axiosClient.get<TaskResponse>('/tasks', { params: filters });
  return data;
};

export const getTaskById = async (id: number): Promise<Task> => {
  const { data } = await axiosClient.get<Task>(`/tasks/${id}`);
  return data;
};

export const createTask = async (name: string): Promise<Task> => {
  const { data } = await axiosClient.post<Task>('/tasks', { name });
  return data;
};

export const updateTask = async (id: number, name: string): Promise<number[]> => {
  const { data } = await axiosClient.put<number[]>(`/tasks/${id}`, { name });
  return data;
};

export const partialUpdateTask = async (id: number, partial: Partial<Task>): Promise<number[]> => {
  const { data } = await axiosClient.patch<number[]>(`/tasks/${id}`, partial);
  return data;
};

export const deleteTask = async (id: number): Promise<void> => {
  await axiosClient.delete(`/tasks/${id}`);
};
