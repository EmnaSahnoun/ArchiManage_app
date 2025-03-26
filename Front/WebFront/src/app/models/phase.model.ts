import { Task } from "./task.model";

export interface Phase {
  _id?: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  project: string; // ID du projet
  tasks?: Task[];
}
