import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import studyShieldLogo from "@/assets/studyshield-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

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

      {/* Privacy Policy Content */}
      <main className="pt-32 pb-16 px-4 md:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="prose prose-lg max-w-none"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">{t('privacy.policy.title')}</h1>
            <p className="text-gray-600 mb-8">{t('last.updated')}: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. {t('information.we.collect')}</h2>
              <p className="text-gray-700 mb-4">
                {t('information.we.collect.text')}
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>{t('account.information')}</li>
                <li>{t('study.preferences')}</li>
                <li>{t('usage.data')}</li>
                <li>{t('device.information')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. {t('how.we.use.info')}</h2>
              <p className="text-gray-700 mb-4">{t('how.we.use.intro')}</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>{t('provide.improve.services')}</li>
                <li>{t('filter.harmful.content')}</li>
                <li>{t('personalize.experience')}</li>
                <li>{t('send.updates')}</li>
                <li>{t('ensure.security')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. {t('ai.content.processing')}</h2>
              <p className="text-gray-700 mb-4">
                {t('ai.content.processing.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. {t('data.security')}</h2>
              <p className="text-gray-700 mb-4">
                {t('data.security.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. {t('third.party.services')}</h2>
              <p className="text-gray-700 mb-4">
                {t('third.party.services.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. {t('your.rights')}</h2>
              <p className="text-gray-700 mb-4">{t('your.rights.intro')}</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>{t('access.data')}</li>
                <li>{t('correct.information')}</li>
                <li>{t('delete.account.data')}</li>
                <li>{t('export.data')}</li>
                <li>{t('opt.out')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. {t('childrens.privacy')}</h2>
              <p className="text-gray-700 mb-4">
                {t('childrens.privacy.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. {t('contact.us')}</h2>
              <p className="text-gray-700 mb-4">
                {t('contact.us.text')}{" "}
                <a href="/contact" className="text-blue-600 hover:underline">{t('our.contact.page')}</a>.
              </p>
            </section>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;