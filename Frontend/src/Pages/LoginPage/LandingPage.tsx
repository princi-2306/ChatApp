import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    y: -5,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// --- UPDATED ICONS SECTION ---
// All icons now accept a className prop

const MessageCircle = ({ className }: { className?: string }) => (
  <svg
    className={`w-6 h-6 ${className || ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const Shield = ({ className }: { className?: string }) => (
  <svg
    className={`w-6 h-6 ${className || ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const Zap = ({ className }: { className?: string }) => (
  <svg
    className={`w-6 h-6 ${className || ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const Users = ({ className }: { className?: string }) => (
  <svg
    className={`w-6 h-6 ${className || ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
);

const Lock = ({ className }: { className?: string }) => (
  <svg
    className={`w-6 h-6 ${className || ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const Globe = ({ className }: { className?: string }) => (
  <svg
    className={`w-6 h-6 ${className || ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const LandingPage: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-black text-white"
    >
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-6 py-6 border-b border-gray-800"
      >
        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <div className="text-gray-300">
              <MessageCircle />
            </div>
            <span className="text-2xl font-bold text-white">GossipGirls</span>
          </motion.div>

          <div className="flex items-center space-x-4">
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white hover:bg-gray-900 border-gray-700"
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-white">Welcome Back</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Enter your credentials to access your account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                  <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700">
                    Sign In
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-white text-black hover:bg-gray-200 border border-gray-300">
                    Sign Up Free
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Create Account
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Join thousands of users already on ChatSphere
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Full Name"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                  <Button className="w-full bg-white text-black hover:bg-gray-200 border border-gray-300">
                    Create Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 py-20"
      >
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="text-white">Secure Team</span>
            <br />
            <span className="text-gray-300">Communication</span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Enterprise-grade messaging with military security, real-time
            collaboration, and seamless integration for modern teams.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg border border-gray-300"
                onClick={() => setIsSignUpOpen(true)}
              >
                Start Free Trial
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-900 hover:text-white px-8 py-3 text-lg"
              >
                View Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Enterprise Features
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Built for security, performance, and scale
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-600 transition-all duration-300">
              <CardHeader>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4"
                >
                  <Lock className="text-gray-300" />
                </motion.div>
                <CardTitle className="text-white">
                  End-to-End Encryption
                </CardTitle>
                <CardDescription className="text-gray-400">
                  All messages are encrypted in transit and at rest with AES-256
                  encryption.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-600 transition-all duration-300">
              <CardHeader>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4"
                >
                  <Zap className="text-gray-300" />
                </motion.div>
                <CardTitle className="text-white">
                  Real-Time Messaging
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Instant message delivery with read receipts and typing
                  indicators.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-600 transition-all duration-300">
              <CardHeader>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4"
                >
                  <Users className="text-gray-300" />
                </motion.div>
                <CardTitle className="text-white">Team Channels</CardTitle>
                <CardDescription className="text-gray-400">
                  Organized spaces for teams, projects, and departments.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-600 transition-all duration-300">
              <CardHeader>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4"
                >
                  <Shield className="text-gray-300" />
                </motion.div>
                <CardTitle className="text-white">
                  Enterprise Security
                </CardTitle>
                <CardDescription className="text-gray-400">
                  SOC 2 compliant with advanced admin controls and audit logs.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-600 transition-all duration-300">
              <CardHeader>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4"
                >
                  <Globe className="text-gray-300" />
                </motion.div>
                <CardTitle className="text-white">
                  Global Infrastructure
                </CardTitle>
                <CardDescription className="text-gray-400">
                  99.9% uptime with data centers across multiple regions
                  worldwide.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-600 transition-all duration-300">
              <CardHeader>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4"
                >
                  <MessageCircle className="text-gray-300" />
                </motion.div>
                <CardTitle className="text-white">Unlimited History</CardTitle>
                <CardDescription className="text-gray-400">
                  Search through all your messages and files with no time
                  limits.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="container mx-auto px-6 py-20"
      >
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-4 text-white"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-xl mb-8 max-w-2xl mx-auto text-gray-400"
          >
            Join professional teams worldwide who trust ChatSphere for their
            secure communications.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg border border-gray-300"
                onClick={() => setIsSignUpOpen(true)}
              >
                Sign Up Free
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-3 text-lg"
                onClick={() => setIsLoginOpen(true)}
              >
                Login to Account
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="bg-gray-900 border-t border-gray-800 py-12"
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 mb-4"
              >
                <div className="text-gray-300">
                  <MessageCircle />
                </div>
                <span className="text-2xl font-bold text-white">
                  GossipGirls
                </span>
              </motion.div>
              <p className="text-gray-400 max-w-md">
                Enterprise-grade secure messaging platform built for modern
                teams. Privacy first, performance always.
              </p>
            </div>

            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <motion.a
                    whileHover={{ x: 5, color: "#ffffff" }}
                    href="#features"
                    className="hover:text-white transition-colors block"
                  >
                    Features
                  </motion.a>
                </li>
                <li>
                  <motion.a
                    whileHover={{ x: 5, color: "#ffffff" }}
                    href="#"
                    className="hover:text-white transition-colors block"
                  >
                    Security
                  </motion.a>
                </li>
                <li>
                  <motion.a
                    whileHover={{ x: 5, color: "#ffffff" }}
                    href="#"
                    className="hover:text-white transition-colors block"
                  >
                    Enterprise
                  </motion.a>
                </li>
                <li>
                  <motion.a
                    whileHover={{ x: 5, color: "#ffffff" }}
                    href="#"
                    className="hover:text-white transition-colors block"
                  >
                    Download
                  </motion.a>
                </li>
              </ul>
            </motion.div>

            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <motion.a
                    whileHover={{ x: 5, color: "#ffffff" }}
                    href="#"
                    className="hover:text-white transition-colors block"
                  >
                    About
                  </motion.a>
                </li>
                <li>
                  <motion.a
                    whileHover={{ x: 5, color: "#ffffff" }}
                    href="#"
                    className="hover:text-white transition-colors block"
                  >
                    Blog
                  </motion.a>
                </li>
                <li>
                  <motion.a
                    whileHover={{ x: 5, color: "#ffffff" }}
                    href="#"
                    className="hover:text-white transition-colors block"
                  >
                    Careers
                  </motion.a>
                </li>
                <li>
                  <motion.a
                    whileHover={{ x: 5, color: "#ffffff" }}
                    href="#"
                    className="hover:text-white transition-colors block"
                  >
                    Contact
                  </motion.a>
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 mb-4 md:mb-0">
              <p>&copy; 2024 ChatSphere. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <motion.a
                whileHover={{ scale: 1.1, color: "#d1d5db" }}
                href="#"
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                Privacy
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, color: "#d1d5db" }}
                href="#"
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                Terms
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, color: "#d1d5db" }}
                href="#"
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                Cookies
              </motion.a>
            </div>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
};

export default LandingPage;