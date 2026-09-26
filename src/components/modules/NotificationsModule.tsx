import React, { useState } from 'react';
import { Bell, Heart, AlertTriangle, MessageSquare, ShieldAlert, Sparkles, Check } from 'lucide-react';

interface NotificationsModuleProps {
  isWhiteTheme: boolean;
}

interface NotificationItem {
  id: string;
  type: 'critical' | 'comment' | 'ai_inference' | 'ingest';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    type: 'critical',
    title: 'Critical Triage Escalation',
    message: 'Patient Henry Higgins Chest CT classified as CRITICAL (Acute Lobar Pneumonia detected with 96.8% confidence).',
    timestamp: '2026-07-19T00:10:00-07:00',
    isRead: false
  },
  {
    id: 'notif_02',
    type: 'comment',
    title: 'Case Discussion Update',
    message: 'Dr. Marcus Vance left a comment on Eleanor Vance MRI: "Prescribing Dexamethasone 4mg QD..."',
    timestamp: '2026-07-18T16:45:00-07:00',
    isRead: false
  },
  {
    id: 'notif_03',
    type: 'ai_inference',
    title: 'MONAI Core Analysis Completed',
    message: 'Volumetric segmentation model finished for Patient Eleanor Vance Brain MRI. Hyperintense Glioma flagged.',
    timestamp: '2026-07-18T10:18:00-07:00',
    isRead: true
  },
  {
    id: 'notif_04',
    type: 'ingest',
    title: 'DICOM Study Registered',
    message: 'New knee X-Ray series (XR_1082) ingested for Patient Arthur Dent.',
    timestamp: '2026-07-19T01:05:00-07:00',
    isRead: true
  }
];

export default function NotificationsModule({ isWhiteTheme }: NotificationsModuleProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs max-w-4xl mx-auto">
      <div className="select-none flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-black tracking-tight flex items-center gap-2 ${
            isWhiteTheme ? 'text-slate-900' : 'text-white'
          }`}>
            <Bell className="w-6 h-6 text-indigo-400 animate-swing" /> Clinical Alerts & Notifications
          </h2>
          <p className={`text-xs mt-1 ${isWhiteTheme ? 'text-slate-500' : 'text-slate-400'}`}>
            Real-time HL7 messages, critical findings escalations, clinician comments, and machine learning completions.
          </p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-indigo-400 hover:text-indigo-300 font-bold border border-indigo-800/40 hover:bg-indigo-500/10 rounded-xl px-3.5 py-2 transition-all cursor-pointer"
          >
            Mark All Read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => {
          const isCritical = notif.type === 'critical';
          const isComment = notif.type === 'comment';
          const isAi = notif.type === 'ai_inference';

          return (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition-all relative ${
                notif.isRead 
                  ? isWhiteTheme
                    ? 'bg-white border-slate-200 text-slate-700 opacity-80'
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-300 opacity-60'
                  : isWhiteTheme
                    ? 'bg-indigo-50/50 border-indigo-150 text-slate-900'
                    : 'bg-slate-900/80 border-indigo-950 text-white'
              }`}
            >
              {/* Unread indicator dot */}
              {!notif.isRead && (
                <span className="absolute left-3 top-4.5 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              )}

              <div className="flex gap-4 items-start pl-3.5">
                <div className={`p-2 rounded-xl border ${
                  isCritical 
                    ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                    : isComment 
                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                    : isAi
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                    : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                }`}>
                  {isCritical && <AlertTriangle className="w-4 h-4" />}
                  {isComment && <MessageSquare className="w-4 h-4" />}
                  {isAi && <Sparkles className="w-4 h-4" />}
                  {!isCritical && !isComment && !isAi && <Bell className="w-4 h-4" />}
                </div>

                <div>
                  <h4 className="font-extrabold text-sm">{notif.title}</h4>
                  <p className={`text-xs mt-1 leading-relaxed ${notif.isRead ? 'text-slate-500' : isWhiteTheme ? 'text-slate-800' : 'text-slate-350'}`}>{notif.message}</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-semibold">
                    {new Date(notif.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isWhiteTheme 
                      ? 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-indigo-400'
                  }`}
                  title="Mark as read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No system notifications active.
          </div>
        )}
      </div>
    </div>
  );
}
