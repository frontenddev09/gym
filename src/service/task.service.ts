import { auth, db } from "@/firebase";
import { ITask, ITaskData } from "@/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";

export const TaskService = {
  getTasks: async () => {
    let total = 0,
      monthTotal = 0,
      weekTotal = 0;

    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", auth.currentUser?.uid)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const taskDate = new Date(data.startTime);
      const taskTime = data.totalTime || 0;

      if (isWithinInterval(taskDate, { start: weekStart, end: weekEnd })) {
        weekTotal += taskTime;
      }
      if (isWithinInterval(taskDate, { start: monthStart, end: monthEnd })) {
        monthTotal += taskTime;
      }
      total += taskTime;
    });

    const tasks = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as ITask[];

    const taskData: ITaskData = {
      tasks,
      weekTotal,
      monthTotal,
      total,
    };

    return taskData;
  },
};
