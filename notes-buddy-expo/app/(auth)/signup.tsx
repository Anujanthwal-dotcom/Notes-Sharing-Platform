import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';
import { authService, collegeService, courseService } from '@/services/endpoints';
import { useAuth } from '@/context/AuthContext';
import type { College, Course, SignupPayload } from '@/types';

type Step = 'email' | 'otp' | 'details';

export default function SignupScreen() {
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
  const [selectedCollegeId, setSelectedCollegeId] = useState('custom');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();

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

  const handleSendOtp = async () => {
    if (!email.trim()) { setError('Please enter your email.'); return; }
    setError('');
    setLoading(true);
    try {
      await authService.getOtp(email.trim());
      setSuccess('OTP sent to your email!');
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) { setError('Please enter the OTP.'); return; }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await authService.verifyOtp(email.trim(), otp.trim());
      setRegToken(res.data.registration_token);
      setSuccess('Email verified successfully!');
      setStep('details');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError('');
    setSuccess('');
    if (!collegeName.trim() || !collegeCode.trim()) {
      setError('Please enter your college details.');
      return;
    }
    const selectedCourse = getSelectedCourse();
    if (!selectedCourse) {
      setError('Please select or enter your course.');
      return;
    }
    if (!name.trim() || !password || !startYear || !endYear) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const payload: SignupPayload = {
        name: name.trim(),
        password,
        course: selectedCourse,
        collegeName: collegeName.trim(),
        collegeCode: collegeCode.trim(),
        startYear: parseInt(startYear),
        endYear: parseInt(endYear),
        registration_token: regToken,
      };
      const res = await authService.signup(payload);
      await login(res.data.access_token);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const stepNum = step === 'email' ? 1 : step === 'otp' ? 2 : 3;

  const renderStepDot = (num: number, label: string) => {
    const isActive = stepNum === num;
    const isComplete = stepNum > num;
    return (
      <View style={styles.stepRow} key={num}>
        <View style={[
          styles.stepDot,
          isComplete && styles.stepDotComplete,
          isActive && styles.stepDotActive,
        ]}>
          {isComplete ? (
            <Ionicons name="checkmark" size={14} color="#fff" />
          ) : (
            <Text style={[styles.stepDotText, (isActive || isComplete) && { color: '#fff' }]}>{num}</Text>
          )}
        </View>
        <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{label}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-add-outline" size={28} color="#fff" />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join NotesBuddy and start sharing</Text>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {renderStepDot(1, 'Email')}
          <View style={styles.stepLine} />
          {renderStepDot(2, 'Verify')}
          <View style={styles.stepLine} />
          {renderStepDot(3, 'Details')}
        </View>

        {/* Card */}
        <View style={styles.card}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          {success ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          {/* Step 1: Email */}
          {step === 'email' && (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="mail-outline" size={18} color={Colors.dark.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@college.edu"
                    placeholderTextColor={Colors.dark.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.disabledBtn]}
                onPress={handleSendOtp}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="arrow-forward" size={20} color="#fff" />}
                <Text style={styles.primaryBtnText}>{loading ? 'Sending OTP...' : 'Send OTP'}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <>
              <Text style={styles.infoText}>
                We sent a verification code to <Text style={{ color: Colors.dark.primaryLight, fontWeight: '500' }}>{email}</Text>
              </Text>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Enter OTP</Text>
                <TextInput
                  style={[styles.inputRow, styles.input, { textAlign: 'center', letterSpacing: 8, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }]}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 8-char OTP"
                  placeholderTextColor={Colors.dark.textMuted}
                  maxLength={8}
                  autoCapitalize="characters"
                />
              </View>
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => { setStep('email'); setError(''); setSuccess(''); }}
                >
                  <Ionicons name="arrow-back" size={16} color={Colors.dark.textSecondary} />
                  <Text style={styles.secondaryBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1 }, loading && styles.disabledBtn]}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="checkmark" size={20} color="#fff" />}
                  <Text style={styles.primaryBtnText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Step 3: Details */}
          {step === 'details' && (
            <>
              {/* Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[styles.inputRow, styles.input]}
                  value={name}
                  onChangeText={setName}
                  placeholder="John Doe"
                  placeholderTextColor={Colors.dark.textMuted}
                />
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.dark.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Min. 6 characters"
                    placeholderTextColor={Colors.dark.textMuted}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.dark.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* College Picker */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  <Ionicons name="business-outline" size={14} color={Colors.dark.textSecondary} /> College
                </Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={selectedCollegeId}
                    onValueChange={handleCollegeSelect}
                    style={styles.picker}
                    dropdownIconColor={Colors.dark.textMuted}
                  >
                    <Picker.Item label="— Enter my own college —" value="custom" />
                    {colleges.map((c) => (
                      <Picker.Item key={c.id} label={`${c.college_name} (${c.college_code})`} value={String(c.id)} />
                    ))}
                  </Picker>
                </View>
              </View>

              {selectedCollegeId === 'custom' && (
                <View style={styles.row}>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.label}>College Name</Text>
                    <TextInput
                      style={[styles.inputRow, styles.input]}
                      value={collegeName}
                      onChangeText={setCollegeName}
                      placeholder="MIT"
                      placeholderTextColor={Colors.dark.textMuted}
                    />
                  </View>
                  <View style={{ width: Spacing.md }} />
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.label}>College Code</Text>
                    <TextInput
                      style={[styles.inputRow, styles.input]}
                      value={collegeCode}
                      onChangeText={setCollegeCode}
                      placeholder="MIT001"
                      placeholderTextColor={Colors.dark.textMuted}
                    />
                  </View>
                </View>
              )}

              {/* Course Picker */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  <Ionicons name="school-outline" size={14} color={Colors.dark.textSecondary} /> Course
                </Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={course}
                    onValueChange={setCourse}
                    style={styles.picker}
                    dropdownIconColor={Colors.dark.textMuted}
                  >
                    <Picker.Item label="— Select your course —" value="" />
                    {courses.map((c) => (
                      <Picker.Item key={c.id} label={c.course} value={c.course} />
                    ))}
                    <Picker.Item label="— Enter my own course —" value="custom" />
                  </Picker>
                </View>
              </View>

              {course === 'custom' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Course Name</Text>
                  <TextInput
                    style={[styles.inputRow, styles.input]}
                    value={customCourse}
                    onChangeText={setCustomCourse}
                    placeholder="B.Tech Computer Science"
                    placeholderTextColor={Colors.dark.textMuted}
                  />
                </View>
              )}

              {/* Years */}
              <View style={styles.row}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.dark.textSecondary} /> Start Year
                  </Text>
                  <TextInput
                    style={[styles.inputRow, styles.input]}
                    value={startYear}
                    onChangeText={setStartYear}
                    placeholder="2022"
                    placeholderTextColor={Colors.dark.textMuted}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
                <View style={{ width: Spacing.md }} />
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>End Year</Text>
                  <TextInput
                    style={[styles.inputRow, styles.input]}
                    value={endYear}
                    onChangeText={setEndYear}
                    placeholder="2026"
                    placeholderTextColor={Colors.dark.textMuted}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.disabledBtn]}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="person-add-outline" size={20} color="#fff" />}
                <Text style={styles.primaryBtnText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xxxl },
  header: { alignItems: 'center', marginBottom: Spacing.xxl },
  iconContainer: {
    width: 56, height: 56, borderRadius: BorderRadius.lg,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl,
    backgroundColor: Colors.dark.primary,
    shadowColor: Colors.dark.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  title: { fontSize: FontSize.xxxl, fontWeight: '700', color: Colors.dark.text, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.md, color: Colors.dark.textSecondary },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xxl },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stepDot: {
    width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.dark.white10,
  },
  stepDotActive: { backgroundColor: Colors.dark.primary },
  stepDotComplete: { backgroundColor: Colors.dark.success },
  stepDotText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.dark.textMuted },
  stepLabel: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.dark.textMuted },
  stepLabelActive: { color: Colors.dark.text },
  stepLine: { width: 24, height: 1, backgroundColor: Colors.dark.border, marginHorizontal: Spacing.sm },
  card: {
    borderRadius: BorderRadius.xl, backgroundColor: Colors.dark.surface,
    borderWidth: 1, borderColor: Colors.dark.border, padding: Spacing.xxl,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  errorText: { color: Colors.dark.danger, fontSize: FontSize.sm },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  successText: { color: Colors.dark.success, fontSize: FontSize.sm },
  infoText: { fontSize: FontSize.sm, color: Colors.dark.textSecondary, marginBottom: Spacing.lg },
  fieldGroup: { marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.dark.textSecondary, marginBottom: Spacing.sm },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(10, 14, 26, 0.6)', borderWidth: 1, borderColor: Colors.dark.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, height: 50,
  },
  inputIcon: { marginRight: Spacing.md },
  input: { flex: 1, color: Colors.dark.text, fontSize: FontSize.md },
  eyeBtn: { padding: Spacing.xs, marginLeft: Spacing.sm },
  pickerWrapper: {
    backgroundColor: 'rgba(10, 14, 26, 0.6)', borderWidth: 1, borderColor: Colors.dark.border,
    borderRadius: BorderRadius.md, overflow: 'hidden',
  },
  picker: { color: Colors.dark.text, height: 50 },
  row: { flexDirection: 'row' },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.dark.primary, borderRadius: BorderRadius.md, paddingVertical: 15,
    marginTop: Spacing.sm,
    shadowColor: Colors.dark.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  disabledBtn: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '600' },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: 15, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.dark.border, marginRight: Spacing.md,
  },
  secondaryBtnText: { color: Colors.dark.textSecondary, fontSize: FontSize.md, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xxl },
  footerText: { fontSize: FontSize.sm, color: Colors.dark.textSecondary },
  footerLink: { fontSize: FontSize.sm, color: Colors.dark.primaryLight, fontWeight: '500' },
});
