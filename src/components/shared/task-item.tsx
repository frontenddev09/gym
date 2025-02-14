import { ITask, ITaskData } from "@/types";
import { Edit2, Trash } from "lucide-react";
import { CiPause1, CiPlay1 } from "react-icons/ci";
import { HiStatusOnline } from "react-icons/hi";
import { MdOutlineTaskAlt } from "react-icons/md";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { RxReload } from "react-icons/rx";
import { toast } from "sonner";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import FillLoading from "./fill-loading";
import { QueryObserverResult } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface IProps {
  task: ITask;
  onStartEditing: () => void;
  onDelete: () => void;
  refetch: () => Promise<QueryObserverResult<ITaskData>>;
  children?: React.ReactNode;
}

const TaskItem = ({ task, onStartEditing, onDelete, refetch }: IProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const onStart = async () => {
    setIsLoading(true);

    const ref = doc(db, "tasks", task.id);
    try {
      await updateDoc(ref, {
        status: "in_progress",
        startTime: Date.now(),
      });
      refetch();
    } catch (error) {
      toast.error("An error occured");
    } finally {
      setIsLoading(false);
    }
  };

  const onPause = async () => {
    setIsLoading(true);
    const ref = doc(db, "tasks", task.id);

    try {
      const elapsed = task.startTime && Date.now() - task.startTime;
      const newTotalTime = (task.totalTime || 0) + elapsed;
      await updateDoc(ref, {
        status: "paused",
        endTime: Date.now(),
        totalTime: newTotalTime,
      });
      refetch();
    } catch (e) {
      toast.error("An error occured");
    } finally {
      setIsLoading(false);
    }
  };

  const renderBtns = () => {
    switch (task.status) {
      case "unstarted":
        return (
          <Button
            variant={"ghost"}
            size={"icon"}
            className="w-8 h-8"
            onClick={onStart}
          >
            <CiPlay1 className="w-5 h-5 text-indigo-500" />
          </Button>
        );
      case "in_progress":
        return (
          <Button
            onClick={onPause}
            variant={"ghost"}
            size={"icon"}
            className="w-8 h-8"
          >
            <CiPause1 className="w-5 h-5 text-green-500" />
          </Button>
        );
      case "paused":
        return (
          <Button
            onClick={onStart}
            variant={"ghost"}
            size={"icon"}
            className="w-8 h-8"
          >
            <RxReload className="w-5 h-5 text-indigo-500" />
          </Button>
        );
      default:
        return task;
    }
  };

  return (
    <Card className="w-full p-4 shadow-md grid grid-cols-4 items-center relative ">
      {isLoading && <FillLoading />}
      <div className="flex gap-1 items-center min-[500px]:col-span-2 max-[350px]:col-span-2">
        <MdOutlineTaskAlt className="text-blue-500" />
        <span className="capitalize">{task.title}</span>
      </div>
      <div className="flex gap-1 items-center max-[500px]:col-span-2 max-[350px]:hidden">
        <HiStatusOnline
          className={cn(
            task.status === "unstarted" && "text-blue-500",
            task.status === "in_progress" && "text-green-500",
            task.status === "paused" && "text-red-500"
          )}
        />
        <span className="capitalize text-sm max-[350px]:hidden">
          {task.status}
        </span>
      </div>
      <div className="flex gap-1 items-center justify-self-end max-[350px]:col-span-2">
        <>
          {renderBtns()}
          <Button
            onClick={onStartEditing}
            variant={"secondary"}
            size={"icon"}
            className="w-8 h-8"
          >
            <Edit2 className="w-5 h-5" />
          </Button>
          <Button
            onClick={onDelete}
            variant={"destructive"}
            size={"icon"}
            className="w-8 h-8"
          >
            <Trash className="w-5 h-5" />
          </Button>
        </>
      </div>
    </Card>
  );
};

export default TaskItem;
