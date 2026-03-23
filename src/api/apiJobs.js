import supabaseClient from "@/utils/supabase";

// Fetch Jobs
export async function getJobs(token, { state, city, company_id, searchQuery }) {
  const supabase = await supabaseClient(token);

  let query = supabase
    .from("jobs")
    .select("*, saved: saved_jobs(id), company: companies(name,logo_url)");

  // ✅ State filter
  if (state) {
    query = query.eq("state", state);
  }

  // ✅ City filter
  if (city) {
    query = query.eq("city", city);
  }

  // ✅ Company filter
  if (company_id) {
    query = query.eq("company_id", company_id);
  }

  // ✅ Title search
  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }

  return data;
}

// Read Saved Jobs
export async function getSavedJobs(token) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*, job: jobs(*, company: companies(name,logo_url))");

  if (error) {
    console.error("Error fetching Saved Jobs:", error);
    return null;
  }

  return data;
}

// Read single job
export async function getSingleJob(token, { job_id }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .select(
      "*, company: companies(name,logo_url), applications: applications(*)"
    )
    .eq("id", job_id)
    .single();

  if (error) {
    console.error("Error fetching Job:", error);
    return null;
  }

  return data;
}

// ✅ TOGGLE SAVE JOB
export async function saveJob(token, { alreadySaved }, saveData) {
  const supabase = await supabaseClient(token);

  if (alreadySaved) {
    const { error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("job_id", saveData.job_id)
      .eq("user_id", saveData.user_id);

    if (error) {
      console.error("Error removing saved job:", error);
      return { error };
    }

    return { success: true, removed: true };
  }

  const { data, error } = await supabase
    .from("saved_jobs")
    .insert([saveData]);

  if (error) {
    if (error.code === "23505") {
      return { success: true, alreadyExists: true };
    }
    console.error("Error saving job:", error);
    return { error };
  }

  return { success: true, data };
}

// Hiring status toggle
export async function updateHiringStatus(token, { job_id }, isOpen) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .update({ isOpen })
    .eq("id", job_id)
    .select();

  if (error) {
    console.error("Error Updating Hiring Status:", error);
    return null;
  }

  return data;
}

// Get my jobs
export async function getMyJobs(token, { recruiter_id }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .select("*, company: companies(name,logo_url)")
    .eq("recruiter_id", recruiter_id);

  if (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }

  return data;
}

// Delete job
export async function deleteJob(token, { job_id }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", job_id)
    .select();

  if (error) {
    console.error("Error deleting job:", error);
    return null;
  }

  return data;
}

// ✅ Add new job (supports state-only, city-only, or both)
export async function addNewJob(token, _, jobData) {
  const supabase = await supabaseClient(token);

  const finalJobData = {
    ...jobData,
    state: jobData.state || null,
    city: jobData.city || null,
  };

  const { data, error } = await supabase
    .from("jobs")
    .insert([finalJobData])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Error Creating Job");
  }

  return data;
}
