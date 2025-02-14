import TaskItem from "@/components/shared/task-item";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { db } from "@/firebase";
import TaskForm from "@/forms/task-form";
import { taskSchema } from "@/lib/validition";
import { useUserState } from "@/stores/user-store";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { AlertCircle, BadgePlus } from "lucide-react";
import { z } from "zod";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TaskService } from "@/service/task.service";
import FillLoading from "@/components/shared/fill-loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ITask } from "@/types";
import { toast } from "sonner";
import { addMilliseconds, format, addMinutes } from "date-fns";

const Dashboard = () => {
  const [open, setOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTask, setCurrentTask] = useState<ITask | null>(null);

  const { user } = useUserState();

  const { isPending, error, data, refetch } = useQuery({
    queryKey: ["tasks-data"],
    queryFn: TaskService.getTasks,
  });

  const onStartEditing = (task: ITask) => {
    setIsEditing(true);
    setCurrentTask(task);
  };

  const onAdd = async ({ title }: z.infer<typeof taskSchema>) => {
    return addDoc(collection(db, "tasks"), {
      title,
      status: "unstarted",
      endTime: null,
      startTime: null,
      userId: user?.uid,
    })
      .then(() => refetch())
      .finally(() => setOpen(false));
  };

  const onUpdate = async ({ title }: z.infer<typeof taskSchema>) => {
    if (!currentTask) return null;

    const ref = doc(db, "tasks", currentTask.id);
    return updateDoc(ref, { title })
      .then(() => refetch())
      .finally(() => setIsEditing(false));
  };

  const onDelete = async (id: string) => {
    setIsDeleting(true);
    const promise = deleteDoc(doc(db, "tasks", id))
      .then(() => refetch())
      .finally(() => setIsDeleting(false));

    toast.promise(promise, {
      loading: "Loading...",
      success: "Successfully deleted!",
      error: "Something went wrong!",
    });
  };

  const formatDate = (time: number) => {
    const date = addMilliseconds(new Date(0), time);
    const formattedDate = format(
      addMinutes(date, date.getTimezoneOffset()),
      "HH:mm:ss"
    );
    return formattedDate;
  };

  return (
    <>
      <div className="h-screen max-w-6xl mx-auto flex items-center md:px-6 md:pt-[8vh] max-md:px-6 max-md:pt-[8vh]">
        <div className="grid lg:grid-cols-2 grid-cols-1 w-full gap-8 items-center">
          <div className="flex flex-col space-y-3 lg:mt-0 mt-20">
            <div className="w-full p-4 rounded-md flex justify-between bg-gradient-to-t from-background to-secondary">
              <div className="text-2xl font-bold">Trainings</div>
              <Button size={"icon"} onClick={() => setOpen(true)}>
                <BadgePlus />
              </Button>
            </div>
            <Separator />
            <div className="w-full p-4 rounded-md flex justify-between bg-gradient-to-b from-background to-secondary relative min-h-60">
              {isPending || (isDeleting && <FillLoading />)}
              {error && (
                <Alert variant="destructive" className="w-full">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}
              {data && (
                <div className="flex flex-col space-y-3 w-full">
                  {!isEditing &&
                    data.tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onStartEditing={() => onStartEditing(task)}
                        onDelete={() => onDelete(task.id)}
                        refetch={refetch}
                      />
                    ))}
                  {isEditing && (
                    <TaskForm
                      title={currentTask?.title}
                      isEdit
                      onClose={() => setIsEditing(false)}
                      handler={
                        onUpdate as (
                          values: z.infer<typeof taskSchema>
                        ) => Promise<null | void>
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-3 relative w-full">
            <div className="p-4 rounded-md bg-gradient-to-r from-blue-900 to-background relative h-24">
              <div className="text-2xl font-bold">Total week</div>
              {isPending ? (
                <FillLoading />
              ) : (
                data && (
                  <div className="text-3xl font-bold">
                    {formatDate(data.weekTotal)}
                  </div>
                )
              )}
            </div>
            <div className="p-4 rounded-md bg-gradient-to-r from-secondary to-background relative h-24">
              <div className="text-2xl font-bold">Total week</div>
              {isPending ? (
                <FillLoading />
              ) : (
                data && (
                  <div className="text-3xl font-bold">
                    {formatDate(data.monthTotal)}
                  </div>
                )
              )}{" "}
            </div>
            <div className="p-4 rounded-md bg-gradient-to-r from-destructive to-background relative h-24">
              <div className="text-2xl font-bold">Total week</div>
              {isPending ? (
                <FillLoading />
              ) : (
                data && (
                  <div className="text-3xl font-bold">
                    {formatDate(data.total)}
                  </div>
                )
              )}{" "}
            </div>
          </div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new task</DialogTitle>
          </DialogHeader>
          <Separator />
          <TaskForm
            handler={
              onAdd as unknown as (
                values: z.infer<typeof taskSchema>
              ) => Promise<null | void>
            }
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;
