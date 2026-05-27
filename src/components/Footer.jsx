import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950/50 pt-16 pb-8 relative z-20 mt-auto">
      <div className="container mx-auto px-6">
        <div className="border-t border-slate-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} StackAudit Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
