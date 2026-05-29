import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageCircle,
  Instagram,
  Plus,
  Link2,
  MessageSquare,
  X,
  ToggleLeft,
  ToggleRight,
  Zap,
  Smartphone,
  Trash2,
  Loader2,
  CheckCircle2,
  ExternalLink,
  List,
  Target,
  Globe
} from 'lucide-react';
import { API_BASE } from '../../config/env';
import CustomDropdown from '../../components/ui/CustomDropdown';
import PageHeader from '../../components/layout/PageHeader';

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

interface AutomationRule {
  id: string;
  keyword: string;
  message: string;
  linkId: string;
  postId?: string;
  isActive: boolean;
  dmsSent: number;
}

const MOCK_POSTS = [
  { id: 'post_1', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=300&q=80' },
  { id: 'post_2', image: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=300&q=80' },
  { id: 'post_3', image: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&w=300&q=80' },
  { id: 'post_4', image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=300&q=80' },
  { id: 'post_5', image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=300&q=80' },
  { id: 'post_6', image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055ce?auto=format&fit=crop&w=300&q=80' },
];

export default function Automation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form State
  const [keyword, setKeyword] = useState('');
  const [message, setMessage] = useState('Hey! 👋 Here is the link you asked for:');
  const [selectedLinkId, setSelectedLinkId] = useState('');
  const [postSelectionMode, setPostSelectionMode] = useState<'any' | 'specific'>('any');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Instagram Connection State
  const [igConnected, setIgConnected] = useState(false);
  const [igHandle, setIgHandle] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [igHandleInput, setIgHandleInput] = useState('');
  const [testingRuleId, setTestingRuleId] = useState<string | null>(null);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Check if we just returned from an OAuth redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      alert('✅ Instagram Connected Successfully!');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const fetchData = async () => {
      try {
        const [userRes, linksRes, automationsRes] = await Promise.all([
          fetch(`${API_BASE}/api/user`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/links`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/automations`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        for (const res of [userRes, linksRes, automationsRes]) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
        }

        const userResponse = await userRes.json();
        const userData = userResponse.data || userResponse;
        if (userData.profile) {
          setIgConnected(!!userData.profile.instagramConnected);
          setIgHandle(userData.profile.instagramHandle || '');
        }

        const linksResponse = await linksRes.json();
        const linksData = linksResponse.data || linksResponse;
        const linksArray = Array.isArray(linksData) ? linksData : [];
        setLinks(linksArray);
        
        if (location.state?.prefilledLink) {
          setSelectedLinkId(location.state.prefilledLink.id);
          setIsCreating(true);
          // Clear state so it doesn't reopen if the user refreshes
          window.history.replaceState({}, document.title);
        } else if (linksArray.length > 0) {
          setSelectedLinkId(linksArray[0].id);
        }

        const automationsResponse = await automationsRes.json();
        const automationsData = automationsResponse.data || automationsResponse;
        setAutomations(Array.isArray(automationsData) ? automationsData : []);

      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };

    fetchData();

    // Initialize Facebook SDK if not already loaded
    if (!window.FB && !document.getElementById('facebook-jssdk')) {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId      : import.meta.env.VITE_META_APP_ID,
          cookie     : true,
          xfbml      : true,
          version    : 'v19.0'
        });
        console.log('Facebook SDK initialized');
      };
      
      // Load the SDK asynchronously
      (function(d, s, id){
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement(s) as HTMLScriptElement; js.id = id;
         js.src = "https://connect.facebook.net/en_US/sdk.js";
         js.async = true;
         js.defer = true;
         fjs.parentNode?.insertBefore(js, fjs);
       }(document, 'script', 'facebook-jssdk'));
    }

  }, [navigate, location]);

  const handleToggle = async (id: string) => {
    const rule = automations.find(a => a.id === id);
    if (!rule) return;
    
    const newStatus = !rule.isActive;
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, isActive: newStatus } : a));

    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/api/automations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: newStatus })
    }).catch(console.error);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;
    setAutomations(prev => prev.filter(a => a.id !== id));
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/api/automations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(console.error);
  };

  const closeForm = () => {
    setIsCreating(false);
    setEditingRuleId(null);
    setKeyword('');
    setMessage('Hey! 👋 Here is the link you asked for:');
    setPostSelectionMode('any');
    setSelectedPostId(null);
    if (links.length > 0) setSelectedLinkId(links[0].id);
  };

  const handleEditClick = (rule: AutomationRule) => {
    setKeyword(rule.keyword);
    setMessage(rule.message);
    setSelectedLinkId(rule.linkId);
    setEditingRuleId(rule.id);
    if (rule.postId) {
      setPostSelectionMode('specific');
      setSelectedPostId(rule.postId);
    } else {
      setPostSelectionMode('any');
      setSelectedPostId(null);
    }
  };

  const handleSave = async () => {
    if (!keyword || !selectedLinkId) return;
    if (postSelectionMode === 'specific' && !selectedPostId) {
      alert("Please select a post or switch to 'Any Post'.");
      return;
    }
    const finalPostId = postSelectionMode === 'specific' ? selectedPostId : null;
    const token = localStorage.getItem('token');
    
    try {
      if (editingRuleId) {
        const res = await fetch(`${API_BASE}/api/automations/${editingRuleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ keyword, message, linkId: selectedLinkId, postId: finalPostId })
        });
        if (res.ok) {
          setAutomations(prev => prev.map(a => a.id === editingRuleId ? { ...a, keyword, message, linkId: selectedLinkId, postId: finalPostId } : a));
          closeForm();
        }
      } else {
        const res = await fetch(`${API_BASE}/api/automations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ keyword, message, linkId: selectedLinkId, postId: finalPostId, isActive: true })
        });
        if (res.ok) {
          const newRule = await res.json();
          setAutomations([newRule, ...automations]);
          closeForm();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestWebhook = async (rule: AutomationRule) => {
    if (!igHandle) {
      alert('Please connect your Instagram account first!');
      return;
    }
    setTestingRuleId(rule.id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/webhooks/instagram`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          instagramHandle: igHandle,
          followerHandle: 'test_follower',
          commentText: `I love this! Send me the ${rule.keyword} link!`,
          postId: rule.postId || null
        })
      });
      
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data.sentMessage) {
          // PERF: Optimistic update instead of re-fetching all automations
          setAutomations(prev => prev.map(a => 
            a.id === rule.id ? { ...a, dmsSent: (a.dmsSent || 0) + 1 } : a
          ));
          alert(`✅ Webhook fired!\n\nAuto-DM simulated with message:\n"${data.sentMessage}"`);
        } else {
          alert(`⚠️ Test response: ${data.message || data.error}`);
        }
      } catch (parseError) {
        console.error("Non-JSON Response:", text);
        alert(`⚠️ Server Error. Did you restart your backend server? Response:\n${text.substring(0, 100)}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network Error: Could not reach the server.\n\nPlease check if your backend server is running, or if an AdBlocker (like Brave Shields) is blocking the request because the URL contains "webhook".');
    } finally {
      setTestingRuleId(null);
    }
  };

  const selectedLinkPreview = links.find(l => l.id === selectedLinkId);

  const confirmConnectInstagram = async () => {
    setIsConnecting(true);
    
    // Wait for FB SDK to be fully loaded and initialized
    const waitForFB = () => {
      return new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        const checkFB = () => {
          attempts++;
          if (window.FB && typeof window.FB.login === 'function') {
            resolve();
          } else if (attempts >= maxAttempts) {
            reject(new Error('Facebook SDK failed to load'));
          } else {
            setTimeout(checkFB, 100);
          }
        };
        
        checkFB();
      });
    };
    
    try {
      await waitForFB();
    } catch (error) {
      alert("Facebook SDK is still loading. Please try again in a moment.");
      setIsConnecting(false);
      return;
    }

    window.FB.login(function(response: any) {
      if (response.authResponse) {
        console.log('Successfully authenticated via Facebook! Fetching pages...');
        const token = response.authResponse.accessToken;
        
        // Fetch pages user has access to
        window.FB.api('/me/accounts', 'GET', { access_token: token }, async function(pageResponse: any) {
             if (pageResponse && !pageResponse.error && pageResponse.data && pageResponse.data.length > 0) {
                 const page = pageResponse.data[0]; // Take first connected page for now
                 const pageToken = page.access_token;
                 
                 // Fetch the linked Instagram account
                 window.FB.api(`/${page.id}?fields=instagram_business_account`, 'GET', { access_token: pageToken }, async function(igResponse: any) {
                     if (igResponse.instagram_business_account) {
                         const igAccountId = igResponse.instagram_business_account.id;
                         
                         // Fetch username
                         window.FB.api(`/${igAccountId}?fields=username`, 'GET', { access_token: pageToken }, async function(igUserResponse: any) {
                            
                            // Send real data to our Mongoose backend to finalize connection
                            try {
                                const jwt = localStorage.getItem('token');
                                const res = await fetch(`${API_BASE}/api/instagram/connect`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
                                    body: JSON.stringify({
                                        ig_user_id: igAccountId,
                                        username: igUserResponse.username || 'connected_account',
                                        page_token: pageToken,
                                        account_type: 'business'
                                    })
                                });
                                
                                if (res.ok) {
                                    setIgConnected(true);
                                    setIgHandle(`@${igUserResponse.username || 'connected_account'}`);
                                    setShowConnectModal(false);
                                    alert('✅ Successfully connected real Instagram account!');
                                    
                                    // Refresh the page slightly to reflect new status completely
                                    window.location.reload();
                                } else {
                                    const errData = await res.json();
                                    alert('Failed to link in backend: ' + errData.error);
                                }
                            } catch (e: any) {
                                alert('Error communicating with backend: ' + e.message);
                            } finally {
                                setIsConnecting(false);
                            }
                         });
                     } else {
                         alert('No Instagram Business Account linked to this Facebook Page. Please link one on Facebook first.');
                         setIsConnecting(false);
                     }
                 });
             } else {
                 alert('No Facebook Pages found. You must create a page and link it to your Instagram.');
                 setIsConnecting(false);
             }
         });
      } else {
         console.log('User cancelled login or did not fully authorize.');
         setIsConnecting(false);
      }
    }, {
      scope: 'instagram_basic,instagram_manage_messages,pages_show_list,pages_read_engagement,pages_manage_metadata',
      return_scopes: true
    });
  };

  const handleDisconnectInstagram = async () => {
    const token = localStorage.getItem('token');
    try {
    await fetch(`${API_BASE}/api/user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profile: { instagramConnected: false, instagramHandle: '' } })
      });
      setIgConnected(false);
      setIgHandle('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto app-page">
      <PageHeader
        title="Auto DM"
        subtitle="Turn Instagram comments into clicks. Auto-reply via DM with your links."
        action={
          <button
            onClick={() => {
              setKeyword('');
              setMessage('Hey! 👋 Here is the link you asked for:');
              if (links.length > 0) setSelectedLinkId(links[0].id);
              setPostSelectionMode('any');
              setSelectedPostId(null);
              setIsCreating(true);
            }}
            className="flex items-center space-x-2 app-button-primary px-4 py-2.5 md:py-2 text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Automation</span>
          </button>
        }
      />

      {/* Instagram Connection Banner */}
      {!igConnected ? (
        <div className="app-card p-4 sm:p-6 border-l-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderLeftColor: 'var(--accent)' }}>

          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold app-heading">Connect your Instagram Account</h3>
              <p className="text-sm app-muted mt-1 max-w-md leading-relaxed font-medium">
                To automatically send DMs when followers comment, you need to connect your professional Instagram account to The Crumb.
              </p>
            </div>
          </div>
          <button 
            onClick={confirmConnectInstagram}
            disabled={isConnecting}
            className="px-4 py-2 sm:px-5 sm:py-2.5 app-button-accent text-sm shrink-0 flex items-center gap-2"
          >
            {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect Account'}
          </button>
        </div>
      ) : (
        <div className="app-card overflow-hidden">
          <div className="h-24 relative" style={{ background: 'var(--button-primary)' }}>
             <button 
              onClick={handleDisconnectInstagram}
              className="absolute top-4 right-4 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-lg text-xs font-bold text-white transition-colors"
            >
              Disconnect
            </button>
          </div>
          <div className="px-4 pb-4 sm:px-6 sm:pb-6 relative">
            <div className="flex justify-between items-end mb-4">
              <div className="w-20 h-20 rounded-full border-4 border-[var(--card-bg)] bg-white -mt-10 relative z-10 shadow-md overflow-hidden">
                 <img src={`https://ui-avatars.com/api/?name=${igHandle.replace('@', '')}&background=random&size=200`} alt="Instagram Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <p className="text-lg lg:text-base font-bold app-heading">13.5K</p>
                  <p className="text-[11px] font-medium app-muted uppercase tracking-wider">Followers</p>
                </div>
                <div>
                  <p className="text-lg lg:text-base font-bold app-heading">248</p>
                  <p className="text-[11px] font-medium app-muted uppercase tracking-wider">Posts</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl lg:text-lg font-bold app-heading flex items-center gap-2">
                {igHandle}
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </h3>
              <p className="text-sm app-body mt-1">Creator & Entrepreneur • Sharing links and resources.</p>
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
              <h4 className="text-sm font-bold app-heading mb-4 flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Recent Posts
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {MOCK_POSTS.map((post, i) => (
                  <div key={post.id} className="aspect-square bg-stone-100 rounded-lg overflow-hidden group relative cursor-pointer">
                    <img src={post.image} alt={`Post ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Rules List */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold app-heading mb-2">Active Rules</h2>
        
        {automations.length === 0 ? (
          <div className="app-card p-6 sm:p-10 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-base font-semibold app-heading">No automations yet</h3>
            <p className="text-sm app-muted mt-1 max-w-sm">Create your first rule to start automatically sending your links via DM.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {automations.map((rule) => {
              const linkedData = links.find(l => l.id === rule.linkId);
              return (
                <motion.div 
                  key={rule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`app-card p-4 sm:p-5 transition-all duration-200 ${!rule.isActive && 'opacity-60'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-stone-400" />
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide">Comment</span>
                    </div>
                    <button onClick={() => handleToggle(rule.id)} className="focus:outline-none">
                      {rule.isActive ? <ToggleRight className="w-8 h-8 text-[var(--button-primary)]" /> : <ToggleLeft className="w-8 h-8 text-[var(--muted-text)]" />}
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <p className={`text-lg font-bold app-heading ${!rule.keyword ? 'text-red-500 text-sm' : ''}`}>"{rule.keyword || '⚠️ Old Format - Please Delete'}"</p>
                    {rule.postId && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-stone-500 px-2 py-0.5 bg-stone-100 rounded tracking-wide uppercase">Specific Post</span>
                        <div className="w-8 h-8 rounded shrink-0 overflow-hidden bg-stone-100 relative shadow-sm border border-stone-200">
                           {MOCK_POSTS.find(p => p.id === rule.postId) ? (
                              <img src={MOCK_POSTS.find(p => p.id === rule.postId)?.image} alt="Target post" className="w-full h-full object-cover" />
                           ) : (
                              <Instagram className="w-4 h-4 text-stone-400 absolute inset-0 m-auto" />
                           )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 bg-stone-50 p-3 rounded-lg border border-stone-100 mb-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-stone-600 mb-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> Auto-DM Reply:
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2 italic">"{rule.message}"</p>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded">
                      <Link2 className="w-3 h-3" />
                      {linkedData ? linkedData.title : 'Attached Link'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <span className="text-xs font-medium app-muted">{(rule.dmsSent || 0).toLocaleString()} DMs sent</span>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleTestWebhook(rule)}
                        disabled={testingRuleId === rule.id || !rule.isActive || !rule.keyword}
                        className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={rule.isActive ? "Simulate a comment matching this keyword" : "Turn on to test"}
                      >
                        {testingRuleId === rule.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Smartphone className="w-3 h-3" />}
                        Test
                      </button>
                      <button onClick={() => handleEditClick(rule)} className="text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(rule.id)} className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {(isCreating || editingRuleId) && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-0">
          <div className="fixed inset-0 app-backdrop backdrop-blur-sm transition-opacity" onClick={closeForm}></div>
          <div className="relative app-modal w-full max-w-4xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-[600px]">
            
            {/* Form Section */}
            <div className="flex-1 p-4 sm:p-6 md:overflow-y-auto border-b md:border-b-0 md:border-r border-[var(--border-default)] shrink-0">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl lg:text-lg font-bold app-heading">{editingRuleId ? 'Edit Automation' : 'Create Automation'}</h2>
                  <p className="text-xs app-muted mt-1">Set up your comment trigger and DM response.</p>
                </div>
                <button onClick={closeForm} className="p-2 -mr-2 rounded-full app-icon-button transition-colors md:hidden">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold app-heading mb-1.5">1. Select Post / Reel</label>
                  <p className="text-xs app-muted mb-3">Choose which posts this automation applies to.</p>
                  
                  <div className="flex bg-stone-100 p-1 rounded-lg w-fit mb-4">
                    <button 
                      onClick={() => setPostSelectionMode('any')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${postSelectionMode === 'any' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                      Any Post
                    </button>
                    <button 
                      onClick={() => setPostSelectionMode('specific')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${postSelectionMode === 'specific' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                      Specific Post
                    </button>
                  </div>

                  {postSelectionMode === 'specific' && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-2 p-3 bg-stone-50 rounded-xl border border-stone-200 min-h-[120px] max-h-[220px] overflow-y-auto">
                      {MOCK_POSTS.map((post) => (
                        <div 
                          key={post.id} 
                          onClick={() => setSelectedPostId(post.id)}
                          className={`aspect-square bg-stone-200 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedPostId === post.id ? 'border-pink-500 shadow-md ring-2 ring-pink-500/20' : 'border-transparent hover:border-stone-300'}`}
                        >
                          <img src={post.image} alt={post.id} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold app-heading mb-1.5">2. Trigger Keyword</label>
                  <p className="text-xs app-muted mb-2">When a follower comments this exact word, the automation will trigger.</p>
                  <input
                    type="text"
                    placeholder="e.g. LINK or PRESETS"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value.toUpperCase())}
                    className="w-full p-2.5 md:p-2 text-sm app-input outline-none font-bold tracking-wide"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold app-heading mb-1.5">3. Select Link to Send</label>
                  <p className="text-xs app-muted mb-2">Which link from your Crumb page do you want to share?</p>
                  <CustomDropdown
                    value={selectedLinkId}
                    onChange={setSelectedLinkId}
                    options={[
                      { value: '', label: 'Select a link...', icon: Target },
                      ...links.map(link => ({ value: link.id, label: link.title, icon: Globe }))
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold app-heading mb-1.5">4. DM Message</label>
                  <p className="text-xs app-muted mb-2">The message attached to your link in the DM.</p>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full p-2.5 md:p-2 text-sm app-textarea outline-none resize-none"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border-default)] flex gap-3">
                <button onClick={closeForm} className="flex-1 app-button-secondary py-2.5 md:py-2 font-medium text-sm">Cancel</button>
                <button onClick={handleSave} disabled={!keyword || !selectedLinkId} className="flex-1 app-button-primary py-2.5 md:py-2 font-medium text-sm disabled:opacity-50">{editingRuleId ? 'Save Changes' : 'Save & Turn On'}</button>
              </div>
            </div>

            {/* Live Preview Section */}
            <div className="flex w-full md:w-[340px] bg-stone-50 flex-col items-center justify-center p-4 sm:p-6 relative shrink-0">
              <button onClick={closeForm} className="hidden md:block absolute top-4 right-4 p-2 rounded-full app-icon-button transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 mb-4 text-stone-400">
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px] font-semibold uppercase tracking-wide">DM Preview</span>
              </div>

              <div className="w-full bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-[400px]">
                <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-stone-800">Your Follower</span>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-end gap-2 bg-stone-50/50">
                  {/* The Message Bubble */}
                  <div className="bg-stone-200 text-stone-800 text-[13px] p-3 rounded-2xl rounded-br-sm max-w-[85%] self-end">
                    {message}
                  </div>
                  {/* The Link Preview Bubble */}
                  {selectedLinkPreview && (
                    <div className="bg-white border border-stone-200 p-3 rounded-xl max-w-[85%] self-end shadow-sm">
                      <p className="text-xs font-bold text-stone-800 mb-1">{selectedLinkPreview.title}</p>
                      <p className="text-[10px] text-blue-500 truncate">{selectedLinkPreview.url}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
