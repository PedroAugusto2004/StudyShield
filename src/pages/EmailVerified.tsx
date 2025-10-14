import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import studyShieldLogo from "@/assets/studyshield-logo.png";

const EmailVerified = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-8">
          <img src={studyShieldLogo} alt="StudyShield Logo" className="h-12 mx-auto mb-8" />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Email Verified!
          </h1>
          
          <p className="text-gray-600 text-lg mb-8">
            Your account has been successfully verified. You can now sign in and start your secure learning journey with StudyShield.
          </p>
          
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Sign In to StudyShield
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerified;