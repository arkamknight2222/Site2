import { supabase, ApplicationStatus, ApplicantWithApplication } from './supabase';

export async function fetchApplicationsForJob(jobId: string): Promise<ApplicantWithApplication[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      job_id,
      applicant_id,
      application_type,
      points_used,
      status,
      application_status,
      applied_at,
      applicants (
        id,
        name,
        email,
        phone,
        age,
        gender,
        experience,
        degree,
        citizenship,
        criminal_record,
        resume_url
      )
    `)
    .eq('job_id', jobId);

  if (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }

  return (data || []).map((app: any) => ({
    id: app.applicants.id,
    name: app.applicants.name,
    email: app.applicants.email,
    phone: app.applicants.phone,
    age: app.applicants.age,
    gender: app.applicants.gender,
    experience: app.applicants.experience,
    degree: app.applicants.degree,
    citizenship: app.applicants.citizenship,
    criminal_record: app.applicants.criminal_record,
    resume_url: app.applicants.resume_url,
    application: {
      id: app.id,
      job_id: app.job_id,
      applicant_id: app.applicant_id,
      application_type: app.application_type,
      points_used: app.points_used,
      status: app.status,
      application_status: app.application_status,
      applied_at: app.applied_at
    }
  }));
}

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  changedBy: string = 'employer'
): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .update({ application_status: newStatus })
    .eq('id', applicationId);

  if (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
}

export async function fetchStatusHistory(applicationId: string) {
  const { data, error } = await supabase
    .from('application_status_history')
    .select('*')
    .eq('application_id', applicationId)
    .order('changed_at', { ascending: false });

  if (error) {
    console.error('Error fetching status history:', error);
    throw error;
  }

  return data || [];
}

export async function createMockApplicationsForJob(jobId: string, count: number = 50) {
  const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Lisa', 'Robert', 'Maria', 'William', 'Jennifer', 'Richard', 'Amanda', 'Thomas'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore'];
  const genders = ['Male', 'Female', 'Non-binary'];
  const experiences = ['Entry Level (0-2 years)', 'Mid Level (3-5 years)', 'Senior Level (6-10 years)', 'Expert Level (10+ years)'];
  const degrees = ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD'];
  const citizenships = ['US Citizen', 'Permanent Resident', 'Work Visa (H1B)', 'Work Authorization (EAD)'];

  const applicantsToCreate = [];
  const applicationsToCreate = [];

  const randomCount = Math.floor(Math.random() * 15) + 20;
  const pointsCount = count - randomCount;

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const isPoints = i >= randomCount;
    const userId = `mock-user-${jobId}-${i}-${Date.now()}`;

    const applicant = {
      user_id: userId,
      name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      age: Math.floor(Math.random() * 30) + 22,
      gender: genders[Math.floor(Math.random() * genders.length)],
      experience: experiences[Math.floor(Math.random() * experiences.length)],
      degree: degrees[Math.floor(Math.random() * degrees.length)],
      citizenship: citizenships[Math.floor(Math.random() * citizenships.length)],
      criminal_record: Math.random() > 0.9 ? 'Yes - Minor offense' : 'No',
      resume_url: `/resumes/${name.replace(' ', '_')}_resume.pdf`
    };

    applicantsToCreate.push(applicant);
  }

  const { data: createdApplicants, error: applicantError } = await supabase
    .from('applicants')
    .insert(applicantsToCreate)
    .select();

  if (applicantError) {
    console.error('Error creating applicants:', applicantError);
    throw applicantError;
  }

  for (let i = 0; i < createdApplicants.length; i++) {
    const isPoints = i >= randomCount;
    const application = {
      job_id: jobId,
      applicant_id: createdApplicants[i].id,
      application_type: isPoints ? 'points' : 'random',
      points_used: isPoints ? Math.floor(Math.random() * 150) + 50 : 0,
      status: 'pending',
      application_status: 'applicant',
      applied_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    applicationsToCreate.push(application);
  }

  const { error: applicationError } = await supabase
    .from('applications')
    .insert(applicationsToCreate);

  if (applicationError) {
    console.error('Error creating applications:', applicationError);
    throw applicationError;
  }

  return true;
}
