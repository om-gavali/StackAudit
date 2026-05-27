import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const AVAILABLE_TOOLS = [
  'Cursor', 'GitHub Copilot', 'ChatGPT', 'Claude', 'Gemini', 'OpenAI API', 'Anthropic API', 'Windsurf'
];

export default function MultiStepForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('auditFormData');
    if (saved) return JSON.parse(saved);
    return {
      tools: [],
      companyDetails: {
        teamSize: 1,
        companyStage: 'Startup',
        primaryUseCase: 'coding'
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('auditFormData', JSON.stringify(formData));
  }, [formData]);

  const handleCompanyChange = (e) => {
    setFormData(prev => ({
      ...prev,
      companyDetails: {
        ...prev.companyDetails,
        [e.target.name]: e.target.value
      }
    }));
  };

  const addTool = (toolName) => {
    if (!formData.tools.find(t => t.name === toolName)) {
      let defaultSpend = 20;
      let defaultPlan = 'Pro';
      if (toolName.includes('API')) {
        defaultSpend = 100;
        defaultPlan = 'Usage-based';
      } else if (toolName === 'GitHub Copilot') {
        defaultSpend = 10;
        defaultPlan = 'Individual';
      }

      setFormData(prev => ({
        ...prev,
        tools: [...prev.tools, { name: toolName, plan: defaultPlan, spend: defaultSpend, seats: prev.companyDetails.teamSize || 1 }]
      }));
      toast.success(`${toolName} added to stack`);
    }
  };

  const removeTool = (index) => {
    const toolName = formData.tools[index].name;
    setFormData(prev => {
      const newTools = [...prev.tools];
      newTools.splice(index, 1);
      return { ...prev, tools: newTools };
    });
    toast.error(`${toolName} removed`);
  };

  const updateTool = (index, field, value) => {
    setFormData(prev => {
      const newTools = [...prev.tools];
      newTools[index] = { 
        ...newTools[index], 
        [field]: field === 'spend' || field === 'seats' ? (Number(value) || 0) : value 
      };
      return { ...prev, tools: newTools };
    });
  };

  const handleSubmit = async () => {
    if (formData.tools.length === 0) {
      toast.error('Please add at least one tool to analyze.');
      return;
    }

    setLoading(true);
    const auditToast = toast.loading('Calculating savings and compiling recommendations...');
    
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Audit completed! Redirecting to report...', { id: auditToast });
        navigate(`/dashboard/${data.id}`);
      } else {
        toast.error(data.error || 'Failed to generate report.', { id: auditToast });
      }
    } catch (err) {
      toast.error('Network error. Is the backend server running?', { id: auditToast });
    }
    setLoading(false);
  };

  const nextStep = () => {
    if (step === 1) {
      const teamSize = Number(formData.companyDetails.teamSize);
      if (!teamSize || teamSize < 1) {
        toast.error('Please enter a valid team size (minimum 1)');
        return;
      }
      setStep(2);
    }
  };

  return (
    <div className="container mx-auto px-6 py-24 max-w-3xl relative z-10">
      <div className="glass-dark rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1 mr-4">
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: '50%' }}
                animate={{ width: step === 1 ? '50%' : '100%' }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
          <div className="text-xs font-semibold text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/50">
            Step {step} of 2
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-2">
                  About Your Team <Sparkles className="text-purple-400" size={24} />
                </h2>
                <p className="text-slate-400">Tell us a bit about your setup to power our recommendation models.</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Team Size (Users)</label>
                  <input 
                    type="number" 
                    name="teamSize"
                    min="1"
                    required
                    value={formData.companyDetails.teamSize} 
                    onChange={handleCompanyChange}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    placeholder="e.g. 5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Company Stage</label>
                  <select 
                    name="companyStage"
                    value={formData.companyDetails.companyStage}
                    onChange={handleCompanyChange}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  >
                    <option value="Startup">Startup (Pre-seed/Seed)</option>
                    <option value="Growth">Growth (Series A-C)</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Agency">Agency / Dev Shop</option>
                    <option value="Freelancer">Freelancer / Indie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Primary Use Case</label>
                  <select 
                    name="primaryUseCase"
                    value={formData.companyDetails.primaryUseCase}
                    onChange={handleCompanyChange}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  >
                    <option value="coding">Coding / Engineering</option>
                    <option value="writing">Writing / Content</option>
                    <option value="research">Research</option>
                    <option value="data analysis">Data Analysis</option>
                    <option value="mixed">Mixed Teams</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3.5 bg-white text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform cursor-pointer"
                >
                  Configure Stack <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="mb-6">
                <h2 className="text-3xl font-extrabold text-white mb-2">Your AI Tool Stack</h2>
                <p className="text-slate-400">Select the tools you are currently paying for and customize plan costs.</p>
              </div>

              {/* Tool selector chips */}
              <div className="flex flex-wrap gap-2 mb-8 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                {AVAILABLE_TOOLS.map(tool => {
                  const isAdded = !!formData.tools.find(ft => ft.name === tool);
                  return (
                    <button
                      key={tool}
                      onClick={() => (isAdded ? toast.error(`${tool} is already added`) : addTool(tool))}
                      disabled={isAdded}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isAdded 
                          ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed' 
                          : 'glass-dark border-slate-700 text-slate-300 hover:text-white hover:border-purple-500 hover:bg-purple-500/10'
                      }`}
                    >
                      <Plus size={14} /> {tool}
                    </button>
                  );
                })}
              </div>

              {/* Tool Config Cards */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {formData.tools.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                    No tools added yet. Select tools from the choices above to start auditing.
                  </div>
                ) : (
                  formData.tools.map((tool, index) => (
                    <motion.div 
                      key={tool.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="glass p-5 rounded-2xl relative group border border-slate-800 hover:border-slate-700/80 transition-colors"
                    >
                      <button 
                        onClick={() => removeTool(index)}
                        className="absolute top-5 right-5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Remove Tool"
                      >
                        <Trash2 size={18} />
                      </button>
                      <h3 className="font-extrabold text-lg text-white mb-4 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                        {tool.name}
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Plan Level</label>
                          <input 
                            type="text" 
                            value={tool.plan} 
                            onChange={(e) => updateTool(index, 'plan', e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                            placeholder="e.g. Pro"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Monthly Cost ($/seat)</label>
                          <input 
                            type="number" 
                            value={tool.spend} 
                            min="0"
                            onChange={(e) => updateTool(index, 'spend', e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Seats / Users</label>
                          <input 
                            type="number" 
                            value={tool.seats} 
                            min="1"
                            onChange={(e) => updateTool(index, 'seats', e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Navigation buttons */}
              <div className="pt-6 flex justify-between">
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-5 py-3.5 glass-dark text-slate-300 font-medium rounded-xl hover:text-white transition-colors border border-slate-800 cursor-pointer"
                >
                  <ArrowLeft size={18} /> Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading || formData.tools.length === 0}
                  className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100 shadow-[0_0_30px_rgba(147,51,234,0.3)] cursor-pointer"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Performing Audit...</> : <><Sparkles size={18} /> Run Audit Engine</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
