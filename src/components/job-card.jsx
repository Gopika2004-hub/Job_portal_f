/* eslint-disable react/prop-types */
import { Heart, MapPinIcon, Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Link } from "react-router-dom";
import useFetch from "@/hooks/use-fetch";
import { deleteJob, saveJob } from "@/api/apiJobs";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";

const JobCard = ({
  job,
  savedInit = false, // already saved or not
  onJobAction = () => {},
  isMyJob = false,
}) => {
  const { user } = useUser();

  // ❤️ local UI state
  const [saved, setSaved] = useState(savedInit);

  // delete job (recruiter)
  const { loading: loadingDeleteJob, fn: fnDeleteJob } = useFetch(deleteJob, {
    job_id: job.id,
  });

  // save / remove job
  const { loading: loadingSavedJob, fn: fnSavedJob } = useFetch(saveJob);

  // sync when parent updates
  useEffect(() => {
    setSaved(savedInit);
  }, [savedInit]);

  // ❤️ SAVE / REMOVE JOB
  const handleSaveJob = async () => {
    if (!user) return;

    const saveData = {
      user_id: user.id,
      job_id: job.id,
    };

    const res = await fnSavedJob({ alreadySaved: saved }, saveData);

    if (res?.error) return;

    if (!saved) {
      alert("Job added to saved jobs ❤️");
    } else {
      alert("Job removed from saved jobs 🤍");
    }

    // toggle heart color
    setSaved(!saved);

    // refresh saved jobs page
    onJobAction();
  };

  // 🗑 delete job
  const handleDeleteJob = async () => {
    await fnDeleteJob();
    onJobAction();
  };

  // ✅ Build location string from state/city
  const locationText = job.state && job.city
    ? `${job.state}, ${job.city}`
    : job.state || job.city || "Location not specified";

  return (
    <Card className="flex flex-col">
      {(loadingDeleteJob || loadingSavedJob) && (
        <BarLoader className="mt-2" width="100%" color="#36d7b7" />
      )}

      <CardHeader>
        <CardTitle className="flex justify-between font-bold">
          {job.title}
          {isMyJob && (
            <Trash2Icon
              fill="red"
              size={18}
              className="text-red-300 cursor-pointer"
              onClick={handleDeleteJob}
            />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 flex-1">
        <div className="flex justify-between">
          {job.company && (
            <img src={job.company.logo_url} className="h-6" />
          )}
          <div className="flex gap-2 items-center">
            <MapPinIcon size={15} /> {locationText}
          </div>
        </div>
        <hr />
        {job.description.substring(0, job.description.indexOf("."))}.
      </CardContent>

      <CardFooter className="flex gap-2">
        <Link to={`/job/${job.id}`} className="flex-1">
          <Button variant="secondary" className="w-full">
            More Details
          </Button>
        </Link>

        {!isMyJob && (
          <Button
            variant="outline"
            className="w-15"
            onClick={handleSaveJob}
            disabled={loadingSavedJob}
          >
            <Heart size={20} fill={saved ? "red" : "none"} stroke="red" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default JobCard;
