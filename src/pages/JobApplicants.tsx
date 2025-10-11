import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, User, Mail, Phone, FileText, MessageSquare, X, Download, MapPin, Award, GraduationCap, Briefcase, AlertCircle } from 'lucide-react';

interface Applicant {
  id: string;
  name: string;
  age: number;
  gender: string;
  experience: string;
  degree: string;
  email: string;
  phone: string;
  citizenship: string;
  criminalRecord: string;
  resumeUrl: string;
  appliedDate: string;
  pointsUsed?: number;
}

export default function JobApplicants() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [randomApplicants, setRandomApplicants] = useState<Applicant[]>([]);
  const [pointsApplicants, setPointsApplicants] = useState<Applicant[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [searchRandom, setSearchRandom] = useState('');
  const [searchPoints, setSearchPoints] = useState('');
  const [filterExperience, setFilterExperience] = useState('all');
  const [filterDegree, setFilterDegree] = useState('all');

  useEffect(() => {
    loadJobAndApplicants();
  }, [jobId]);

  const loadJobAndApplicants = () => {
    const savedItems = localStorage.getItem('rushWorkingPostedItems');
    if (savedItems) {
      const items = JSON.parse(savedItems);
      const job = items.find((item: any) => item.id === jobId);
      setJobInfo(job);
    }

    const savedApplicants = localStorage.getItem('rushWorkingApplicants');
    if (savedApplicants) {
      const allApplicants = JSON.parse(savedApplicants);
      if (allApplicants[jobId!]) {
        setRandomApplicants(allApplicants[jobId!].random || []);
        setPointsApplicants(allApplicants[jobId!].points || []);
      } else {
        generateMockApplicants();
      }
    } else {
      generateMockApplicants();
    }
  };

  const generateMockApplicants = () => {
    const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Lisa', 'Robert', 'Maria', 'William', 'Jennifer', 'Richard', 'Amanda', 'Thomas'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore'];
    const genders = ['Male', 'Female', 'Non-binary'];
    const experiences = ['Entry Level (0-2 years)', 'Mid Level (3-5 years)', 'Senior Level (6-10 years)', 'Expert Level (10+ years)'];
    const degrees = ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD'];
    const citizenships = ['US Citizen', 'Permanent Resident', 'Work Visa (H1B)', 'Work Authorization (EAD)'];

    const createApplicant = (isPoints: boolean, index: number): Applicant => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;

      return {
        id: `${isPoints ? 'points' : 'random'}-${jobId}-${index}`,
        name,
        age: Math.floor(Math.random() * 30) + 22,
        gender: genders[Math.floor(Math.random() * genders.length)],
        experience: experiences[Math.floor(Math.random() * experiences.length)],
        degree: degrees[Math.floor(Math.random() * degrees.length)],
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        citizenship: citizenships[Math.floor(Math.random() * citizenships.length)],
        criminalRecord: Math.random() > 0.9 ? 'Yes - Minor offense' : 'No',
        resumeUrl: `/resumes/${name.replace(' ', '_')}_resume.pdf`,
        appliedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        pointsUsed: isPoints ? Math.floor(Math.random() * 150) + 50 : undefined,
      };
    };

    const randomCount = Math.floor(Math.random() * 30) + 20;
    const pointsCount = Math.floor(Math.random() * 30) + 15;

    const randomPool = Array.from({ length: randomCount }, (_, i) => createApplicant(false, i));
    const pointsPool = Array.from({ length: pointsCount }, (_, i) => createApplicant(true, i));

    setRandomApplicants(randomPool);
    setPointsApplicants(pointsPool);

    const savedApplicants = localStorage.getItem('rushWorkingApplicants');
    const allApplicants = savedApplicants ? JSON.parse(savedApplicants) : {};
    allApplicants[jobId!] = {
      random: randomPool,
      points: pointsPool,
    };
    localStorage.setItem('rushWorkingApplicants', JSON.stringify(allApplicants));
  };

  const handleViewDetails = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setShowDetailsModal(true);
  };

  const handleViewResume = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setShowResumeModal(true);
  };

  const handleMessage = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setShowMessageModal(true);
    setMessageText('');
  };

  const sendMessage = () => {
    alert(`Message sent to ${selectedApplicant?.name}!`);
    setShowMessageModal(false);
    setMessageText('');
  };

  const filterApplicants = (applicants: Applicant[], searchTerm: string) => {
    return applicants.filter(applicant => {
      const matchesSearch = applicant.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesExperience = filterExperience === 'all' || applicant.experience.includes(filterExperience);
      const matchesDegree = filterDegree === 'all' || applicant.degree.includes(filterDegree);
      return matchesSearch && matchesExperience && matchesDegree;
    });
  };

  const filteredRandomApplicants = filterApplicants(randomApplicants, searchRandom);
  const filteredPointsApplicants = filterApplicants(pointsApplicants, searchPoints);

  if (!jobInfo) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <button
            onClick={() => navigate('/hire')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Return to Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/hire')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Posts
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{jobInfo.title}</h1>
            <div className="flex items-center text-gray-600 space-x-4">
              <span className="font-medium">{jobInfo.company}</span>
              <span>•</span>
              <span>{jobInfo.location}</span>
              <span>•</span>
              <span>Posted {new Date(jobInfo.postedDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Applicants</p>
            <p className="text-3xl font-bold text-blue-600">{randomApplicants.length + pointsApplicants.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter Applicants
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Experience:</label>
              <select
                value={filterExperience}
                onChange={(e) => setFilterExperience(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All</option>
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Expert">Expert Level</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Degree:</label>
              <select
                value={filterDegree}
                onChange={(e) => setFilterDegree(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All</option>
                <option value="High School">High School</option>
                <option value="Associate">Associate</option>
                <option value="Bachelor">Bachelor's</option>
                <option value="Master">Master's</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            {(filterExperience !== 'all' || filterDegree !== 'all') && (
              <button
                onClick={() => {
                  setFilterExperience('all');
                  setFilterDegree('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Random Pool</h2>
            <p className="text-gray-100 text-sm">Standard applicants without point usage</p>
            <div className="mt-4">
              <span className="inline-block bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-lg">
                {filteredRandomApplicants.length} Applicants
              </span>
            </div>
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchRandom}
                onChange={(e) => setSearchRandom(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-[800px] overflow-y-auto">
            {filteredRandomApplicants.map((applicant) => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                onViewDetails={handleViewDetails}
                onViewResume={handleViewResume}
                onMessage={handleMessage}
                poolType="random"
              />
            ))}
            {filteredRandomApplicants.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No applicants found</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-blue-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Points Pool</h2>
            <p className="text-blue-100 text-sm">Priority applicants who used points</p>
            <div className="mt-4">
              <span className="inline-block bg-white text-blue-900 px-4 py-2 rounded-full font-bold text-lg">
                {filteredPointsApplicants.length} Applicants
              </span>
            </div>
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchPoints}
                onChange={(e) => setSearchPoints(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-[800px] overflow-y-auto">
            {filteredPointsApplicants.map((applicant) => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                onViewDetails={handleViewDetails}
                onViewResume={handleViewResume}
                onMessage={handleMessage}
                poolType="points"
              />
            ))}
            {filteredPointsApplicants.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No applicants found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDetailsModal && selectedApplicant && (
        <DetailsModal
          applicant={selectedApplicant}
          onClose={() => setShowDetailsModal(false)}
          onViewResume={() => {
            setShowDetailsModal(false);
            setShowResumeModal(true);
          }}
          onMessage={() => {
            setShowDetailsModal(false);
            setShowMessageModal(true);
          }}
        />
      )}

      {showResumeModal && selectedApplicant && (
        <ResumeModal
          applicant={selectedApplicant}
          onClose={() => setShowResumeModal(false)}
        />
      )}

      {showMessageModal && selectedApplicant && (
        <MessageModal
          applicant={selectedApplicant}
          messageText={messageText}
          setMessageText={setMessageText}
          onSend={sendMessage}
          onClose={() => setShowMessageModal(false)}
        />
      )}
    </div>
  );
}

interface ApplicantCardProps {
  applicant: Applicant;
  onViewDetails: (applicant: Applicant) => void;
  onViewResume: (applicant: Applicant) => void;
  onMessage: (applicant: Applicant) => void;
  poolType: 'random' | 'points';
}

function ApplicantCard({ applicant, onViewDetails, onViewResume, onMessage, poolType }: ApplicantCardProps) {
  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-all ${
      poolType === 'points' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${poolType === 'points' ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <User className={`h-5 w-5 ${poolType === 'points' ? 'text-blue-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{applicant.name}</h3>
            <p className="text-sm text-gray-600">
              {applicant.age} years • {applicant.gender}
            </p>
          </div>
        </div>
        {poolType === 'points' && (
          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
            {applicant.pointsUsed} pts
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start">
          <Briefcase className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-700">{applicant.experience}</span>
        </div>
        <div className="flex items-start">
          <GraduationCap className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-700">{applicant.degree}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onViewResume(applicant)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
        >
          <FileText className="h-4 w-4 mr-1" />
          Resume
        </button>
        <button
          onClick={() => onMessage(applicant)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Message
        </button>
        <button
          onClick={() => onViewDetails(applicant)}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            poolType === 'points'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 hover:bg-gray-800 text-white'
          }`}
        >
          More Details
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Applied {new Date(applicant.appliedDate).toLocaleDateString()}
      </p>
    </div>
  );
}

interface DetailsModalProps {
  applicant: Applicant;
  onClose: () => void;
  onViewResume: () => void;
  onMessage: () => void;
}

function DetailsModal({ applicant, onClose, onViewResume, onMessage }: DetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Applicant Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{applicant.name}</h3>
              <p className="text-gray-600">{applicant.age} years old • {applicant.gender}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Mail className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-900">Email</span>
              </div>
              <p className="text-gray-700">{applicant.email}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Phone className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-900">Phone</span>
              </div>
              <p className="text-gray-700">{applicant.phone}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Briefcase className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-900">Experience</span>
              </div>
              <p className="text-gray-700">{applicant.experience}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <GraduationCap className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-900">Education</span>
              </div>
              <p className="text-gray-700">{applicant.degree}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-900">Citizenship</span>
              </div>
              <p className="text-gray-700">{applicant.citizenship}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-900">Criminal Record</span>
              </div>
              <p className="text-gray-700">{applicant.criminalRecord}</p>
            </div>
          </div>

          {applicant.pointsUsed && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-semibold text-blue-900">Points Used: {applicant.pointsUsed}</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">This applicant used points for priority placement</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Applied:</span> {new Date(applicant.appliedDate).toLocaleDateString()} at {new Date(applicant.appliedDate).toLocaleTimeString()}
            </p>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onViewResume}
              className="flex-1 bg-gray-700 hover:bg-gray-800 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <FileText className="h-5 w-5 mr-2" />
              View Resume
            </button>
            <button
              onClick={onMessage}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ResumeModalProps {
  applicant: Applicant;
  onClose: () => void;
}

function ResumeModal({ applicant, onClose }: ResumeModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{applicant.name}'s Resume</h2>
            <p className="text-sm text-gray-600 mt-1">{applicant.email}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => alert('Resume download started!')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
            <div className="border-b-4 border-blue-600 pb-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{applicant.name}</h1>
              <p className="text-gray-600 mt-1">{applicant.email} • {applicant.phone}</p>
              <p className="text-gray-600">{applicant.citizenship}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Education</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900">{applicant.degree}</p>
                <p className="text-gray-600">University Name • 2020</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Experience</h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <p className="font-semibold text-gray-900">Senior Position</p>
                <p className="text-gray-600 text-sm mb-2">Company Name • 2020 - Present</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Led development of key features and improvements</li>
                  <li>Collaborated with cross-functional teams</li>
                  <li>Mentored junior developers</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900">Previous Position</p>
                <p className="text-gray-600 text-sm mb-2">Another Company • 2018 - 2020</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Developed and maintained applications</li>
                  <li>Implemented best practices</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'Git', 'Agile'].map(skill => (
                  <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MessageModalProps {
  applicant: Applicant;
  messageText: string;
  setMessageText: (text: string) => void;
  onSend: () => void;
  onClose: () => void;
}

function MessageModal({ applicant, messageText, setMessageText, onSend, onClose }: MessageModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Send Message</h2>
            <p className="text-sm text-gray-600 mt-1">To: {applicant.name} ({applicant.email})</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message here..."
            className="w-full h-48 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">Messages are sent directly to the applicant's email</p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onSend}
                disabled={!messageText.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
