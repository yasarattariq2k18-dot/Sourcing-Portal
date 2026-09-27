import React, { useState } from 'react';
import { MaterialItem, DiscussionThread, AuditEvent, TrainingVideo } from '../types/procurement';
import { INITIAL_DISCUSSIONS, INITIAL_AUDIT_LOGS } from '../data/collaborationData';
import { TRAINING_VIDEOS } from '../data/mediaData';
import { 
  MessageSquare, 
  History, 
  Video, 
  Send, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Tag, 
  User, 
  ExternalLink,
  X
} from 'lucide-react';

interface CollaborativeHubProps {
  materials: MaterialItem[];
  onSelectMaterial: (item: MaterialItem) => void;
}

export const CollaborativeHub: React.FC<CollaborativeHubProps> = ({
  materials,
  onSelectMaterial
}) => {
  const [activeSection, setActiveSection] = useState<'discussions' | 'audit' | 'videos'>('discussions');

  // Discussions state
  const [discussions, setDiscussions] = useState<DiscussionThread[]>(INITIAL_DISCUSSIONS);
  const [selectedMaterialCode, setSelectedMaterialCode] = useState<string>('111000297');
  const [commentText, setCommentText] = useState('');
  const [commentPriority, setCommentPriority] = useState<'Routine' | 'Urgent' | 'Critical'>('Routine');
  const [commentAuthor, setCommentAuthor] = useState('Tariq Mehmood');
  const [commentRole, setCommentRole] = useState('Sourcing Director');

  // Audit Log filter state
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);
  const [auditFilter, setAuditFilter] = useState<'ALL' | 'Completed' | 'Pending' | 'Flagged'>('ALL');

  // Video Hub filter state
  const [videoCategory, setVideoCategory] = useState<string>('ALL');
  const [activeVideoModal, setActiveVideoModal] = useState<TrainingVideo | null>(null);

  const selectedMaterial = materials.find(m => m.materialCode === selectedMaterialCode) || materials[0];

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: DiscussionThread = {
      id: `COM-${Date.now().toString().slice(-4)}`,
      materialCode: selectedMaterial.materialCode,
      materialName: selectedMaterial.materialName,
      author: commentAuthor,
      role: commentRole,
      text: commentText,
      priority: commentPriority,
      timestamp: 'Just now',
      tags: [selectedMaterial.type, selectedMaterial.sourceType.split(' ')[0]]
    };

    setDiscussions([newComment, ...discussions]);
    setCommentText('');
  };

  const filteredLogs = auditLogs.filter(log => {
    if (auditFilter !== 'ALL' && log.status !== auditFilter) return false;
    return true;
  });

  const filteredVideos = TRAINING_VIDEOS.filter(v => {
    if (videoCategory !== 'ALL' && v.category !== videoCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-mono text-slate-400 font-bold block">
            Collaboration & Compliance Engine
          </span>
          <h2 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
            Cross-Functional SCM Discussions, Compliance Audit Log & Video Knowledge Hub
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate procurement negotiations, audit timestamps, and supplier onboarding training modules.
          </p>
        </div>

        {/* Section Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveSection('discussions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSection === 'discussions'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Discussions ({discussions.length})</span>
          </button>
          <button
            onClick={() => setActiveSection('audit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSection === 'audit'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Log ({auditLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveSection('videos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSection === 'videos'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Media Hub</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. CONTEXTUAL DISCUSSION THREADS */}
      {/* ========================================================= */}
      {activeSection === 'discussions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Material Selector & Post Comment Form (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Post SCM Thread</h3>
              <p className="text-[11px] text-slate-500">Attach collaborative notes, QC queries, or pricing updates</p>
            </div>

            <form onSubmit={handlePostComment} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Material Code:</label>
                <select
                  value={selectedMaterialCode}
                  onChange={e => setSelectedMaterialCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-medium"
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.materialCode}>
                      {m.materialName} ({m.materialCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Your Name:</label>
                  <input
                    type="text"
                    value={commentAuthor}
                    onChange={e => setCommentAuthor(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Role / Dept:</label>
                  <input
                    type="text"
                    value={commentRole}
                    onChange={e => setCommentRole(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Priority Classification:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Routine', 'Urgent', 'Critical'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCommentPriority(p)}
                      className={`p-1.5 text-xs font-semibold rounded-lg border text-center transition-colors ${
                        commentPriority === p
                          ? p === 'Critical' ? 'bg-rose-50 border-rose-300 text-rose-800' : p === 'Urgent' ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-slate-100 border-slate-300 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Discussion Note / Query:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. @QualityTeam please expedite HPLC assay test for candidate lot..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Contextual Comment</span>
              </button>
            </form>
          </div>

          {/* Right: Active Discussions Feed (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Procurement & QC Collaboration Feed</h3>
                <p className="text-[11px] text-slate-500">Live notes linked to materials and supplier evaluations</p>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {discussions.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.author}</span>
                        <span className="text-[10px] text-slate-400">· {item.role}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 font-semibold block mt-0.5">
                        Ref: {item.materialName} ({item.materialCode})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        item.priority === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        item.priority === 'Urgent' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-slate-800 leading-relaxed text-[11px] whitespace-pre-line">
                    {item.text}
                  </p>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.tags.map((t, idx) => (
                        <span key={idx} className="text-[9px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. COMPLIANCE & AUDIT ACTIVITY LOG */}
      {/* ========================================================= */}
      {activeSection === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Compliance & Procurement Audit Trail</h3>
              <p className="text-[11px] text-slate-500">Automated chronological event ledger for inspections and regulatory traceability</p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
              {(['ALL', 'Completed', 'Pending', 'Flagged'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setAuditFilter(st)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    auditFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Material Reference</th>
                  <th className="p-3">Details & Actions</th>
                  <th className="p-3">Authorized By</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3 font-sans font-semibold text-slate-900">{log.eventType}</td>
                    <td className="p-3 font-sans">
                      <span className="font-semibold text-slate-800 block">{log.materialName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.materialCode}</span>
                    </td>
                    <td className="p-3 font-sans text-slate-700 max-w-xs">{log.description}</td>
                    <td className="p-3 font-sans text-slate-600">{log.user}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        log.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. VIDEO DOCUMENTATION & TRAINING MEDIA HUB */}
      {/* ========================================================= */}
      {activeSection === 'videos' && (
        <div className="space-y-5">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <span className="text-xs font-bold text-slate-700 mr-2">Knowledge Category:</span>
            {['ALL', 'User Training', 'Vendor Onboarding', 'Plant Audit Video Tours', 'Quality & Regulatory Guidelines'].map(cat => (
              <button
                key={cat}
                onClick={() => setVideoCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  videoCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat === 'ALL' ? 'All Videos' : cat}
              </button>
            ))}
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVideos.map(video => (
              <div
                key={video.id}
                onClick={() => setActiveVideoModal(video)}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Video Thumbnail Placeholder / Card Preview */}
                  <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-40 bg-gradient-to-tr from-slate-950 via-slate-800 to-indigo-950"></div>
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg z-10">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] z-10">
                      {video.duration}
                    </span>
                    {video.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-500 text-white font-mono font-bold text-[9px] uppercase tracking-wider z-10">
                        {video.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-mono text-indigo-600 font-semibold uppercase tracking-wider block">
                      {video.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 leading-snug line-clamp-2">
                      {video.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 text-[10px] text-slate-400 font-mono border-t border-slate-50 flex items-center justify-between">
                  <span>Instructor: {video.instructor.split(',')[0]}</span>
                  <span className="text-indigo-600 font-semibold group-hover:underline">Play Video &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {activeVideoModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveVideoModal(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase">{activeVideoModal.category}</span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{activeVideoModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center">
              <iframe
                src={`${activeVideoModal.url}?autoplay=1`}
                title={activeVideoModal.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-4 text-xs text-slate-600 space-y-1">
              <p>{activeVideoModal.description}</p>
              <div className="text-[10px] text-slate-400 font-mono pt-1">
                Duration: {activeVideoModal.duration} · Instructor: {activeVideoModal.instructor}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
