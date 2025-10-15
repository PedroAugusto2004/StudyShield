import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import studyShieldLogo from "@/assets/studyshield-logo.png";
import { BookOpen, Download, MessageCircle, Shield, Zap, Chrome, Settings, CheckCircle, UserPlus, Cpu, MessageSquare, Sliders, Github } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const HelpCenter = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full py-4 px-4 md:py-6 md:px-12 backdrop-blur-sm bg-white/80 fixed top-0 left-0 right-0 z-[9999] border-b border-gray-100"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <img 
              src={studyShieldLogo} 
              alt="StudyShield Logo" 
              className="h-8 md:h-12 cursor-pointer" 
              onClick={() => navigate('/')}
            />
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
      <main className="pt-32 pb-16 px-4 md:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              {t('help.center')}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('help.center.description')}
            </p>
          </motion.div>

          {/* How to Use StudyShield */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              {t('how.to.use.studyshield')}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-2xl p-6"
                style={{
                  border: '6px solid #000',
                  borderRadius: '16px',
                  boxShadow: '8px 8px 0px #000'
                }}
              >
                <div className="text-left">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-6xl font-black text-gray-800">1</h3>
                    <UserPlus className="w-12 h-12 text-gray-700" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{t('create.your.account')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('create.account.description')}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-2xl p-6"
                style={{
                  border: '6px solid #000',
                  borderRadius: '16px',
                  boxShadow: '8px 8px 0px #000'
                }}
              >
                <div className="text-left">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-6xl font-black text-gray-800">2</h3>
                    <Cpu className="w-12 h-12 text-gray-700" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{t('choose.ai.mode')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('choose.ai.mode.description')}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white rounded-2xl p-6"
                style={{
                  border: '6px solid #000',
                  borderRadius: '16px',
                  boxShadow: '8px 8px 0px #000'
                }}
              >
                <div className="text-left">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-6xl font-black text-gray-800">3</h3>
                    <MessageSquare className="w-12 h-12 text-gray-700" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{t('start.chatting')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('start.chatting.description')}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white rounded-2xl p-6"
                style={{
                  border: '6px solid #000',
                  borderRadius: '16px',
                  boxShadow: '8px 8px 0px #000'
                }}
              >
                <div className="text-left">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-6xl font-black text-gray-800">4</h3>
                    <Sliders className="w-12 h-12 text-gray-700" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{t('customize.experience')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('customize.experience.description')}
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-8 bg-blue-600 text-white p-6 rounded-2xl"
            >
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">{t('pro.tip.safe.filtering')}</h3>
                  <p className="text-blue-50">
                    {t('pro.tip.description')}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* How to Install Gemini Nano */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              {t('how.to.enable.gemini.nano')}
            </h2>

            <div className="bg-white p-8 rounded-2xl mb-8" style={{
              border: '6px solid #000',
              borderRadius: '16px',
              boxShadow: '8px 8px 0px #000'
            }}>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('what.is.gemini.nano')}</h3>
              <p className="text-gray-700 mb-4">
                {t('gemini.nano.intro')}
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>{t('complete.privacy')}:</strong> {t('complete.privacy.description')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>{t('offline.functionality')}:</strong> {t('offline.functionality.description')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>{t('instant.response')}:</strong> {t('instant.response.description')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>{t('safe.content.detection')}:</strong> {t('safe.content.detection.description')}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {t('use.chrome.canary')}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {t('chrome.canary.description')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a 
                        href="https://www.google.com/chrome/canary/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center w-full sm:w-auto"
                      >
                        <Download className="w-5 h-5" />
                        {t('download.chrome.canary')}
                      </a>
                      <a 
                        href="https://www.google.com/chrome/dev/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-center w-full sm:w-auto"
                      >
                        <Download className="w-5 h-5" />
                        {t('download.chrome.dev')}
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {t('enable.experimental.features')}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {t('navigate.to.flags')}
                    </p>
                    <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm mb-3 text-black">
                      chrome://flags
                    </div>
                    <p className="text-gray-600 mb-3">
                      {t('enable.three.flags')}
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <strong>Prompt API for Gemini Nano</strong>
                        <div className="text-sm text-gray-600 mt-1">Set to: <span className="font-mono bg-white px-2 py-1 rounded">Enabled</span></div>
                      </li>
                      <li className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <strong>Enables optimization guide on device</strong>
                        <div className="text-sm text-gray-600 mt-1">Set to: <span className="font-mono bg-white px-2 py-1 rounded">Enabled BypassPerfRequirement</span></div>
                      </li>
                      <li className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <strong>Summarization API for Gemini Nano</strong>
                        <div className="text-sm text-gray-600 mt-1">Set to: <span className="font-mono bg-white px-2 py-1 rounded">Enabled</span></div>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {t('restart.chrome')}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {t('restart.chrome.description')}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {t('download.the.model')}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {t('download.model.description')}
                    </p>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-3 overflow-x-auto">
                      await ai.languageModel.create();
                    </div>
                    <p className="text-gray-600 mb-3">
                      {t('model.download.time')}
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900">
                        <strong>{t('note')}:</strong> {t('model.cached.note')}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {t('alternative.download.helper')}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {t('alternative.download.helper.description')}
                    </p>
                    <a 
                      href="https://github.com/PedroAugusto2004/Gemini-nano-enable-test" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-black transition-colors font-medium"
                    >
                      <Github className="w-5 h-5" />
                      {t('view.github.repository')}
                    </a>
                    <p className="text-sm text-gray-500 mt-3">
                      {t('repository.instructions')}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    6
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      {t('verify.installation')}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {t('verify.installation.description')}
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-green-900 font-semibold">✓ {t('offline.mode')}: {t('ready')}</p>
                      <p className="text-sm text-green-700 mt-1">{t('gemini.nano.ready')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="mt-8 bg-white p-6 rounded-2xl"
              style={{
                border: '6px solid #000',
                borderRadius: '16px',
                boxShadow: '8px 8px 0px #000'
              }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('troubleshooting')}</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{t('troubleshoot.download.fail')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{t('troubleshoot.chrome.version')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{t('troubleshoot.flags.enabled')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{t('troubleshoot.storage.space')}</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="mt-6 bg-gray-50 p-6 rounded-2xl border-2 border-gray-200"
            >
              <p className="text-gray-700 mb-3">
                {t('more.info.documentation')}
              </p>
              <a
                href="https://developer.chrome.com/docs/ai/built-in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium underline"
              >
                {t('chrome.ai.documentation')}
                <BookOpen className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.section>

          {/* Need More Help */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {t('still.need.help')}
            </h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              {t('still.need.help.description')}
            </p>
            <Button
              onClick={() => navigate('/contact')}
              size="lg"
              className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              {t('contact.support')}
            </Button>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default HelpCenter;
