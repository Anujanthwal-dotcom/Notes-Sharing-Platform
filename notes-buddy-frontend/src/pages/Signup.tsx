import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, collegeService, courseService } from '../services/endpoints';
import { useAuth } from '../context/AuthContext';
import type { College, Course, SignupPayload } from '../types';
import { UserPlus, Mail, Lock, Loader2, ArrowRight, ArrowLeft, Check, Eye, EyeOff, GraduationCap, Building2, Calendar } from 'lucide-react';

type Step = 'email' | 'otp' | 'details';

export default function Signup() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [regToken, setRegToken] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [course, setCourse] = useState('');
  const [customCourse, setCustomCourse] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('custom');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    collegeService.getAll().then((res) => setColleges(res.data)).catch(() => {});
    courseService.getAll().then((res) => setCourses(res.data)).catch(() => {});
  }, []);

  const handleCollegeSelect = (val: string) => {
    setSelectedCollegeId(val);
    if (val !== 'custom') {
      const c = colleges.find((c) => String(c.id) === val);
      if (c) {
        setCollegeName(c.college_name);
        setCollegeCode(c.college_code);
      }
    } else {
      setCollegeName('');
      setCollegeCode('');
    }
  };

  const getSelectedCourse = (): string => {
    if (course === 'custom') return customCourse.trim();
    return course;
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.getOtp(email);
      setSuccess('OTP sent to your email!');
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await authService.verifyOtp(email, otp);
      setRegToken(res.data.registration_token);
      setSuccess('Email verified successfully!');
      setStep('details');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!collegeName.trim() || !collegeCode.trim()) {
      setError('Please select or enter your college details.');
      return;
    }

    const selectedCourse = getSelectedCourse();
    if (!selectedCourse) {
      setError('Please select or enter your course.');
      return;
    }

    setLoading(true);
    try {
      const payload: SignupPayload = {
        name,
        password,
        course: selectedCourse,
        collegeName: collegeName.trim(),
        collegeCode: collegeCode.trim(),
        startYear: parseInt(startYear),
        endYear: parseInt(endYear),
        registration_token: regToken,
      };
      const res = await authService.signup(payload);
      login(res.data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const stepIndicator = (s: Step, label: string, num: number) => {
    const isActive = step === s;
    const isComplete =
      (s === 'email' && (step === 'otp' || step === 'details')) ||
      (s === 'otp' && step === 'details');
    return (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
          isComplete ? 'bg-success text-white' : isActive ? 'bg-primary text-white' : 'bg-white/10 text-text-muted'
        }`}>
          {isComplete ? <Check className="w-4 h-4" /> : num}
        </div>
        <span className={`text-sm font-medium hidden sm:inline ${isActive ? 'text-text-primary' : 'text-text-muted'}`}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl shadow-primary/20 mb-5">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-text-secondary">Join NotesBuddy and start sharing</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8">
          {stepIndicator('email', 'Email', 1)}
          <div className="w-8 h-px bg-white/10" />
          {stepIndicator('otp', 'Verify', 2)}
          <div className="w-8 h-px bg-white/10" />
          {stepIndicator('details', 'Details', 3)}
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-surface/60 border border-white/10 backdrop-blur-sm p-8">
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-5 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm">{success}</div>
          )}

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@college.edu"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <p className="text-sm text-text-secondary mb-1">
                We sent a verification code to <span className="text-primary-light font-medium">{email}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="Enter 8-character OTP"
                  maxLength={8}
                  className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary text-center text-lg tracking-[0.3em] font-mono placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(''); setSuccess(''); }}
                  className="px-5 py-3 rounded-xl font-medium text-text-secondary border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Details */}
          {step === 'details' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                    {showPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* College Selection */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  <div className="flex items-center gap-2"><Building2 className="w-4 h-4" /> College</div>
                </label>
                <select
                  value={selectedCollegeId}
                  onChange={(e) => handleCollegeSelect(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="custom">— Enter my own college —</option>
                  {colleges.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.college_name} ({c.college_code})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCollegeId === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">College Name</label>
                    <input
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      required
                      placeholder="MIT"
                      className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">College Code</label>
                    <input
                      type="text"
                      value={collegeCode}
                      onChange={(e) => setCollegeCode(e.target.value)}
                      required
                      placeholder="MIT001"
                      className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Course</div>
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">— Select your course —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.course}>
                      {c.course}
                    </option>
                  ))}
                  <option value="custom">— Enter my own course —</option>
                </select>
              </div>

              {course === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Course Name</label>
                  <input
                    type="text"
                    value={customCourse}
                    onChange={(e) => setCustomCourse(e.target.value)}
                    required
                    placeholder="B.Tech Computer Science"
                    className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Start Year</div>
                  </label>
                  <input
                    type="number"
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    required
                    min={1900}
                    max={2100}
                    placeholder="2022"
                    className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">End Year</label>
                  <input
                    type="number"
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    required
                    min={1900}
                    max={2100}
                    placeholder="2026"
                    className="w-full px-4 py-3 rounded-xl bg-bg-dark/60 border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-light hover:text-primary font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
