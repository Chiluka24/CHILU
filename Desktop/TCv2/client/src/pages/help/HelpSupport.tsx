import { useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LifeBuoy,
  Link2,
  Palette,
  BarChart3,
  Zap,
  Settings,
  Shield,
  Mail,
  Clock,
  FileText,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Sparkles,
  MessageCircle,
  BookOpen,
  HelpCircle,
} from 'lucide-react';

type QuickLink = {
  title: string;
  description: string;
  route?: string;
  icon: ComponentType<{ className?: string }>;
};

type FaqItem = {
  question: string;
  answer: string;
};

function buildMailto(to: string, subject: string, body: string) {
  const params = new URLSearchParams();
  params.set('subject', subject);
  params.set('body', body);
  return `mailto:${to}?${params.toString()}`;
}

export default function HelpSupport() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const quickLinks: QuickLink[] = [
    {
      title: 'Create and manage links',
      description: 'Add links, reorder them, and organize with collections.',
      route: '/links',
      icon: Link2,
    },
    {
      title: 'Customize your page',
      description: 'Change background, fonts, buttons, and layout.',
      route: '/links/appearance',
      icon: Palette,
    },
    {
      title: 'Understand analytics',
      description: 'See what is working and track clicks over time.',
      route: '/analytics',
      icon: BarChart3,
    },
    {
      title: 'Automation & Auto DM',
      description: 'Set up keyword triggers and replies.',
      route: '/automation',
      icon: Zap,
    },
    {
      title: 'Account & profile settings',
      description: 'Update your name, avatar, bio, and social links.',
      route: '/settings',
      icon: Settings,
    },
    {
      title: 'Security & login help',
      description: 'Troubleshoot login issues and keep your account safe.',
      route: '/settings',
      icon: Shield,
    },
  ];

  const faqs: FaqItem[] = [
    {
      question: 'My avatar/profile photo is not updating. What should I do?',
      answer:
        'Try refreshing once after saving. If you uploaded a new image, keep it under 5MB and use JPG/PNG. If it still does not update, log out and log back in to refresh your session.',
    },
    {
      question: 'How do I add a link button and change the order?',
      answer:
        'Open Links, add a new link, then drag to reorder. You can also group links using Collections to keep your page clean.',
    },
    {
      question: 'Where do I change my page design (background, fonts, buttons)?',
      answer:
        'Go to Appearance. You can adjust background style, spacing, fonts, and button shapes - your preview updates instantly.',
    },
    {
      question: 'Analytics looks empty. Is tracking enabled?',
      answer:
        'Analytics updates once your public page starts receiving visits. Make sure your links are active, then share your page and check back after a few clicks.',
    },
    {
      question: 'I cannot log in / I keep getting sent back to the login page.',
      answer:
        'This usually means your session token expired. Log out, then log back in. If it still happens, clear site data for The Crumb and try again.',
    },
  ];

  const supportEmail = 'team@thecrumb.co';
  const mailto = buildMailto(
    supportEmail,
    'Help request — The Crumb',
    `Hi The Crumb team,\n\nWhat I'm trying to do:\n\nWhat happened instead:\n\nSteps to reproduce (if any):\n\nDevice/Browser:\n\nThanks!`,
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 app-page px-4 md:px-6 lg:px-8 pb-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative pt-12 pb-8 text-center overflow-hidden"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(circle at 50% 0%, var(--accent-soft) 0%, transparent 70%)',
            }}
          />
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm border"
          style={{ 
            background: 'var(--accent-soft)', 
            color: 'var(--accent)',
            borderColor: 'var(--accent-medium)',
            boxShadow: '0 0 20px var(--accent-soft)'
          }}
        >
          <LifeBuoy className="w-4 h-4" />
          Help Center
        </motion.div>

        <h1
          className="mt-6 text-3xl sm:text-4xl font-black tracking-tight"
          style={{ 
            fontFamily: "'Inter', sans-serif",
            background: 'linear-gradient(135deg, var(--heading-color) 0%, var(--accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          How can we help you?
        </h1>

        <p className="mt-4 text-base sm:text-lg lg:text-base app-muted max-w-2xl mx-auto leading-relaxed">
          Find answers, explore guides, or reach out to our support team
        </p>
      </motion.div>

      {/* Quick Action Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <a
          href={mailto}
          className="group relative app-card p-6 hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg, var(--accent-soft) 0%, transparent 100%)' }}
          />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'var(--accent)', color: '#FFFFFF' }}
            >
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg lg:text-base font-bold app-heading mb-2">Email Support</h3>
            <p className="text-sm app-muted mb-4">Get personalized help from our team</p>
            <div className="flex items-center gap-2 text-sm font-semibold app-accent">
              Contact us <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </a>

        <button
          onClick={() => {
            const faqSection = document.getElementById('faq-section');
            faqSection?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="group relative app-card p-6 hover:shadow-xl transition-all duration-300 overflow-hidden text-left"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg, var(--accent-soft) 0%, transparent 100%)' }}
          />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg lg:text-base font-bold app-heading mb-2">FAQs</h3>
            <p className="text-sm app-muted mb-4">Quick answers to common questions</p>
            <div className="flex items-center gap-2 text-sm font-semibold app-accent">
              Browse FAQs <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="group relative app-card p-6 hover:shadow-xl transition-all duration-300 overflow-hidden text-left"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg, var(--accent-soft) 0%, transparent 100%)' }}
          />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg lg:text-base font-bold app-heading mb-2">Documentation</h3>
            <p className="text-sm app-muted mb-4">Explore features and settings</p>
            <div className="flex items-center gap-2 text-sm font-semibold app-accent">
              View docs <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>
      </motion.div>

      {/* Quick Links Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="app-card p-6 sm:p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl lg:text-lg font-bold app-heading">Quick Access</h2>
            <p className="text-sm app-muted">Jump directly to what you need</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                type="button"
                onClick={() => item.route && navigate(item.route)}
                className="group app-subcard p-5 text-left hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, var(--accent-soft) 0%, transparent 100%)' }}
                />
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold app-heading mb-1 flex items-center justify-between">
                      {item.title}
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="text-xs app-muted leading-relaxed">{item.description}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Contact Support Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative app-card overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--accent) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Get in Touch
              </div>
              <h2 className="text-xl lg:text-lg font-bold app-heading mb-4">
                Need Direct Assistance?
              </h2>
              <p className="text-sm sm:text-base app-muted leading-relaxed mb-6">
                Our support team is here to help with link setup, appearance customization, 
                analytics questions, automation issues, and account settings.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold app-heading">24-hour response time</div>
                    <div className="text-xs app-muted">We reply within one business day</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold app-heading">Secure & Private</div>
                    <div className="text-xs app-muted">Your data is always protected</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold app-heading">Detailed Solutions</div>
                    <div className="text-xs app-muted">Clear steps to resolve your issue</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <div className="app-subcard p-6 space-y-4">
                <div className="text-center">
                  <div className="text-xs font-semibold app-muted uppercase tracking-wider mb-2">
                    Email us at
                  </div>
                  <div
                    className="px-4 py-3 rounded-xl text-center font-bold tracking-tight text-lg lg:text-base"
                    style={{
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {supportEmail}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: 'var(--border-default)' }} />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 app-muted" style={{ background: 'var(--card-bg)' }}>or</span>
                  </div>
                </div>

                <a
                  href={mailto}
                  className="w-full px-6 py-4 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group app-button-accent"
                >
                  <Mail className="w-5 h-5" />
                  Send Email Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        id="faq-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="app-card overflow-hidden"
      >
        <div className="p-6 sm:p-8 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl lg:text-lg font-bold app-heading">Frequently Asked Questions</h2>
                <p className="text-sm app-muted">Quick answers to common issues</p>
              </div>
            </div>
            <a
              href={mailto}
              className="text-sm font-semibold hover:opacity-80 transition-opacity inline-flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              Still need help? <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="app-subcard overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-5 py-4 flex items-start justify-between text-left gap-4 group"
                  >
                    <span className="text-sm font-bold app-heading flex-1">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-all duration-300 app-accent ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-5 pb-5 pt-0">
                          <div className="pt-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
                            <p className="text-sm app-muted leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="relative app-card overflow-hidden"
      >
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--accent-soft) 0%, transparent 100%)',
            opacity: 0.5,
          }}
        />
        <div className="relative z-10 p-6 sm:p-8 text-center">
          <LifeBuoy className="w-12 h-12 mx-auto mb-4 app-accent" />
          <h3 className="text-xl lg:text-lg font-bold app-heading mb-2">Still Stuck?</h3>
          <p className="text-sm app-muted max-w-xl mx-auto mb-6">
            Can't find what you're looking for? Our support team is ready to help you resolve any issue.
          </p>
          <a
            href={mailto}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all app-button-accent"
          >
            <Mail className="w-4 h-4" />
            Contact Support Team
          </a>
        </div>
      </motion.div>
    </div>
  );
}
