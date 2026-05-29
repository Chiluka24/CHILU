import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  LogOut,
  ChevronRight,
  Save,
  Loader2,
  Camera,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Trash2,
  X,
  MapPin,
  Globe,
  Phone,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Briefcase,
  GraduationCap,
  Clock,
  Building2,
  Laptop,
  Home,
  Cpu,
  Landmark,
  Activity,
  Factory,
  ShoppingCart,
  Zap,
  Calendar,
  HelpCircle
} from 'lucide-react';
import ImageCropperModal from '../../components/ui/ImageCropperModal';
import ProfilePictureModal from '../../components/appearance/ProfilePictureModal';
import CustomDropdown from '../../components/ui/CustomDropdown';
import PageHeader from '../../components/layout/PageHeader';
import { MaleIcon, FemaleIcon, OtherGenderIcon, PreferNotToSayIcon } from '../../components/icons/GenderIcons';
import { 
  InstagramIcon, 
  TwitterIcon, 
  LinkedInIcon, 
  YouTubeIcon, 
  TikTokIcon, 
  GitHubIcon 
} from '../../components/icons/PlatformIcons';
import { API_BASE } from '../../config/env';
import { validateEmail, validateUsername, validateName, validateBio, validatePassword } from '../../lib/validation';
import { optimizeAvatar } from '../../lib/imageOptimizer';
import { getBrandColor } from '../../lib/brandColors';

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>('Profile Information');
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    bio: '',
    avatar: '',
    phoneNumber: '',
    phoneCountryCode: '+1',
    dateOfBirth: '',
    gender: '',
    location: '',
    careerStatus: '',
    industry: '',
    website: '',
    socialProfiles: {
      instagram: '',
      twitter: '',
      linkedin: '',
      github: '',
      youtube: '',
      tiktok: ''
    }
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    phoneNumber?: string;
    website?: string;
  }>({});
  
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');
  
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [newPlatformUrl, setNewPlatformUrl] = useState('');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddPlatform = () => {
    if (selectedPlatform && newPlatformUrl.trim()) {
      setFormData(p => ({
        ...p,
        socialProfiles: {
          ...p.socialProfiles,
          [selectedPlatform]: newPlatformUrl.trim()
        }
      }));
      setSelectedPlatform('');
      setNewPlatformUrl('');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetch(`${API_BASE}/api/user`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
          throw new Error('Authentication failed');
        }
        if (!res.ok) throw new Error('Failed to load user data');
        return res.json();
      })
      .then(data => {
        // Unwrap the data field from API response
        const userData = data.data || data;
        // Split existing name into first and last name
        const nameParts = (userData.profile?.name || '').split(' ');
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          bio: userData.profile?.bio || '',
          avatar: userData.profile?.avatar || '',
          phoneNumber: userData.profile?.phoneNumber || '',
          phoneCountryCode: userData.profile?.phoneCountryCode || '+1',
          dateOfBirth: userData.profile?.dateOfBirth || '',
          gender: userData.profile?.gender || '',
          location: userData.profile?.location || '',
          careerStatus: userData.profile?.careerStatus || '',
          industry: userData.profile?.industry || '',
          website: userData.profile?.website || '',
          socialProfiles: {
            instagram: userData.profile?.socialProfiles?.instagram || '',
            twitter: userData.profile?.socialProfiles?.twitter || '',
            linkedin: userData.profile?.socialProfiles?.linkedin || '',
            github: userData.profile?.socialProfiles?.github || '',
            youtube: userData.profile?.socialProfiles?.youtube || '',
            tiktok: userData.profile?.socialProfiles?.tiktok || ''
          }
        });
        setLoading(false);
      })
      .catch(err => {
        if (err.message !== 'Authentication failed') {
          console.error(err);
        }
        setLoading(false);
      });
  }, [navigate]);

  const validateProfileForm = (): boolean => {
    const errors: typeof fieldErrors = {};
    
    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      errors.username = usernameValidation.error;
    }
    
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
    }
    
    if (formData.bio) {
      const bioValidation = validateBio(formData.bio);
      if (!bioValidation.isValid) {
        errors.bio = bioValidation.error;
      }
    }

    // Phone validation
    if (formData.phoneNumber && !formData.phoneNumber.match(/^\d{10,15}$/)) {
      errors.phoneNumber = 'Phone number must be 10-15 digits';
    }

    // Website validation
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      errors.website = 'Website must be a valid URL starting with http:// or https://';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) {
      setSaveStatus('error');
      setErrorMessage('Please fix the validation errors');
      return;
    }
    
    setSaveStatus('saving');
    setErrorMessage('');
    const token = localStorage.getItem('token');
    
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      const res = await fetch(`${API_BASE}/api/user`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          profile: {
            name: fullName,
            bio: formData.bio,
            avatar: formData.avatar,
            phoneNumber: formData.phoneNumber,
            phoneCountryCode: formData.phoneCountryCode,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            location: formData.location,
            careerStatus: formData.careerStatus,
            industry: formData.industry,
            website: formData.website,
            socialProfiles: formData.socialProfiles
          }
        })
      });
      
      if (res.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
        window.dispatchEvent(new Event('profileUpdated'));
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to save changes');
        setSaveStatus('error');
      }
    } catch (e) {
      setErrorMessage('Network error occurred');
      setSaveStatus('error');
    }
  };

  const handleSavePassword = async () => {
    if (!passwordData.current) {
      setPasswordError('Current password is required');
      setPasswordStatus('error');
      return;
    }
    
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('New passwords do not match');
      setPasswordStatus('error');
      return;
    }
    
    const passwordValidation = validatePassword(passwordData.new);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || 'Invalid password');
      setPasswordStatus('error');
      return;
    }

    setPasswordStatus('saving');
    setPasswordError('');
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_BASE}/api/user/password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new
        })
      });
      
      if (res.ok) {
        setPasswordStatus('saved');
        setPasswordData({ current: '', new: '', confirm: '' });
        setTimeout(() => setPasswordStatus('idle'), 3000);
      } else {
        const err = await res.json();
        setPasswordError(err.error || 'Failed to update password');
        setPasswordStatus('error');
      }
    } catch (e) {
      setPasswordError('Network error occurred');
      setPasswordStatus('error');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/api/user`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        localStorage.removeItem('token');
        navigate('/register');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete account');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while deleting account');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData(p => ({...p, avatar: ''}));
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_BASE}/api/user`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        profile: { avatar: '' }
      })
    }).then(res => {
      if (res.ok) window.dispatchEvent(new Event('profileUpdated'));
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCropComplete = (croppedFile: File) => {
    setCropImageUrl(null);
    const token = localStorage.getItem('token');
    if (!token) return;

    const formDataUpload = new FormData();
    formDataUpload.append('media', croppedFile);

    fetch(`${API_BASE}/api/user/appearance-media-file`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formDataUpload,
    })
      .then(res => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      })
      .then(payload => {
        const newAvatar = payload.url;
        setFormData(prev => ({ ...prev, avatar: newAvatar }));
        
        fetch(`${API_BASE}/api/user`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            profile: { avatar: newAvatar }
          })
        }).then(res => {
          if (res.ok) window.dispatchEvent(new Event('profileUpdated'));
        });
      })
      .catch(err => {
        console.error(err);
        alert('Failed to upload image.');
      });
  };

  const handlePresetAvatarSelect = (avatarUrl: string) => {
    setFormData(prev => ({ ...prev, avatar: avatarUrl }));
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_BASE}/api/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        profile: { avatar: avatarUrl }
      })
    }).then(res => {
      if (res.ok) window.dispatchEvent(new Event('profileUpdated'));
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 app-page pb-12">
      <PageHeader
        title="Settings"
        subtitle="Manage your account preferences and configurations"
        action={
          <button
            onClick={() => navigate('/help')}
            className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:shadow-md ${formData.avatar ? 'hidden lg:inline-flex' : 'inline-flex'}`}
            style={{
              background: 'var(--card-bg)',
              border: '1.5px solid var(--border-default)',
              color: 'var(--heading-color)',
            }}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-semibold hidden sm:inline">
              Help &amp; Support
            </span>
          </button>
        }
      />


      <div className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-[11px] font-bold app-muted uppercase tracking-[0.12em] mb-4 ml-1">
            Account &amp; Security
          </h2>
          <div className="app-card" style={{ boxShadow: 'var(--shadow-sm)' }}>
            {/* Profile Information */}
            <div className={`border-b border-[var(--border-default)] transition-all duration-300 rounded-t-[inherit] ${activeSection === 'Profile Information' ? 'bg-gradient-to-br from-[var(--surface-subtle)] to-transparent' : ''}`}>
              <div 
                onClick={() => setActiveSection(activeSection === 'Profile Information' ? null : 'Profile Information')}
                className="flex items-center justify-between px-6 py-5 cursor-pointer group transition-all rounded-t-[inherit]"
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, var(--surface-subtle) 0%, transparent 100%)'}
                onMouseLeave={(e) => e.currentTarget.style.background = activeSection === 'Profile Information' ? 'linear-gradient(135deg, var(--surface-subtle) 0%, transparent 100%)' : 'transparent'}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, var(--surface-subtle) 0%, var(--surface-hover) 100%)', border: '1px solid var(--border-default)' }}>
                    <User className="w-5 h-5 transition-colors duration-300" style={{ color: activeSection === 'Profile Information' ? 'var(--accent)' : 'var(--icon-color)' }} />
                  </div>
                  <div>
                    <h3 className="text-[15px] lg:text-sm font-bold app-heading group-hover:text-[var(--accent)] transition-colors">Profile Information</h3>
                    <p className="text-[13px] lg:text-xs app-muted mt-0.5 font-medium">Update your name, bio, and avatar</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {formData.firstName && formData.email && (
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete
                    </div>
                  )}
                  <ChevronRight className={`w-5 h-5 app-muted transition-all duration-300 ${activeSection === 'Profile Information' ? 'rotate-90 text-[var(--accent)]' : 'group-hover:translate-x-1'}`} />
                </div>
              </div>

              {activeSection === 'Profile Information' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="px-6 pb-7 pt-3 border-t border-[var(--border-default)]" style={{ background: 'linear-gradient(180deg, var(--surface-subtle) 0%, transparent 100%)' }}
                >
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--accent)' }} />
                        <p className="text-sm app-muted font-medium">Loading your profile...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-7">
                      {/* Avatar */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 p-5 rounded-xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-default)' }}>
                        {/* Hidden file input for the modal's upload flow */}
                        <input ref={avatarFileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                        <div className="relative group cursor-pointer" onClick={() => setShowProfilePicModal(true)}>
                          {formData.avatar ? (
                            <div className="relative">
                              <img src={optimizeAvatar(formData.avatar)} alt="Avatar" loading="lazy" className="w-24 h-24 rounded-2xl object-cover border-2 border-[var(--border-default)] shadow-sm" />
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                            </div>
                          ) : (
                            <div className="w-24 h-24 rounded-2xl flex items-center justify-center border-2 border-dashed border-[var(--border-default)]" style={{ background: 'linear-gradient(135deg, var(--surface-subtle) 0%, var(--surface-hover) 100%)', color: 'var(--muted-text)' }}>
                              <User className="w-10 h-10" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 text-white">
                            <Camera className="w-6 h-6 mb-1" />
                            <span className="text-xs font-semibold">Change</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-[15px] lg:text-sm font-bold app-heading">Profile Photo</p>
                          <p className="text-[13px] lg:text-xs app-muted mt-1 font-medium">Recommended 400x400px • Max 5MB</p>
                          <p className="text-xs app-muted mt-1.5">JPG, PNG or GIF format</p>
                          {formData.avatar && (
                            <button onClick={handleRemoveAvatar} className="text-xs font-semibold mt-3 px-3 py-1.5 rounded-lg transition-all hover:bg-red-50" style={{ color: 'var(--error-500)' }}>
                              Remove Photo
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-medium app-heading uppercase tracking-[0.06em] mb-2 flex items-center gap-1.5">
                            First Name 
                            <span style={{ color: 'var(--error-500)' }}>*</span>
                          </label>
                          <input 
                            type="text" 
                            value={formData.firstName} 
                            onChange={e => {
                              setFormData(p => ({...p, firstName: e.target.value}));
                              setFieldErrors(prev => ({...prev, firstName: undefined}));
                            }}
                            className={`w-full px-4 py-3 lg:py-2.5 app-input text-[15px] lg:text-[13px] font-medium transition-all ${fieldErrors.firstName ? 'border-red-300 focus:ring-red-500' : ''}`}
                            placeholder="John" 
                          />
                          {fieldErrors.firstName && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: 'var(--error-600)', background: 'var(--error-50)' }}>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{fieldErrors.firstName}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium app-heading uppercase tracking-[0.06em] mb-2">Last Name</label>
                          <input 
                            type="text" 
                            value={formData.lastName} 
                            onChange={e => setFormData(p => ({...p, lastName: e.target.value}))}
                            className="w-full px-4 py-3 lg:py-2.5 app-input text-[15px] lg:text-[13px] font-medium transition-all"
                            placeholder="Doe" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium app-heading uppercase tracking-[0.06em] mb-2 flex items-center gap-1.5">
                            Username 
                            <span style={{ color: 'var(--error-500)' }}>*</span>
                          </label>
                          <input 
                            type="text" 
                            value={formData.username} 
                            onChange={e => {
                              setFormData(p => ({...p, username: e.target.value}));
                              setFieldErrors(prev => ({...prev, username: undefined}));
                            }}
                            className={`w-full px-4 py-3 lg:py-2.5 app-input text-[15px] lg:text-[13px] font-medium transition-all ${fieldErrors.username ? 'border-red-300 focus:ring-red-500' : ''}`}
                            placeholder="johndoe" 
                          />
                          {fieldErrors.username && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: 'var(--error-600)', background: 'var(--error-50)' }}>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{fieldErrors.username}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium app-heading uppercase tracking-[0.06em] mb-2 flex items-center gap-1.5">
                            Email Address 
                            <span style={{ color: 'var(--error-500)' }}>*</span>
                          </label>
                          <input 
                            type="email" 
                            value={formData.email} 
                            onChange={e => {
                              setFormData(p => ({...p, email: e.target.value}));
                              setFieldErrors(prev => ({...prev, email: undefined}));
                            }}
                            className={`w-full px-4 py-3 lg:py-2.5 app-input text-[15px] lg:text-[13px] font-medium transition-all ${fieldErrors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                            placeholder="john@example.com" 
                          />
                          {fieldErrors.email && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: 'var(--error-600)', background: 'var(--error-50)' }}>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{fieldErrors.email}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium app-heading uppercase tracking-[0.06em] mb-2">Phone Number</label>
                          <div className="flex gap-2 relative">
                            <div className="w-[120px] shrink-0">
                              <CustomDropdown
                                value={formData.phoneCountryCode}
                                onChange={(val) => setFormData(p => ({...p, phoneCountryCode: val}))}
                                options={[
                                  { value: '+1', label: '+1 (USA)' },
                                  { value: '+44', label: '+44 (UK)' },
                                  { value: '+61', label: '+61 (AU)' },
                                  { value: '+91', label: '+91 (IN)' },
                                  { value: '+86', label: '+86 (CN)' },
                                  { value: '+81', label: '+81 (JP)' },
                                  { value: '+49', label: '+49 (DE)' },
                                  { value: '+33', label: '+33 (FR)' },
                                  { value: '+55', label: '+55 (BR)' },
                                  { value: '+52', label: '+52 (MX)' },
                                ]}
                              />
                            </div>
                            <input 
                              type="tel" 
                              value={formData.phoneNumber} 
                              onChange={e => {
                                setFormData(p => ({...p, phoneNumber: e.target.value}));
                                setFieldErrors(prev => ({...prev, phoneNumber: undefined}));
                              }}
                              className={`flex-1 min-w-0 px-4 py-3 lg:py-2.5 app-input text-[15px] lg:text-[13px] font-medium transition-all ${fieldErrors.phoneNumber ? 'border-red-300 focus:ring-red-500' : ''}`}
                              placeholder="1234567890" 
                            />
                          </div>
                          {fieldErrors.phoneNumber && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: 'var(--error-600)', background: 'var(--error-50)' }}>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{fieldErrors.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium app-heading uppercase tracking-[0.06em] mb-2">Date of Birth</label>
                          <input 
                            type="date" 
                            value={formData.dateOfBirth} 
                            max={new Date().toISOString().split('T')[0]}
                            min="1900-01-01"
                            onChange={e => setFormData(p => ({...p, dateOfBirth: e.target.value}))}
                            className="w-full px-4 py-3 lg:py-2.5 app-input text-[15px] lg:text-[13px] font-medium transition-all"
                            style={{ colorScheme: 'var(--color-scheme, light)', color: formData.dateOfBirth ? 'var(--heading-color)' : 'var(--muted-color)' }}
                          />
                        </div>
                        <div className="relative" style={{ zIndex: 21 }}>
                          <label className="block text-[10px] font-medium app-heading uppercase tracking-[0.06em] mb-2">Gender</label>
                          <CustomDropdown
                            value={formData.gender}
                            onChange={(val) => setFormData(p => ({...p, gender: val}))}
                            placeholder="Select gender"
                            className="text-[15px] lg:text-[13px] font-medium"
                            options={[
                              { value: 'male', label: 'Male', icon: MaleIcon },
                              { value: 'female', label: 'Female', icon: FemaleIcon },
                              { value: 'Other', label: 'Other', icon: OtherGenderIcon },
                              { value: 'prefer-not-to-say', label: 'Prefer not to say', icon: PreferNotToSayIcon }
                            ]}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium app-heading uppercase tracking-[0.06em] mb-2">Location</label>
                          <input 
                            type="text" 
                            value={formData.location} 
                            onChange={e => setFormData(p => ({...p, location: e.target.value}))}
                            className="w-full px-4 py-3 lg:py-2.5 app-input text-[15px] lg:text-[13px] font-medium transition-all"
                            placeholder="San Francisco, CA" 
                          />
                        </div>
                        <div className="relative" style={{ zIndex: 20 }}>
                          <label className="block text-[10px] font-medium app-heading uppercase tracking-[0.06em] mb-2">Career Status</label>
                          <CustomDropdown
                            value={formData.careerStatus}
                            onChange={(val) => setFormData(p => ({...p, careerStatus: val}))}
                            placeholder="Select status"
                            className="text-[15px] lg:text-[13px] font-medium"
                            options={[
                              { value: 'student', label: 'Student', icon: GraduationCap },
                              { value: 'full-time', label: 'Working Full-time', icon: Briefcase },
                              { value: 'part-time', label: 'Working Part-time', icon: Clock },
                              { value: 'business-owner', label: 'Business Owner', icon: Building2 },
                              { value: 'freelancer', label: 'Freelancer', icon: Laptop },
                              { value: 'homemaker', label: 'Homemaker', icon: Home }
                            ]}
                          />
                        </div>
                        <div className="relative" style={{ zIndex: 19 }}>
                          <label className="block text-[10px] font-medium app-heading uppercase tracking-[0.06em] mb-2">Industry</label>
                          <CustomDropdown
                            value={formData.industry}
                            onChange={(val) => setFormData(p => ({...p, industry: val}))}
                            placeholder="Select industry"
                            className="text-[15px] lg:text-[13px] font-medium"
                            options={[
                              { value: 'technology', label: 'Technology', icon: Cpu },
                              { value: 'finance-insurance', label: 'Finance & Insurance', icon: Landmark },
                              { value: 'healthcare', label: 'Healthcare', icon: Activity },
                              { value: 'manufacturing', label: 'Manufacturing', icon: Factory },
                              { value: 'retail-ecommerce', label: 'Retail & E-commerce', icon: ShoppingCart },
                              { value: 'energy-utilities', label: 'Energy & Utilities', icon: Zap }
                            ]}
                          />
                        </div>
                        <div className="md:col-span-2 relative" style={{ zIndex: 10 }}>
                          <label className="block text-[10px] font-medium app-heading uppercase tracking-[0.06em] mb-2">Website</label>
                          <input 
                            type="url" 
                            value={formData.website} 
                            onChange={e => {
                              setFormData(p => ({...p, website: e.target.value}));
                              setFieldErrors(prev => ({...prev, website: undefined}));
                            }}
                            className={`w-full px-4 py-3 lg:py-2.5 app-input text-[15px] lg:text-[13px] font-medium transition-all ${fieldErrors.website ? 'border-red-300 focus:ring-red-500' : ''}`}
                            placeholder="https://johndoe.com" 
                          />
                          {fieldErrors.website && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: 'var(--error-600)', background: 'var(--error-50)' }}>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{fieldErrors.website}</span>
                            </div>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-medium app-heading uppercase tracking-[0.06em] mb-2">Bio</label>
                          <textarea 
                            rows={4} 
                            value={formData.bio} 
                            onChange={e => {
                              setFormData(p => ({...p, bio: e.target.value}));
                              setFieldErrors(prev => ({...prev, bio: undefined}));
                            }}
                            className={`w-full px-4 py-3 lg:py-2.5 app-textarea text-[15px] lg:text-[13px] font-medium resize-none transition-all ${fieldErrors.bio ? 'border-red-300 focus:ring-red-500' : ''}`}
                            placeholder="Tell us about yourself..." 
                          />
                          {fieldErrors.bio && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: 'var(--error-600)', background: 'var(--error-50)' }}>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{fieldErrors.bio}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs app-muted font-medium">{formData.bio.length}/500 characters</p>
                            <div className="h-1.5 w-24 rounded-full overflow-hidden" style={{ background: 'var(--surface-subtle)' }}>
                              <div 
                                className="h-full rounded-full transition-all duration-300" 
                                style={{ 
                                  width: `${(formData.bio.length / 500) * 100}%`,
                                  background: formData.bio.length > 450 ? 'var(--error-500)' : 'linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 100%)'
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Profile Media Section */}
                      <div className="mt-8 p-6 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--surface-subtle) 0%, transparent 100%)', border: '1px solid var(--border-default)' }}>
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-[15px] lg:text-sm font-bold app-heading flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)' }}>
                              <Globe className="w-4 h-4 text-white" />
                            </div>
                            Social Media Profiles
                          </h4>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-default)', color: 'var(--accent)' }}>
                            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }}></div>
                            {Object.values(formData.socialProfiles).filter(Boolean).length} connected
                          </div>
                        </div>

                        {/* Connected Profiles List */}
                        <div className="space-y-3 mb-6">
                          {Object.entries(formData.socialProfiles).map(([platform, value]) => {
                            if (!value) return null;
                            
                            const platformConfig = {
                              instagram: {
                                name: 'Instagram',
                                icon: InstagramIcon,
                                color: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                                placeholder: 'https://www.instagram.com/'
                              },
                              twitter: {
                                name: 'Twitter / X',
                                icon: TwitterIcon,
                                color: '#000000',
                                placeholder: 'https://x.com/'
                              },
                              linkedin: {
                                name: 'LinkedIn',
                                icon: LinkedInIcon,
                                color: '#0077B5',
                                placeholder: 'https://linkedin.com/in/'
                              },
                              github: {
                                name: 'GitHub',
                                icon: GitHubIcon,
                                color: 'var(--heading-color)',
                                placeholder: 'https://github.com/'
                              },
                              youtube: {
                                name: 'YouTube',
                                icon: YouTubeIcon,
                                color: '#FF0000',
                                placeholder: 'https://youtube.com/@'
                              },
                              tiktok: {
                                name: 'TikTok',
                                icon: TikTokIcon,
                                color: '#000000',
                                placeholder: 'https://tiktok.com/@'
                              }
                            }[platform];

                            if (!platformConfig) return null;
                            const IconComponent = platformConfig.icon;

                            return (
                              <div key={platform} className="app-card p-4 transition-all hover:shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                  <div className="flex justify-between items-center w-full sm:w-auto">
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                      <div 
                                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: platformConfig.color }}
                                      >
                                        <IconComponent className="w-4 h-4 text-white" />
                                      </div>
                                      <div className="flex-shrink-0">
                                        <h5 className="text-sm font-semibold app-heading">{platformConfig.name}</h5>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => setFormData(p => ({
                                        ...p,
                                        socialProfiles: {
                                          ...p.socialProfiles,
                                          [platform]: ''
                                        }
                                      }))}
                                      className="p-1.5 rounded-md transition-colors text-[var(--muted-color)] hover:text-red-600 hover:bg-red-50 sm:hidden"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <input 
                                    type="text" 
                                    value={value}
                                    onChange={e => setFormData(p => ({
                                      ...p,
                                      socialProfiles: {
                                        ...p.socialProfiles,
                                        [platform]: e.target.value
                                      }
                                    }))}
                                    className="flex-1 px-3 py-2.5 app-input text-sm w-full"
                                    placeholder={platformConfig.placeholder}
                                  />
                                  <button
                                    onClick={() => setFormData(p => ({
                                      ...p,
                                      socialProfiles: {
                                        ...p.socialProfiles,
                                        [platform]: ''
                                      }
                                    }))}
                                    className="p-1.5 rounded-md transition-colors text-[var(--muted-color)] hover:text-red-600 hover:bg-red-50 flex-shrink-0 hidden sm:block"
                                  >
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Add New Platform Interface */}
                        <div className="app-card p-4" style={{ border: Object.values(formData.socialProfiles).some(Boolean) ? '1px solid var(--border-default)' : '2px dashed var(--border-default)' }}>
                          {!Object.values(formData.socialProfiles).some(Boolean) && (
                            <div className="text-center mb-4">
                              <p className="text-sm app-muted italic">No social profiles added yet</p>
                            </div>
                          )}
                          
                          <div className="flex flex-col sm:flex-row gap-3">
                            {/* Platform Selector */}
                            <div className="flex-shrink-0 min-w-[160px] relative" style={{ zIndex: 10 }}>
                              <CustomDropdown
                                value={selectedPlatform}
                                onChange={setSelectedPlatform}
                                placeholder="Select platform"
                                className="text-sm"
                                options={[
                                  {
                                    value: 'instagram',
                                    label: `Instagram${formData.socialProfiles.instagram ? ' (Connected)' : ''}`,
                                    icon: InstagramIcon,
                                    iconColor: getBrandColor('instagram'),
                                    disabled: !!formData.socialProfiles.instagram
                                  },
                                  {
                                    value: 'twitter',
                                    label: `Twitter / X${formData.socialProfiles.twitter ? ' (Connected)' : ''}`,
                                    icon: TwitterIcon,
                                    iconColor: getBrandColor('twitter'),
                                    disabled: !!formData.socialProfiles.twitter
                                  },
                                  {
                                    value: 'linkedin',
                                    label: `LinkedIn${formData.socialProfiles.linkedin ? ' (Connected)' : ''}`,
                                    icon: LinkedInIcon,
                                    iconColor: getBrandColor('linkedin'),
                                    disabled: !!formData.socialProfiles.linkedin
                                  },
                                  {
                                    value: 'youtube',
                                    label: `YouTube${formData.socialProfiles.youtube ? ' (Connected)' : ''}`,
                                    icon: YouTubeIcon,
                                    iconColor: getBrandColor('youtube'),
                                    disabled: !!formData.socialProfiles.youtube
                                  },
                                  {
                                    value: 'tiktok',
                                    label: `TikTok${formData.socialProfiles.tiktok ? ' (Connected)' : ''}`,
                                    icon: TikTokIcon,
                                    iconColor: getBrandColor('tiktok'),
                                    disabled: !!formData.socialProfiles.tiktok
                                  },
                                  {
                                    value: 'github',
                                    label: `GitHub${formData.socialProfiles.github ? ' (Connected)' : ''}`,
                                    icon: GitHubIcon,
                                    iconColor: getBrandColor('github'),
                                    disabled: !!formData.socialProfiles.github
                                  }
                                ]}
                              />
                            </div>

                            {/* URL Input */}
                            <input 
                              type="text" 
                              className="flex-1 px-3 py-2.5 app-input text-sm"
                              placeholder={selectedPlatform ? {
                                instagram: 'https://www.instagram.com/',
                                twitter: 'https://x.com/',
                                linkedin: 'https://linkedin.com/in/',
                                youtube: 'https://youtube.com/@',
                                tiktok: 'https://tiktok.com/@',
                                github: 'https://github.com/'
                              }[selectedPlatform] || 'https://...' : 'https://...'}
                              value={newPlatformUrl}
                              onChange={(e) => setNewPlatformUrl(e.target.value)}
                              disabled={!selectedPlatform}
                              style={!selectedPlatform ? { background: 'var(--surface-subtle)', cursor: 'not-allowed' } : {}}
                            />

                            {/* Add Button */}
                            <button 
                              className="app-button-primary px-4 py-2.5 text-sm whitespace-nowrap"
                              onClick={handleAddPlatform}
                              disabled={!selectedPlatform || !newPlatformUrl.trim()}
                              style={(!selectedPlatform || !newPlatformUrl.trim()) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                            >
                              <span className="text-lg leading-none mr-1">+</span>
                              Add
                            </button>
                          </div>

                          <p className="text-xs app-muted mt-3 text-center">
                            Select a platform from the dropdown to add your social profile
                          </p>
                        </div>

                        {/* Quick Actions */}
                        {Object.values(formData.socialProfiles).some(Boolean) && (
                          <div className="mt-4 p-3 rounded-lg" style={{ background: 'var(--surface-subtle)' }}>
                            <div className="flex items-center justify-between">
                              <div>
                                <h6 className="text-xs font-semibold app-heading">Quick Actions</h6>
                                <p className="text-xs app-muted">Manage all your social profiles</p>
                              </div>
                              <button 
                                onClick={() => {
                                  setFormData(p => ({
                                    ...p, 
                                    socialProfiles: {
                                      instagram: '',
                                      twitter: '',
                                      linkedin: '',
                                      github: '',
                                      youtube: '',
                                      tiktok: ''
                                    }
                                  }));
                                }}
                                className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors text-red-600 hover:bg-red-50"
                              >
                                Clear All
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 pt-4">
                        {saveStatus === 'error' && (
                          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold" style={{ color: 'var(--error-600)', background: 'var(--error-50)' }}>
                            <AlertCircle className="w-4 h-4" /> 
                            {errorMessage || 'Error saving'}
                          </div>
                        )}
                        {saveStatus === 'saved' && (
                          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold" style={{ color: 'var(--success-600)', background: 'var(--success-50)' }}>
                            <CheckCircle2 className="w-4 h-4" /> 
                            Saved successfully
                          </div>
                        )}
                        
                        <button 
                          onClick={handleSaveProfile} 
                          disabled={saveStatus === 'saving'}
                          className="px-8 py-3 lg:py-2.5 text-[15px] lg:text-sm font-bold rounded-xl transition-all w-full sm:w-auto shadow-sm hover:shadow-md disabled:opacity-50"
                          style={{ 
                            background: 'linear-gradient(135deg, var(--button-primary) 0%, var(--button-primary-hover) 100%)',
                            color: 'var(--button-primary-text)'
                          }}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {saveStatus === 'saving' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Password & Security */}
            <div className={`transition-all duration-300 rounded-b-[inherit] ${activeSection === 'Password & Security' ? 'bg-gradient-to-br from-[var(--surface-subtle)] to-transparent' : ''}`}>
              <div 
                onClick={() => setActiveSection(activeSection === 'Password & Security' ? null : 'Password & Security')}
                className="flex items-center justify-between px-6 py-5 cursor-pointer group transition-all rounded-b-[inherit]"
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, var(--surface-subtle) 0%, transparent 100%)'}
                onMouseLeave={(e) => e.currentTarget.style.background = activeSection === 'Password & Security' ? 'linear-gradient(135deg, var(--surface-subtle) 0%, transparent 100%)' : 'transparent'}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, var(--surface-subtle) 0%, var(--surface-hover) 100%)', border: '1px solid var(--border-default)' }}>
                    <Shield className="w-5 h-5 transition-colors duration-300" style={{ color: activeSection === 'Password & Security' ? 'var(--accent)' : 'var(--icon-color)' }} />
                  </div>
                  <div>
                    <h3 className="text-[15px] lg:text-sm font-bold app-heading group-hover:text-[var(--accent)] transition-colors">Password & Security</h3>
                    <p className="text-[13px] lg:text-xs app-muted mt-0.5 font-medium">Update your password to keep your account secure</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 app-muted transition-all duration-300 ${activeSection === 'Password & Security' ? 'rotate-90 text-[var(--accent)]' : 'group-hover:translate-x-1'}`} />
              </div>

              {activeSection === 'Password & Security' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="px-6 pb-7 pt-3 border-t border-[var(--border-default)]" style={{ background: 'linear-gradient(180deg, var(--surface-subtle) 0%, transparent 100%)' }}
                >
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-medium app-heading uppercase tracking-[0.06em] mb-2">Current Password</label>
                      <input 
                        type="password" 
                        value={passwordData.current} 
                        onChange={e => setPasswordData(p => ({...p, current: e.target.value}))} 
                        className="w-full px-4 py-3 lg:py-2.5 app-input text-[15px] lg:text-[13px] font-medium transition-all" 
                        placeholder="Enter current password" 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-medium app-heading uppercase tracking-[0.06em] mb-2">New Password</label>
                        <input 
                          type="password" 
                          value={passwordData.new} 
                          onChange={e => setPasswordData(p => ({...p, new: e.target.value}))} 
                          className="w-full px-4 py-3 lg:py-2.5 app-input text-[15px] lg:text-[13px] font-medium transition-all" 
                          placeholder="Enter new password" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium app-heading uppercase tracking-[0.06em] mb-2">Confirm New Password</label>
                        <input 
                          type="password" 
                          value={passwordData.confirm} 
                          onChange={e => setPasswordData(p => ({...p, confirm: e.target.value}))} 
                          className="w-full px-4 py-3 lg:py-2.5 app-input text-[15px] lg:text-[13px] font-medium transition-all" 
                          placeholder="Confirm new password" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 pt-4">
                      {passwordStatus === 'error' && (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold" style={{ color: 'var(--error-600)', background: 'var(--error-50)' }}>
                          <AlertCircle className="w-4 h-4" /> 
                          {passwordError || 'Error saving'}
                        </div>
                      )}
                      {passwordStatus === 'saved' && (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold" style={{ color: 'var(--success-600)', background: 'var(--success-50)' }}>
                          <CheckCircle2 className="w-4 h-4" /> 
                          Password updated
                        </div>
                      )}
                      
                      <button 
                        onClick={handleSavePassword} 
                        disabled={passwordStatus === 'saving' || !passwordData.current || !passwordData.new || !passwordData.confirm}
                        className="px-8 py-3 lg:py-2.5 text-[15px] lg:text-sm font-bold rounded-xl transition-all w-full sm:w-auto shadow-sm hover:shadow-md disabled:opacity-50"
                        style={{ 
                          background: 'linear-gradient(135deg, var(--button-primary) 0%, var(--button-primary-hover) 100%)',
                          color: 'var(--button-primary-text)'
                        }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {passwordStatus === 'saving' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          <span>{passwordStatus === 'saving' ? 'Updating...' : 'Update Password'}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="pt-2"
        >
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] flex items-center gap-2 mb-4 ml-1" style={{ color: 'var(--error-600)' }}>
            <AlertTriangle className="w-4 h-4" /> Danger Zone
          </h2>
          <div className="app-card overflow-hidden" style={{ borderColor: 'var(--error-500)', borderWidth: '2px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)' }}>
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5" style={{ background: 'linear-gradient(135deg, var(--error-50) 0%, transparent 100%)' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--error-500)' }}>
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] lg:text-sm font-bold mb-1" style={{ color: 'var(--error-600)' }}>Delete Account</h3>
                  <p className="text-[13px] lg:text-xs font-medium" style={{ color: 'var(--error-500)' }}>Permanently delete your account, links, and all associated data. This action cannot be undone.</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 lg:py-2.5 text-white text-[15px] lg:text-sm font-bold rounded-xl transition-all shrink-0 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--error-600) 0%, var(--error-500) 100%)' }}
              >
                <Trash2 className="w-5 h-5" />
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="pt-2 flex justify-between items-center"
        >
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}
            className="flex items-center space-x-2.5 font-bold transition-all px-5 py-3 lg:py-2.5 rounded-xl text-[15px] lg:text-sm hover:bg-red-50"
            style={{ color: 'var(--error-600)' }}
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </motion.div>
      </div>

      {cropImageUrl && (
        <ImageCropperModal
          imageUrl={cropImageUrl}
          onCrop={handleCropComplete}
          onCancel={() => setCropImageUrl(null)}
        />
      )}

      {/* ═══ Profile Picture Modal ═══ */}
      <ProfilePictureModal
        isOpen={showProfilePicModal}
        onClose={() => setShowProfilePicModal(false)}
        currentAvatar={formData.avatar}
        onSelectAvatar={handlePresetAvatarSelect}
        onUploadClick={() => avatarFileInputRef.current?.click()}
      />

      {/* Delete Account Modal */}
      {showDeleteModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="app-modal p-7 w-full max-w-md relative"
            style={{ boxShadow: 'var(--shadow-xl)' }}
          >
            <button 
              onClick={() => {setShowDeleteModal(false); setDeleteConfirmText('');}} 
              className="absolute top-5 right-5 p-2 rounded-xl app-icon-button transition-all hover:bg-[var(--surface-subtle)]"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, var(--error-500) 0%, var(--error-600) 100%)' }}>
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            
            <h3 className="text-[22px] md:text-base font-bold app-heading mb-2">Delete Account</h3>
            <p className="text-[15px] lg:text-[13px] app-muted mb-6 leading-relaxed">
              This action is <strong className="font-bold" style={{ color: 'var(--error-600)' }}>irreversible</strong>. It will permanently delete your account, settings, links, analytics, and uploaded media.
            </p>

            <div className="mb-6">
              <label className="block text-[10px] font-medium app-heading uppercase tracking-[0.06em] mb-3">
                Type <span className="font-black px-2 py-1 rounded" style={{ background: 'var(--error-50)', color: 'var(--error-600)' }}>DELETE</span> to confirm
              </label>
              <input 
                type="text" 
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-3 lg:py-2.5 app-input text-[15px] lg:text-[13px] font-mono font-bold tracking-wider"
                placeholder="DELETE"
                style={{ letterSpacing: '0.1em' }}
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {setShowDeleteModal(false); setDeleteConfirmText('');}}
                className="flex-1 px-5 py-3 lg:py-2.5 text-[15px] lg:text-sm font-bold rounded-xl transition-all border-2 border-[var(--border-default)] hover:bg-[var(--surface-subtle)]"
                style={{ color: 'var(--heading-color)' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="flex-1 px-5 py-3 lg:py-2.5 disabled:opacity-40 text-white text-[15px] lg:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, var(--error-600) 0%, var(--error-500) 100%)' }}
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Deletion'}
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}
