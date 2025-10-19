import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSelector from "@/components/LanguageSelector";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { Shield, Brain, Lock, Zap, Focus, BookOpen, Award, Smartphone, ArrowRight, Play, ShieldCheck, Filter, Timer, Database, Sparkles, RefreshCw, BarChart3, GraduationCap, Briefcase, Users, Baby, BellOff, Eye, Clock, Target, WifiOff, Globe, Cpu } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import studyShieldLogo from "@/assets/studyshield-logo.png";
import studyImage from "@/assets/study.jpg";
import featureImage from "@/assets/feature.jpg";
import classImage from "@/assets/class.jpg";
import aboutImage from "@/assets/about.jpg";
import geminiNano from "@/assets/gemini-nano.png";
import geminiFlash from "@/assets/Gemini-flash.png";
import TypewriterText from "@/components/TypewriterText";
import NumberCounter from "@/components/NumberCounter";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import PWAInstallPopup from "@/components/PWAInstallPopup";
import "@/styles/cards-3d.css";
import "@/styles/pwa-popup.css";

// Custom hook for chart animations
const useChartAnimation = (inView: boolean) => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    if (inView) {
      setTimeout(() => setAnimate(true), 100);
    }
  }, [inView]);
  
  return animate;
};

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const { canUseAnalytics, enableAnalytics } = useCookieConsent();
  
  // Redirect authenticated users to chat
  useEffect(() => {
    if (user) {
      navigate('/chat', { replace: true });
    }
  }, [user, navigate]);
  
  // Show nothing while checking auth or if user exists
  if (loading || user) {
    return null;
  }
  
  // Enable analytics if cookies are accepted
  useEffect(() => {
    if (canUseAnalytics()) {
      enableAnalytics();
      // Here you would initialize your analytics service
      console.log('Analytics enabled for StudyShield');
    }
  }, [canUseAnalytics, enableAnalytics]);
  
  // Section refs
  const refs = {
    hero: useRef(null),
    features: useRef(null),
    core: useRef(null),
    audience: useRef(null),
    about: useRef(null),
    chart1: useRef(null),
    chart2: useRef(null),
    chart3: useRef(null)
  };
  
  // InView hooks
  const inView = {
    hero: useInView(refs.hero, { once: true, margin: "-100px" }),
    features: useInView(refs.features, { once: true, margin: "-100px" }),
    core: useInView(refs.core, { once: true, margin: "-100px" }),
    audience: useInView(refs.audience, { once: true, margin: "-100px" }),
    about: useInView(refs.about, { once: true, margin: "-100px" }),
    chart1: useInView(refs.chart1, { once: true, margin: "-50px" }),
    chart2: useInView(refs.chart2, { once: true, margin: "-50px" }),
    chart3: useInView(refs.chart3, { once: true, margin: "-50px" })
  };
  
  // Chart animations
  const chartAnimations = {
    chart1: useChartAnimation(inView.chart1),
    chart2: useChartAnimation(inView.chart2),
    chart3: useChartAnimation(inView.chart3)
  };
  
  // Chart data
  const chartData = {
    chart1: [{v:20},{v:35},{v:50},{v:65},{v:73}],
    chart2: [{v:15},{v:25},{v:32},{v:40},{v:45}],
    chart3: [{v:1.2},{v:1.6},{v:2.0},{v:2.3},{v:2.5}]
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
      <PWAInstallPopup />
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full py-4 px-4 md:py-6 md:px-12 backdrop-blur-sm bg-white/80 fixed top-0 left-0 right-0 z-[9999] border-b border-gray-100"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <img src={studyShieldLogo} alt="StudyShield Logo" className="h-8 md:h-12" />
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <LanguageSelector variant="desktop" />
            <Button 
              onClick={() => navigate('/auth')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              {t('get.started')}
            </Button>
          </nav>
          <div className="md:hidden flex items-center gap-3">
            <LanguageSelector variant="mobile" />
            <Button 
              onClick={() => navigate('/auth')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-2"
            >
              {t('get.started')}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="px-4 md:px-12 py-12 md:py-20 pt-32 md:pt-40">
        <motion.div 
          ref={refs.hero}
          variants={containerVariants}
          initial="hidden"
          animate={inView.hero ? "visible" : "hidden"}
          className="max-w-7xl mx-auto"
        >
          
          {/* Main Hero */}
          <div className="text-center mb-16 md:mb-32">
            <motion.h1 
              variants={itemVariants}
              className="text-5xl sm:text-4xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 md:mb-8 leading-tight px-2 pb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              {t('learn.smarter')}
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 md:mb-12 leading-relaxed px-4"
            >
              {t('hero.description')}
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex justify-center items-center mb-12 md:mb-20 px-4"
            >
              <Button 
                onClick={() => navigate('/auth')}
                className="group relative text-white px-6 sm:px-12 md:px-20 py-3 sm:py-5 md:py-6 text-base sm:text-xl md:text-2xl font-bold rounded-full transition-all duration-500 hover:scale-110 hover:shadow-2xl shadow-lg border-2 border-white/20 backdrop-blur-sm"
                style={{ 
                  background: 'linear-gradient(-45deg, #1e3a8a, #1e40af, #2563eb, #4f46e5, #6366f1, #2563eb, #1e3a8a)',
                  backgroundSize: '400% 400%',
                  animation: 'gradient 5s ease-in-out infinite'
                }}
              >
                <span className="relative z-10">{t('start.studying.safely')}</span>
                <ArrowRight className="ml-2 w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:translate-x-2 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </motion.div>


          </div>

        </motion.div>
      </main>

      {/* Google Powered Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        className="py-16 md:py-24 px-4 md:px-8 bg-white"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Powered by Google AI
            </motion.h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('google.ai.description')}
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-6 max-w-sm mx-auto"
              style={{
                border: '6px solid #000',
                borderRadius: '16px',
                boxShadow: '8px 8px 0px #000'
              }}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="w-6 h-6 text-black" />
                  <h3 className="text-2xl font-bold text-black">{t('gemini.nano')}</h3>
                </div>
                <p className="text-lg font-semibold text-black mb-4">{t('on.device.intelligence')}</p>
                <p className="text-sm text-black/80 mb-6">{t('nano.description')}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-black" />
                    <span className="text-black font-medium">{t('instant.detection')}</span>
                  </div>
                  <p className="text-xs text-black/70 ml-8">{t('harmful.content.blocked')}</p>
                  
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-black" />
                    <span className="text-black font-medium">{t('privacy.first')}</span>
                  </div>
                  <p className="text-xs text-black/70 ml-8">{t('offline.processing')}</p>
                  
                  <div className="flex items-center gap-3">
                    <Timer className="w-5 h-5 text-black" />
                    <span className="text-black font-medium">{t('zero.latency')}</span>
                  </div>
                  <p className="text-xs text-black/70 ml-8">{t('lightning.fast')}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-6 max-w-sm mx-auto"
              style={{
                border: '6px solid #000',
                borderRadius: '16px',
                boxShadow: '8px 8px 0px #000'
              }}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-6 h-6 text-black" />
                  <h3 className="text-2xl font-bold text-black">{t('gemini.flash')}</h3>
                </div>
                <p className="text-lg font-semibold text-black mb-4">{t('advanced.study.assistant')}</p>
                <p className="text-sm text-black/80 mb-6">{t('flash.description')}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-black" />
                    <span className="text-black font-medium">{t('smart.summaries')}</span>
                  </div>
                  <p className="text-xs text-black/70 ml-8">{t('auto.generated.materials')}</p>
                  
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-black" />
                    <span className="text-black font-medium">{t('instant.learning')}</span>
                  </div>
                  <p className="text-xs text-black/70 ml-8">{t('personalized.flashcards')}</p>
                  
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-black" />
                    <span className="text-black font-medium">{t('adaptive.ai')}</span>
                  </div>
                  <p className="text-xs text-black/70 ml-8">{t('interactive.qa')}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Powered by Google AI Technology</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Why StudyShield - Full Width */}
      <motion.section 
        ref={refs.features}
        initial={{ opacity: 0, y: 50 }}
        animate={inView.features ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-0 relative w-full min-h-screen"
        id="features"
      >
        {/* Background Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={inView.features ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{ backgroundImage: `url(${studyImage})`, backgroundPosition: 'center 90%' }}
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={inView.features ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute inset-0 bg-black/40" 
        />
        
        {/* Content */}
        <div className="relative z-10 py-16 md:py-24">
          <motion.h2 
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-12 md:mb-20 px-4"
          >
            {t('why.studyshield')}
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={inView.features ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex justify-start px-4 md:px-8 mt-16 md:mt-24"
          >
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate={inView.features ? "visible" : "hidden"}
              className="flex flex-col gap-3 max-w-md"
            >
              <motion.div variants={cardVariants} className="backdrop-blur-sm bg-white/5 rounded-lg p-3 hover:bg-white/8 transition-all duration-300">
                <div className="flex items-center gap-2 mb-1">
                  <BellOff className="w-4 h-4 text-white" />
                  <h3 className="font-medium text-sm text-white">{t('distraction.blocker')}</h3>
                </div>
                <p className="text-white/70 text-xs leading-relaxed">{t('distraction.blocker.description')}</p>
              </motion.div>
              
              <motion.div variants={cardVariants} className="backdrop-blur-sm bg-white/5 rounded-lg p-3 hover:bg-white/8 transition-all duration-300">
                <div className="flex items-center gap-2 mb-1">
                  <Filter className="w-4 h-4 text-white" />
                  <h3 className="font-medium text-sm text-white">{t('safe.content.filtering')}</h3>
                </div>
                <p className="text-white/70 text-xs leading-relaxed">{t('safe.content.filtering.description')}</p>
              </motion.div>
              
              <motion.div variants={cardVariants} className="backdrop-blur-sm bg-white/5 rounded-lg p-3 hover:bg-white/8 transition-all duration-300">
                <div className="flex items-center gap-2 mb-1">
                  <Focus className="w-4 h-4 text-white" />
                  <h3 className="font-medium text-sm text-white">{t('focus.mode')}</h3>
                </div>
                <p className="text-white/70 text-xs leading-relaxed">{t('focus.mode.description')}</p>
              </motion.div>
              
              <motion.div variants={cardVariants} className="backdrop-blur-sm bg-white/5 rounded-lg p-3 hover:bg-white/8 transition-all duration-300">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-white" />
                  <h3 className="font-medium text-sm text-white">{t('knowledge.shield')}</h3>
                </div>
                <p className="text-white/70 text-xs leading-relaxed">{t('knowledge.shield.description')}</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Study Challenges & Solutions */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">{t('modern.study.challenge')}</h2>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative bg-white rounded-2xl p-8 shadow-xl overflow-hidden"
              style={{ border: '2px solid rgba(220, 38, 38, 0.1)' }}
            >
              <div className="flex flex-col items-center text-center relative z-10">
                <div ref={refs.chart1} className="relative w-full h-40 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={chartData.chart1} 
                      margin={{ top: 12, right: 12, left: 12, bottom: 12 }}
                      maxBarSize={40}
                    >
                      <defs>
                        <linearGradient id="gradient73" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#dc2626" stopOpacity={1}/>
                          <stop offset="50%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#f87171" stopOpacity={0.6}/>
                        </linearGradient>
                        <filter id="shadow73">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#dc2626" floodOpacity="0.3"/>
                        </filter>
                      </defs>
                      <Bar dataKey="v" fill="url(#gradient73)" radius={[8, 8, 0, 0]} animationDuration={1500} isAnimationActive={chartAnimations.chart1} animationBegin={0} filter="url(#shadow73)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="font-black text-gray-900 mb-2 text-2xl"><NumberCounter end={73} suffix="%" duration={2500} /></h3>
                  <h4 className="font-bold text-gray-800 mb-3 text-lg">{t('distracted.students')}</h4>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{t('distracted.students.stat')}</p>
                  <a href="https://www.pewresearch.org/internet/2022/08/10/teens-social-media-and-technology-2022/" target="_blank" rel="noopener noreferrer" className="text-xs text-red-600 hover:text-red-700 font-medium underline">
                    {t('source.pew.research')}
                  </a>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative bg-white rounded-2xl p-8 shadow-xl overflow-hidden"
              style={{ border: '2px solid rgba(234, 88, 12, 0.1)' }}
            >
              <div className="flex flex-col items-center text-center relative z-10">
                <div ref={refs.chart2} className="relative w-full h-40 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={chartData.chart2} 
                      margin={{ top: 12, right: 12, left: 12, bottom: 12 }}
                      maxBarSize={40}
                    >
                      <defs>
                        <linearGradient id="gradient45" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ea580c" stopOpacity={1}/>
                          <stop offset="50%" stopColor="#f97316" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#fb923c" stopOpacity={0.6}/>
                        </linearGradient>
                        <filter id="shadow45">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ea580c" floodOpacity="0.3"/>
                        </filter>
                      </defs>
                      <Bar dataKey="v" fill="url(#gradient45)" radius={[8, 8, 0, 0]} animationDuration={1500} isAnimationActive={chartAnimations.chart2} animationBegin={0} filter="url(#shadow45)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="font-black text-gray-900 mb-2 text-2xl"><NumberCounter end={45} suffix="%" duration={2500} /></h3>
                  <h4 className="font-bold text-gray-800 mb-3 text-lg">{t('information.overload')}</h4>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{t('information.overload.stat')}</p>
                  <a href="https://www.apa.org/science/about/psa/2017/10/information-overload" target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 hover:text-orange-700 font-medium underline">
                    {t('source.apa')}
                  </a>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative bg-white rounded-2xl p-8 shadow-xl overflow-hidden"
              style={{ border: '2px solid rgba(37, 99, 235, 0.1)' }}
            >
              <div className="flex flex-col items-center text-center relative z-10">
                <div ref={refs.chart3} className="relative w-full h-40 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={chartData.chart3} 
                      margin={{ top: 12, right: 12, left: 12, bottom: 12 }}
                      maxBarSize={40}
                    >
                      <defs>
                        <linearGradient id="gradient25" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity={1}/>
                          <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.6}/>
                        </linearGradient>
                        <filter id="shadow25">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.3"/>
                        </filter>
                      </defs>
                      <Bar dataKey="v" fill="url(#gradient25)" radius={[8, 8, 0, 0]} animationDuration={1500} isAnimationActive={chartAnimations.chart3} animationBegin={0} filter="url(#shadow25)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="font-black text-gray-900 mb-2 text-2xl"><NumberCounter end={2.5} suffix="x" decimals={1} duration={2500} /></h3>
                  <h4 className="font-bold text-gray-800 mb-3 text-lg">{t('longer.study.time')}</h4>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{t('longer.study.time.stat')}</p>
                  <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4927578/" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 font-medium underline">
                    {t('source.ncbi')}
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          <div className="mt-16">
            <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">{t('studyshield.changes.everything')}</h3>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, staggerChildren: 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="grid md:grid-cols-2 gap-8"
            >
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 max-w-lg"
                style={{
                  border: '6px solid #000',
                  borderRadius: '16px',
                  boxShadow: '8px 8px 0px #000'
                }}
              >
                <div className="text-left space-y-4">
                  <div>
                    <div className="flex items-start gap-2 mb-1">
                      <Focus className="w-6 h-6 text-gray-700 mt-1" />
                      <div>
                        <h4 className="text-xl font-bold text-gray-900"><NumberCounter end={3} suffix="x" duration={2000} /> {t('better.focus')}</h4>
                        <p className="text-sm text-gray-600">{t('better.focus.stat')}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start gap-2 mb-1">
                      <Shield className="w-6 h-6 text-gray-700 mt-1" />
                      <div>
                        <h4 className="text-xl font-bold text-gray-900"><NumberCounter end={95} suffix="%" duration={2000} /> {t('safe.content')}</h4>
                        <p className="text-sm text-gray-600">{t('safe.content.stat')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 max-w-lg"
                style={{
                  border: '6px solid #000',
                  borderRadius: '16px',
                  boxShadow: '8px 8px 0px #000'
                }}
              >
                <div className="text-left space-y-4">
                  <div>
                    <div className="flex items-start gap-2 mb-1">
                      <Clock className="w-6 h-6 text-gray-700 mt-1" />
                      <div>
                        <h4 className="text-xl font-bold text-gray-900"><NumberCounter end={50} suffix="%" duration={2000} /> {t('less.study.time')}</h4>
                        <p className="text-sm text-gray-600">{t('less.study.time.stat')}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start gap-2 mb-1">
                      <Target className="w-6 h-6 text-gray-700 mt-1" />
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{t('zero.misinformation')}</h4>
                        <p className="text-sm text-gray-600">{t('zero.misinformation.stat')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <motion.section 
        ref={refs.core}
        initial={{ opacity: 0, y: 50 }}
        animate={inView.core ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-0 relative w-full min-h-screen"
      >
            {/* Background Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={inView.core ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 bg-cover bg-no-repeat"
              style={{ backgroundImage: `url(${featureImage})`, backgroundPosition: 'center 60%' }}
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={inView.core ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute inset-0 bg-black/40" 
            />
            
            {/* Content */}
            <div className="relative z-10 py-16 md:py-24">
              <motion.h2 
                variants={itemVariants}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-12 md:mb-20 px-4"
              >
                {t('core.features')}
              </motion.h2>
              
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={inView.core ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex justify-start px-4 md:px-8 mt-16 md:mt-24"
              >
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate={inView.core ? "visible" : "hidden"}
                  className="flex flex-col gap-3 max-w-md"
                >
                <motion.div variants={cardVariants} className="backdrop-blur-sm bg-white/5 rounded-lg p-3 hover:bg-white/8 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-white" />
                    <h3 className="font-medium text-sm text-white">{t('ai.powered.study.assistant')}</h3>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">{t('ai.powered.study.assistant.description')}</p>
                </motion.div>
              
                <motion.div variants={cardVariants} className="backdrop-blur-sm bg-white/5 rounded-lg p-3 hover:bg-white/8 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-4 h-4 text-white" />
                    <h3 className="font-medium text-sm text-white">{t('secure.notes')}</h3>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">{t('secure.notes.description')}</p>
                </motion.div>
              
                <motion.div variants={cardVariants} className="backdrop-blur-sm bg-white/5 rounded-lg p-3 hover:bg-white/8 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-white" />
                    <h3 className="font-medium text-sm text-white">{t('gamified.learning')}</h3>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">{t('gamified.learning.description')}</p>
                </motion.div>
              
                <motion.div variants={cardVariants} className="backdrop-blur-sm bg-white/5 rounded-lg p-3 hover:bg-white/8 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <RefreshCw className="w-4 h-4 text-white" />
                    <h3 className="font-medium text-sm text-white">{t('cross.platform.sync')}</h3>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">{t('cross.platform.sync.description')}</p>
                </motion.div>
                </motion.div>
              </motion.div>
            </div>
      </motion.section>

      {/* Advanced Features & Benefits */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        className="py-16 md:py-24 px-4 md:px-8 bg-gray-50"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
          >
            {t('advanced.study.technology')}
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.15 }}
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 gap-8 mb-16"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl p-8 text-center group cursor-pointer"
              style={{
                background: '#ffffff',
                border: '4px solid #000',
                boxShadow: '6px 6px 0px #000'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <NumberCounter 
                end={10} 
                suffix="x" 
                className="text-7xl font-black text-gray-800 mb-4 relative z-10" 
                duration={2500}
              />
              <h3 className="font-bold text-gray-800 mb-3 text-xl relative z-10">{t('faster.learning')}</h3>
              <p className="text-gray-600 text-sm relative z-10">{t('faster.learning.stat')}</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              whileHover={{ scale: 1.05, rotateY: -5 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl p-8 text-center group cursor-pointer"
              style={{
                background: '#ffffff',
                border: '4px solid #000',
                boxShadow: '6px 6px 0px #000'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <NumberCounter 
                end={24} 
                suffix="/7" 
                className="text-7xl font-black text-gray-800 mb-4 relative z-10" 
                duration={2000}
              />
              <h3 className="font-bold text-gray-800 mb-3 text-xl relative z-10">{t('always.available')}</h3>
              <p className="text-gray-600 text-sm relative z-10">{t('always.available.stat')}</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl p-8 text-center group cursor-pointer"
              style={{
                background: '#ffffff',
                border: '4px solid #000',
                boxShadow: '6px 6px 0px #000'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <NumberCounter 
                end={100} 
                suffix="%" 
                className="text-7xl font-black text-gray-800 mb-4 relative z-10" 
                duration={2500}
              />
              <h3 className="font-bold text-gray-800 mb-3 text-xl relative z-10">{t('secure.storage')}</h3>
              <p className="text-gray-600 text-sm relative z-10">{t('secure.storage.stat')}</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              whileHover={{ scale: 1.05, rotateY: -5 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl p-8 text-center group cursor-pointer"
              style={{
                background: '#ffffff',
                border: '4px solid #000',
                boxShadow: '6px 6px 0px #000'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <NumberCounter 
                end={85} 
                suffix="%" 
                className="text-7xl font-black text-gray-800 mb-4 relative z-10" 
                duration={2500}
              />
              <h3 className="font-bold text-gray-800 mb-3 text-xl relative z-10">{t('higher.motivation')}</h3>
              <p className="text-gray-600 text-sm relative z-10">{t('higher.motivation.stat')}</p>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-50px" }}
            className="mt-16"
          >
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12"
            >
              {t('why.students.choose')}
            </motion.h3>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, staggerChildren: 0.1 }}
              viewport={{ once: true, margin: "-30px" }}
              className="flex justify-center"
            >
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 max-w-sm shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-6 h-6 text-gray-700" />
                    <h4 className="text-xl font-bold text-gray-900">{t('smart.study.assistant')}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{t('smart.study.assistant.description')}</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 max-w-sm shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-6 h-6 text-gray-700" />
                    <h4 className="text-xl font-bold text-gray-900">{t('bank.level.security')}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{t('bank.level.security.description')}</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 max-w-sm shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-6 h-6 text-gray-700" />
                    <h4 className="text-xl font-bold text-gray-900">{t('achievement.system')}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{t('achievement.system.description')}</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 max-w-sm shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Smartphone className="w-6 h-6 text-gray-700" />
                    <h4 className="text-xl font-bold text-gray-900">{t('universal.access')}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{t('universal.access.description')}</p>
                </div>
              </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Who Is It For */}
      <motion.section 
        ref={refs.audience}
        initial={{ opacity: 0 }}
        animate={inView.audience ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-0 relative w-full min-h-screen"
        id="about"
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat opacity-100"
          style={{ 
            backgroundImage: `url(${classImage})`, 
            backgroundPosition: 'center 60%',
            willChange: 'auto',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Content */}
        <div className="relative z-10 py-16 md:py-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={inView.audience ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-12 md:mb-20 px-4"
          >
            {t('who.is.it.for')}
          </motion.h2>
          
          <div className="flex justify-start px-4 md:px-8 mt-16 md:mt-24">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={inView.audience ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col gap-3 max-w-md"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={inView.audience ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="backdrop-blur-sm bg-white/5 rounded-lg p-3 hover:bg-white/8 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-white" />
                  <h3 className="font-medium text-sm text-white">{t('students')}</h3>
                </div>
                <p className="text-white/70 text-xs leading-relaxed">{t('students.description')}</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={inView.audience ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="backdrop-blur-sm bg-white/5 rounded-lg p-3 hover:bg-white/8 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-4 h-4 text-white" />
                  <h3 className="font-medium text-sm text-white">{t('professionals')}</h3>
                </div>
                <p className="text-white/70 text-xs leading-relaxed">{t('professionals.description')}</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={inView.audience ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="backdrop-blur-sm bg-white/5 rounded-lg p-3 hover:bg-white/8 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-white" />
                  <h3 className="font-medium text-sm text-white">{t('educators')}</h3>
                </div>
                <p className="text-white/70 text-xs leading-relaxed">{t('educators.description')}</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={inView.audience ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="backdrop-blur-sm bg-white/5 rounded-lg p-3 hover:bg-white/8 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Baby className="w-4 h-4 text-white" />
                  <h3 className="font-medium text-sm text-white">{t('parents')}</h3>
                </div>
                <p className="text-white/70 text-xs leading-relaxed">{t('parents.description')}</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* User Success Stories */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        className="py-16 md:py-24 px-4 md:px-8 bg-gray-50"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
          >
            {t('real.results')}
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 gap-8 mb-16"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl p-8 text-center group cursor-pointer"
              style={{
                background: '#ffffff',
                border: '4px solid #000',
                boxShadow: '6px 6px 0px #000'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <NumberCounter 
                end={92} 
                suffix="%" 
                className="text-7xl font-black text-gray-800 mb-4 relative z-10" 
                duration={2500}
              />
              <h3 className="font-bold text-gray-800 mb-3 text-xl relative z-10">{t('grade.improvement')}</h3>
              <p className="text-gray-600 text-sm relative z-10">{t('grade.improvement.stat')}</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              whileHover={{ scale: 1.05, rotateY: -5 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl p-8 text-center group cursor-pointer"
              style={{
                background: '#ffffff',
                border: '4px solid #000',
                boxShadow: '6px 6px 0px #000'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <NumberCounter 
                end={78} 
                suffix="%" 
                className="text-7xl font-black text-gray-800 mb-4 relative z-10" 
                duration={2500}
              />
              <h3 className="font-bold text-gray-800 mb-3 text-xl relative z-10">{t('career.advancement')}</h3>
              <p className="text-gray-600 text-sm relative z-10">{t('career.advancement.stat')}</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl p-8 text-center group cursor-pointer"
              style={{
                background: '#ffffff',
                border: '4px solid #000',
                boxShadow: '6px 6px 0px #000'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <NumberCounter 
                end={96} 
                suffix="%" 
                className="text-7xl font-black text-gray-800 mb-4 relative z-10" 
                duration={2500}
              />
              <h3 className="font-bold text-gray-800 mb-3 text-xl relative z-10">{t('teacher.satisfaction')}</h3>
              <p className="text-gray-600 text-sm relative z-10">{t('teacher.satisfaction.stat')}</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              whileHover={{ scale: 1.05, rotateY: -5 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl p-8 text-center group cursor-pointer"
              style={{
                background: '#ffffff',
                border: '4px solid #000',
                boxShadow: '6px 6px 0px #000'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <NumberCounter 
                end={89} 
                suffix="%" 
                className="text-7xl font-black text-gray-800 mb-4 relative z-10" 
                duration={2500}
              />
              <h3 className="font-bold text-gray-800 mb-3 text-xl relative z-10">{t('parent.peace.of.mind')}</h3>
              <p className="text-gray-600 text-sm relative z-10">{t('parent.peace.of.mind.stat')}</p>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-50px" }}
            className="mt-16"
          >
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8"
            >
              {t('tailored.solutions')}
            </motion.h3>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, staggerChildren: 0.1 }}
              viewport={{ once: true, margin: "-30px" }}
              className="flex justify-center"
            >
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 max-w-sm shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-6 h-6 text-gray-700" />
                    <h4 className="text-xl font-bold text-gray-900">{t('student.success.tools')}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{t('student.success.tools.description')}</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 max-w-sm shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-6 h-6 text-gray-700" />
                    <h4 className="text-xl font-bold text-gray-900">{t('professional.development')}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{t('professional.development.description')}</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 max-w-sm shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-6 h-6 text-gray-700" />
                    <h4 className="text-xl font-bold text-gray-900">{t('classroom.management')}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{t('classroom.management.description')}</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 max-w-sm shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Baby className="w-6 h-6 text-gray-700" />
                    <h4 className="text-xl font-bold text-gray-900">{t('parental.controls')}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{t('parental.controls.description')}</p>
                </div>
              </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* About StudyShield */}
      <motion.section 
        ref={refs.about}
        initial={{ opacity: 0 }}
        animate={inView.about ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-0 relative w-full min-h-screen"
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat opacity-100"
          style={{ 
            backgroundImage: `url(${aboutImage})`, 
            backgroundPosition: 'center',
            willChange: 'auto',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={inView.about ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute inset-0 bg-black/40" 
        />
        
        {/* Content */}
        <div className="relative z-10 py-16 md:py-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={inView.about ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-12 md:mb-20 px-4"
          >
            {t('about.studyshield')}
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={inView.about ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center px-4 md:px-8"
          >
            <div className="max-w-4xl text-center">
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                {t('about.description')}
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-12">
                {t('your.focus.protected')}
              </p>
              
              <div>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 sm:px-12 md:px-16 py-3 sm:py-4 md:py-6 text-base sm:text-lg md:text-xl font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  {t('start.studying.safely')}
                  <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="py-12 md:py-16 px-4 md:px-12 border-t border-gray-200 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
            <div className="col-span-2 md:col-span-1">
              <img src={studyShieldLogo} alt="StudyShield Logo" className="h-8 sm:h-10 md:h-12 mb-3 md:mb-4" />
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                {t('ultimate.shield')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">{t('product')}</h4>
              <ul className="space-y-1 md:space-y-2 text-gray-600 text-sm md:text-base">
                <li><a href="#features" className="hover:text-blue-600 transition-colors">{t('features')}</a></li>
                <li>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button type="button" className="hover:text-blue-600 transition-colors">{t('pricing')}</button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('pricing')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('pricing.free')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction>{t('okay')}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">{t('security')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">{t('company')}</h4>
              <ul className="space-y-1 md:space-y-2 text-gray-600 text-sm md:text-base">
                <li><a href="#about" className="hover:text-blue-600 transition-colors">{t('about')}</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">{t('blog')}</a></li>
                <li><a href="#" onClick={() => navigate('/contact')} className="hover:text-blue-600 transition-colors cursor-pointer">{t('contact')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">{t('support')}</h4>
              <ul className="space-y-1 md:space-y-2 text-gray-600 text-sm md:text-base">
                <li><a href="#" onClick={() => navigate('/help')} className="hover:text-blue-600 transition-colors cursor-pointer">{t('help.center')}</a></li>
                <li><a href="#" onClick={() => navigate('/privacy')} className="hover:text-blue-600 transition-colors cursor-pointer">{t('privacy.policy')}</a></li>
                <li><a href="#" onClick={() => navigate('/terms')} className="hover:text-blue-600 transition-colors cursor-pointer">{t('terms.of.service')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 md:pt-8 text-center">
            <p className="text-gray-600 text-sm md:text-base">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Landing;