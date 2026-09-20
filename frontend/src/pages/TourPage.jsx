import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api, setAccessToken } from '../lib/api.js';
import en from '../i18n/en.json';

const Icons = {
  check: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  x: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  alert: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 20h20L12 2z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  ),
  lock: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11V7a4 4 0 014-4h10a4 4 0 014 4v4M7 11v4a2 2 0 002 2h6a2 2 0 002-2v-4" />
    </svg>
  ),
  log: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 3h16v18H4V3zM8 7h8M8 11h8M8 15h4" />
    </svg>
  ),
};

export default function TourPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);
  const [results, setResults] = useState({
    auditLog: [],
    alerts: [],
    grants: [],
    decision: null,
    action: null,
    error: null,
  });

  // Scenario 1: Doctor accesses own-ward patient
  const runScenario1 = async () => {
    setLoading(true);
    setResults({ auditLog: [], alerts: [], grants: [], decision: null, action: null, error: null });
    setActiveScenario(1);

    try {
      // Login as doctor
      const loginRes = await api.login('GV-9042', 'GridVault-Demo-GV-9042!');
      setAccessToken(loginRes.data.access_token);

      // Fetch roster (own ward)
      const roster = await api.roster({ ward: 'icu', limit: 1 });
      if (!roster.data || roster.data.length === 0) {
        throw new Error('No patients in ICU ward');
      }

      // Fetch patient dossier
      const dossier = await api.dossier(roster.data[0].hospital_number);

      // Fetch audit logs
      const logs = await api.auditLogs({ limit: 10 });

      setResults({
        auditLog: logs.data || [],
        alerts: [],
        grants: [],
        decision: 'ALLOW - ROLE_WARD_DUTY_SATISFIED',
        action: 'Doctor (GV-9042) viewed patient in assigned ICU ward',
        error: null,
      });
    } catch (err) {
      setResults({
        auditLog: [],
        alerts: [],
        grants: [],
        decision: 'ERROR',
        action: null,
        error: err.message || 'Request failed',
      });
    } finally {
      setLoading(false);
    }
  };

  // Scenario 2: Clerk probes unassigned patient
  const runScenario2 = async () => {
    setLoading(true);
    setResults({ auditLog: [], alerts: [], grants: [], decision: null, action: null, error: null });
    setActiveScenario(2);

    try {
      // Login as clerk
      const loginRes = await api.login('RC-1029', 'GridVault-Demo-RC-1029!');
      setAccessToken(loginRes.data.access_token);

      // Try to access a patient not in queue (will fail)
      try {
        await api.dossier('HN-0002');
      } catch (err) {
        // Expected to fail with CLERK_OUT_OF_QUEUE
      }

      // Fetch abuse alerts
      const alerts = await api.abuseAlerts({ status: 'FLAGGED', limit: 10 });

      // Fetch audit logs
      const logs = await api.auditLogs({ limit: 10 });

      setResults({
        auditLog: logs.data || [],
        alerts: alerts.data || [],
        grants: [],
        decision: 'DENY - CLERK_OUT_OF_QUEUE',
        action: 'Clerk (RC-1029) attempted to access unassigned patient - RULE-ABUSE-01 fired',
        error: null,
      });
    } catch (err) {
      setResults({
        auditLog: [],
        alerts: [],
        grants: [],
        decision: 'ERROR',
        action: null,
        error: err.message || 'Request failed',
      });
    } finally {
      setLoading(false);
    }
  };

  // Scenario 3: Doctor break-glass override
  const runScenario3 = async () => {
    setLoading(true);
    setResults({ auditLog: [], alerts: [], grants: [], decision: null, action: null, error: null });
    setActiveScenario(3);

    try {
      // Login as doctor
      const loginRes = await api.login('GV-9042', 'GridVault-Demo-GV-9042!');
      setAccessToken(loginRes.data.access_token);

      // Try to access Ward A patient (doctor is ICU, will fail)
      try {
        await api.dossier('HN-0003');
      } catch (err) {
        // Expected: WARD_MISMATCH
      }

      // Execute break-glass
      const override = await api.overrideExecute({
        patient_id: 'HN-0003',
        justification_code: 'TRAUMA',
        justification_notes: 'Emergency patient critical condition',
        pin: '220042',
      });

      // Try access again (now should work)
      const dossier = await api.dossier('HN-0003');

      // Fetch overrides and logs
      const overrides = await api.overrideQueue('ACTIVE');
      const logs = await api.auditLogs({ limit: 10 });

      setResults({
        auditLog: logs.data || [],
        alerts: [],
        grants: overrides.data?.overrides || [],
        decision: 'ALLOW - EMERGENCY_GRANT',
        action: 'Doctor (GV-9042) used break-glass PIN to access critical patient outside ward',
        error: null,
      });
    } catch (err) {
      setResults({
        auditLog: [],
        alerts: [],
        grants: [],
        decision: 'ERROR',
        action: null,
        error: err.message || 'Request failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-slate-900">GridVault Demo Tour</h1>
        <p className="text-slate-600 mt-2">Interactive walkthrough of access control and abuse detection</p>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Personas Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Demo Personas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <PersonaCard name="Olumide Adeyemi" staffId="GV-9042" role="Doctor" ward="ICU" />
            <PersonaCard name="Chioma Okonkwo" staffId="SN-7742" role="Nurse" ward="Ward A" />
            <PersonaCard name="Ibrahim Danjuma" staffId="RC-1029" role="Clerk" ward="Admissions" />
            <PersonaCard name="Kemi Balogun" staffId="AD-0012" role="Admin" ward="Admin" />
            <PersonaCard name="Ngozi Eze" staffId="GV-9101" role="CMO" ward="Admin" />
          </div>
        </section>

        {/* Scenarios Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Scenario 1 */}
            <button
              onClick={runScenario1}
              disabled={loading}
              className={`p-6 rounded-lg border-2 text-left transition ${
                activeScenario === 1
                  ? 'bg-emerald-50 border-emerald-500'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-2 mb-3">
                {Icons.check}
                <span className="font-bold text-slate-900">Allowed Access</span>
              </div>
              <p className="text-sm text-slate-600">Doctor views patient in own ward (ICU)</p>
              <p className="text-xs text-slate-500 mt-2">Shows: Access granted, audit log entry</p>
            </button>

            {/* Scenario 2 */}
            <button
              onClick={runScenario2}
              disabled={loading}
              className={`p-6 rounded-lg border-2 text-left transition ${
                activeScenario === 2
                  ? 'bg-red-50 border-red-500'
                  : 'bg-white border-slate-200 hover:border-red-300'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-2 mb-3">
                {Icons.x}
                <span className="font-bold text-slate-900">Denied + Alert</span>
              </div>
              <p className="text-sm text-slate-600">Clerk probes unassigned patient</p>
              <p className="text-xs text-slate-500 mt-2">Shows: Access denied, CRITICAL abuse alert</p>
            </button>

            {/* Scenario 3 */}
            <button
              onClick={runScenario3}
              disabled={loading}
              className={`p-6 rounded-lg border-2 text-left transition ${
                activeScenario === 3
                  ? 'bg-amber-50 border-amber-500'
                  : 'bg-white border-slate-200 hover:border-amber-300'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-2 mb-3">
                {Icons.lock}
                <span className="font-bold text-slate-900">Break-Glass</span>
              </div>
              <p className="text-sm text-slate-600">Doctor overrides ward mismatch via PIN</p>
              <p className="text-xs text-slate-500 mt-2">Shows: Emergency access granted, audit trail</p>
            </button>
          </div>
        </section>

        {/* Results Section */}
        {activeScenario && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Results</h2>

            {/* Decision Box */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="pt-1">
                  {results.decision === 'ALLOW - ROLE_WARD_DUTY_SATISFIED' && Icons.check}
                  {results.decision === 'DENY - CLERK_OUT_OF_QUEUE' && Icons.x}
                  {results.decision === 'ALLOW - EMERGENCY_GRANT' && Icons.lock}
                  {results.decision === 'ERROR' && Icons.alert}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg text-slate-900">{results.decision}</div>
                  <div className="text-slate-600 mt-2">{results.action}</div>
                  {results.error && <div className="text-red-600 mt-2 text-sm">{results.error}</div>}
                </div>
              </div>
            </div>

            {/* Alerts */}
            {results.alerts && results.alerts.length > 0 && (
              <div className="bg-red-50 rounded-lg border border-red-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  {Icons.alert}
                  <span className="font-bold text-red-900">Abuse Alerts ({results.alerts.length})</span>
                </div>
                <div className="space-y-3">
                  {results.alerts.map((alert) => (
                    <div key={alert.id} className="bg-white rounded p-3 border border-red-200">
                      <div className="font-semibold text-slate-900">{alert.rule_triggered}</div>
                      <div className="text-sm text-slate-600 mt-1">{alert.details}</div>
                      <div className="text-xs text-red-700 mt-2">Severity: {alert.severity}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grants */}
            {results.grants && results.grants.length > 0 && (
              <div className="bg-amber-50 rounded-lg border border-amber-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  {Icons.lock}
                  <span className="font-bold text-amber-900">Active Grants ({results.grants.length})</span>
                </div>
                <div className="space-y-3">
                  {results.grants.map((grant) => (
                    <div key={grant.id} className="bg-white rounded p-3 border border-amber-200">
                      <div className="text-sm font-semibold text-slate-900">Patient: {grant.patient_id}</div>
                      <div className="text-xs text-slate-600 mt-1">Expires: {new Date(grant.expires_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Log */}
            {results.auditLog && results.auditLog.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  {Icons.log}
                  <span className="font-bold text-slate-900">Audit Log (last 10 entries)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left text-slate-600 font-semibold py-2">Time</th>
                        <th className="text-left text-slate-600 font-semibold py-2">Staff</th>
                        <th className="text-left text-slate-600 font-semibold py-2">Patient</th>
                        <th className="text-left text-slate-600 font-semibold py-2">Action</th>
                        <th className="text-left text-slate-600 font-semibold py-2">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.auditLog.map((entry) => (
                        <tr key={entry.log_index} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 text-slate-600">{new Date(entry.timestamp).toLocaleTimeString()}</td>
                          <td className="py-3 text-slate-900 font-medium">{entry.staff_id}</td>
                          <td className="py-3 text-slate-600">{entry.patient_id}</td>
                          <td className="py-3 text-slate-600">{entry.action}</td>
                          <td className="py-3">
                            <span className={`text-xs font-semibold ${
                              entry.details?.reason_code?.includes('ALLOW') || !entry.details?.reason_code
                                ? 'text-emerald-700'
                                : 'text-red-700'
                            }`}>
                              {entry.details?.reason_code || 'OK'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function PersonaCard({ name, staffId, role, ward }) {
  const password = `GridVault-Demo-${staffId}!`;

  const copyLogin = () => {
    const text = `Staff ID: ${staffId}\nPassword: ${password}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-300 transition cursor-pointer" onClick={copyLogin}>
      <div className="font-bold text-slate-900 text-sm">{name}</div>
      <div className="text-xs text-slate-600 mt-1">{role}</div>
      <div className="text-xs text-slate-500 mt-1">{ward}</div>
      <div className="text-xs text-blue-600 mt-3 font-semibold">Click to copy login</div>
    </div>
  );
}