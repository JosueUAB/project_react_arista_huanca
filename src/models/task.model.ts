export interface Task {
  id: number;
  name: string;
  done: boolean;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskResponse {
  total: number;
  page: number;
  pages: number;
  data: Task[];
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  done?: boolean;
  search?: string;
  orderby?: string;
  orderDir?: 'ASC' | 'DESC';
}
