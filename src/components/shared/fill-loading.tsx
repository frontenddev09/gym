import { BiLoaderAlt } from "react-icons/bi";
import { Skeleton } from "../ui/skeleton";

const FillLoading = () => {
  return (
    <Skeleton className="absolute opacity-20 inset-0 z-50 w-full flex items-center justify-center">
      <BiLoaderAlt className="animate-spin w-6 h-6" />
    </Skeleton>
  );
};

export default FillLoading;
