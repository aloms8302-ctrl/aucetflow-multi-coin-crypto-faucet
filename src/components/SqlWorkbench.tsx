import React, { useState } from 'react';
import { FAUCETFLOW_SQL_SCRIPT, SCHEMA_SECTIONS } from '../data/schemaSql';
import {
  Copy,
  Check,
  FileCode,
  Terminal,
  ExternalLink,
  ChevronRight,
  Database,
} from 'lucide-react';

interface SqlWorkbenchProps {
  onOpenConnectModal: () => void;
}

export const SqlWorkbench: React.FC<SqlWorkbenchProps> = ({
  onOpenConnectModal,
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>('all');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(FAUCETFLOW_SQL_SCRIPT);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySnippet = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              <span>PostgreSQL / Supabase Schema Specification</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              SQL Schema Workbench & Deployment
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Complete DDL, security definer stored procedures, advisory locks, triggers, and RLS policies for FaucetFlow.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all"
            >
              {copiedAll ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied Complete SQL!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Complete SQL Script</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenConnectModal}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Database className="h-3.5 w-3.5 text-cyan-400" />
              <span>Connect Supabase</span>
            </button>
          </div>
        </div>

        {/* 4-Step Deployment Guide Card */}
        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <span>Supabase 3-Minute Deployment Checklist</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#090d16] p-3 rounded-lg border border-slate-800">
              <div className="text-cyan-400 font-bold mb-1 font-mono">01. Open SQL Editor</div>
              <p className="text-slate-400 text-[11px]">
                In your Supabase project dashboard, navigate to <strong>SQL Editor</strong> and click <strong>New Query</strong>.
              </p>
            </div>
            <div className="bg-[#090d16] p-3 rounded-lg border border-slate-800">
              <div className="text-cyan-400 font-bold mb-1 font-mono">02. Paste & Run Script</div>
              <p className="text-slate-400 text-[11px]">
                Paste the full SQL script and hit <strong>Run</strong>. Tables, RPCs, triggers, and indexes will provision immediately.
              </p>
            </div>
            <div className="bg-[#090d16] p-3 rounded-lg border border-slate-800">
              <div className="text-cyan-400 font-bold mb-1 font-mono">03. Grant Admin Role</div>
              <p className="text-slate-400 text-[11px]">
                To assign yourself admin, run <code className="text-cyan-300">insert into admin_roles values ('&lt;uuid&gt;');</code>.
              </p>
            </div>
            <div className="bg-[#090d16] p-3 rounded-lg border border-slate-800">
              <div className="text-cyan-400 font-bold mb-1 font-mono">04. Connect URL & Key</div>
              <p className="text-slate-400 text-[11px]">
                Copy <strong>Project URL</strong> and <strong>anon key</strong> from Settings &rarr; API into FaucetFlow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSectionId('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeSectionId === 'all'
              ? 'bg-slate-800 text-cyan-300 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Full SQL Script (All 11 Sections)
        </button>
        {SCHEMA_SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSectionId(sec.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeSectionId === sec.id
                ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {sec.title}
          </button>
        ))}
      </div>

      {/* SQL Editor View */}
      <div className="rounded-xl border border-slate-800 bg-[#060911] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <FileCode className="h-4 w-4 text-cyan-400" />
            <span>faucetflow_supabase_schema.sql</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400">PostgreSQL 15+</span>
          </div>

          <button
            onClick={() => {
              const codeToCopy =
                activeSectionId === 'all'
                  ? FAUCETFLOW_SQL_SCRIPT
                  : SCHEMA_SECTIONS.find((s) => s.id === activeSectionId)
                      ?.codeSnippet || FAUCETFLOW_SQL_SCRIPT;
              handleCopySnippet(activeSectionId, codeToCopy);
            }}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            {copiedSection === activeSectionId ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy Current View</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
          <pre className="font-mono text-xs text-slate-300 leading-relaxed font-mono-numbers">
            {activeSectionId === 'all'
              ? FAUCETFLOW_SQL_SCRIPT
              : SCHEMA_SECTIONS.find((s) => s.id === activeSectionId)?.codeSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
