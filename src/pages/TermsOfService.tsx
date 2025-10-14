import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import studyShieldLogo from "@/assets/studyshield-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const TermsOfService = () => {
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

      {/* Terms of Service Content */}
      <main className="pt-32 pb-16 px-4 md:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="prose prose-lg max-w-none"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">{t('terms.of.service.title')}</h1>
            <p className="text-gray-600 mb-8">{t('last.updated')}: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. {t('acceptance.of.terms')}</h2>
              <p className="text-gray-700 mb-4">
                {t('acceptance.of.terms.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. {t('description.of.service')}</h2>
              <p className="text-gray-700 mb-4">
                {t('description.of.service.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. {t('user.accounts')}</h2>
              <p className="text-gray-700 mb-4">{t('user.accounts.intro')}</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>{t('provide.accurate.info')}</li>
                <li>{t('maintain.security')}</li>
                <li>{t('responsible.for.activities')}</li>
                <li>{t('notify.unauthorized')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. {t('acceptable.use')}</h2>
              <p className="text-gray-700 mb-4">{t('you.agree.not.to')}</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>{t('unlawful.purpose')}</li>
                <li>{t('bypass.security')}</li>
                <li>{t('share.account')}</li>
                <li>{t('interfere.service')}</li>
                <li>{t('upload.malicious')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. {t('ai.content.filtering')}</h2>
              <p className="text-gray-700 mb-4">
                {t('ai.content.filtering.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. {t('privacy.and.data')}</h2>
              <p className="text-gray-700 mb-4">
                {t('privacy.and.data.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. {t('intellectual.property')}</h2>
              <p className="text-gray-700 mb-4">
                {t('intellectual.property.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. {t('service.availability')}</h2>
              <p className="text-gray-700 mb-4">
                {t('service.availability.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. {t('limitation.of.liability')}</h2>
              <p className="text-gray-700 mb-4">
                {t('limitation.of.liability.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. {t('termination')}</h2>
              <p className="text-gray-700 mb-4">
                {t('termination.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. {t('changes.to.terms')}</h2>
              <p className="text-gray-700 mb-4">
                {t('changes.to.terms.text')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. {t('contact.information')}</h2>
              <p className="text-gray-700 mb-4">
                {t('contact.information.text')}{" "}
                <a href="/contact" className="text-blue-600 hover:underline">{t('our.contact.page')}</a>.
              </p>
            </section>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;