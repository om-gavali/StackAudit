import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import MultiStepForm from './components/MultiStepForm';
import Dashboard from './components/Dashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import Footer from './components/Footer';

const FeatureCard = ({ title, description, icon, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="glass-dark p-6 rounded-2xl hover:-translate-y-2 transition-all duration-300 group"
  >
    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-purple-500/30">
      <span className="text-2xl">{icon}</span>
    </div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </motion.div>
);

const TestimonialCard = ({ name, role, content, delay }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="glass p-6 rounded-2xl relative"
  >
    <div className="absolute -top-4 -left-4 text-4xl opacity-20 text-white">"</div>
    <p className="text-slate-300 italic mb-6 relative z-10">"{content}"</p>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
        {name.charAt(0)}
      </div>
      <div>
        <h4 className="text-white font-semibold">{name}</h4>
        <p className="text-sm text-slate-400">{role}</p>
      </div>
    </div>
  </motion.div>
);

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="border-b border-slate-700/50 py-4">
      <button 
        className="w-full flex justify-between items-center text-left focus:outline-none" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-slate-200">{question}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-white`}>
          ▼
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-400">{answer}</p>
      </div>
    </div>
  );
};

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="relative z-10">

      <section className="container mx-auto px-6 pt-24 pb-32 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight max-w-4xl mx-auto"
        >
          <span className="text-white">Stop Overspending on </span>
          <span className="text-gradient">AI Tools</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Audit your AI stack and discover instant monthly savings. We analyze your API usage and subscriptions to eliminate waste.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/audit')}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-slate-900 font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] cursor-pointer"
          >
            Start Free Audit
          </motion.button>
        </motion.div>
      </section>

      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How we save you money</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Our automated intelligence platform identifies redundancies and optimizes your API usage.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🔍"
              title="Usage Discovery"
              description="Tell us about your current stack and team size, and we'll instantly find overlapping services."
              delay={0.1}
            />
            <FeatureCard 
              icon="⚡"
              title="Model Optimization"
              description="Identify where you're using GPT-4o when a cheaper, faster model like Claude 3.5 Haiku would perform just as well."
              delay={0.2}
            />
            <FeatureCard 
              icon="🛑"
              title="Zombie Subscriptions"
              description="Find and cancel unused AI SaaS subscriptions that auto-renew every month draining your budget."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-24 bg-slate-900/50 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Loved by engineering teams</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Sarah Jenkins"
              role="CTO @ TechFlow"
              content="StackAudit found $4,200 in monthly savings in under 5 minutes. We were paying for API keys from developers who left 6 months ago."
              delay={0.1}
            />
            <TestimonialCard 
              name="David Chen"
              role="Lead Developer @ AI Startup"
              content="The model recommendation engine is brilliant. Switching to optimal models for background tasks cut our inference costs by 60%."
              delay={0.2}
            />
            <TestimonialCard 
              name="Elena Rodriguez"
              role="VP Engineering @ ScaleUp"
              content="Finally, a tool that gives me visibility into our AI spending across different teams. The ROI was immediate."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      <section id="faq" className="py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="glass-dark rounded-2xl p-8">
            <FaqItem 
              question="How does the audit work?"
              answer="You simply enter the tools you use, the plans you are on, and your team size. Our logic instantly analyzes your stack for redundancies and cheaper alternatives."
            />
            <FaqItem 
              question="Is my data safe?"
              answer="Yes. We do not require any API keys for the manual audit tool. All data is processed securely and no PII is stored beyond your stack configuration."
            />
            <FaqItem 
              question="How much does it cost?"
              answer="The initial audit tool is 100% free."
            />
          </div>
        </div>
      </section>

    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f172a] relative overflow-hidden font-sans text-slate-200 flex flex-col">
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }} />
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-600/20 blur-[120px]"></div>
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-blue-600/20 blur-[100px]"></div>
        </div>
        
        <Header />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/audit" element={<MultiStepForm />} />
            <Route path="/dashboard/:id" element={<Dashboard />} />
            <Route path="/report/:id" element={<Dashboard isPublic={true} />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
