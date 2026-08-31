import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTournament } from '../../data/TournamentContext';
import { TournamentRuleItem, Prize, SupplementaryRegulation } from '../../types/tournament';
import { DEFAULT_SUPPLEMENTARY_REGULATIONS } from '../../data/tournamentData';
import {
  BookOpen,
  Save,
  CheckCircle2,
  Plus,
  Trophy,
  Award,
  AlertTriangle,
  Sparkles,
  Eye,
  Edit3,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Indent,
  CornerDownLeft,
  Undo,
  Redo,
  Smile,
  Search,
  X,
  Flame,
  Activity,
  Heart,
  Clock,
  Trash2,
} from 'lucide-react';
import { FormattedText } from '../RulesSection';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Categorized Emoji data for the Windows-style picker
const EMOJI_CATEGORIES = [
  {
    id: 'sports',
    label: 'Cầu lông & Thể thao',
    icon: '🏸',
    emojis: [
      '🏸', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '👟', '🏟️', '🎾', '🎯', '🔥', '⚡', '💥', '✨', '🌟', '⭐', '💪', '👑', '🚩', '🏁', '🎪', '🎉', '🎊', '🎈', '🍾'
    ]
  },
  {
    id: 'status',
    label: 'Ký hiệu & Trạng thái',
    icon: '✅',
    emojis: [
      '✅', '☑️', '✔️', '❌', '❎', '🚫', '⚠️', '❗', '❓', '❕', '❔', '📌', '📍', '💡', '📢', '🔔', '🔕', '⏳', '⏰', '⏱️', '🗓️', '📅', '📝', '📋', '📁', '🔒', '🔑', '🔴', '🟢', '🔵', '🟡', '🟠', '🟣', '⚫', '⚪', '🟩', '🟦', '🟨', '🟥'
    ]
  },
  {
    id: 'arrows',
    label: 'Số & Mũi tên',
    icon: '👉',
    emojis: [
      '👉', '👈', '👆', '👇', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↔️', '↕️', '🔄', '🔁', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '➕', '➖', '✖️', '➗', '▶️', '⏸️', '⏹️'
    ]
  },
  {
    id: 'smileys',
    label: 'Cảm xúc & Bàn tay',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😋', '😜', '🤪', '😎', '🥳', '😏', '🧐', '🤓', '🥺', '😤', '😱', '👍', '👎', '👏', '🙌', '👐', '🤝', '👊', '✌️', '🤞', '🤟', '🤘', '🤙', '👋', '🙏', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💖', '💯'
    ]
  }
];

interface FormatEditorProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  compact?: boolean;
  disabled?: boolean;
}

const FormatEditor: React.FC<FormatEditorProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Nhập nội dung quy định...',
  compact = false,
  disabled = false,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('sports');
  const [recentEmojis, setRecentEmojis] = useState<string[]>(['🏸', '🏆', '✅', '❌', '⚠️', '📌', '👉', '🔥']);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Convert plain text or legacy formatting to HTML if needed
  const getInitialContent = useCallback((val: string) => {
    if (!val) return '<p></p>';
    if (/<[a-z][\s\S]*>/i.test(val)) {
      return val;
    }
    // Convert newlines to paragraphs
    const paragraphs = val
      .split('\n')
      .map(line => {
        let l = line.trim();
        if (!l) return '<p></p>';
        l = l.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        l = l.replace(/\*(.*?)\*/g, '<em>$1</em>');
        if (l.startsWith('[v] ')) {
          l = `✅ <strong>${l.substring(4)}</strong>`;
        }
        return `<p>${l}</p>`;
      })
      .join('');
    return paragraphs || '<p></p>';
  }, []);

  const editor = useEditor({
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: getInitialContent(value),
    onUpdate: ({ editor }) => {
      if (disabled) return;
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          'px-3 py-2.5 min-h-[90px] focus:outline-none text-xs text-slate-700 font-normal leading-relaxed font-sans prose-sm max-w-none [&_p]:my-1 [&_p]:font-normal [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-slate-900 [&_strong]:font-bold',
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  // Keep editor content in sync when value changes externally
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentHTML = editor.getHTML();
      if (value !== currentHTML && !(value === '' && currentHTML === '<p></p>')) {
        editor.commands.setContent(getInitialContent(value));
      }
    }
  }, [value, editor, getInitialContent]);

  const insertSymbol = (text: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(text).run();
  };

  const handleSelectEmoji = (emoji: string) => {
    insertSymbol(emoji + ' ');
    // Update recent emojis
    setRecentEmojis(prev => {
      const filtered = prev.filter(e => e !== emoji);
      return [emoji, ...filtered].slice(0, 14);
    });
  };

  // Filter emojis based on search
  const allEmojis = EMOJI_CATEGORIES.flatMap(c => c.emojis);
  const filteredEmojis = emojiSearch.trim()
    ? allEmojis.filter(emoji => emoji.includes(emojiSearch.trim()))
    : [];

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold uppercase text-slate-500">
            {label}
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              showPreview
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {showPreview ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showPreview ? 'Soạn thảo' : 'Xem trước'}</span>
          </button>
        </div>
      )}

      {!showPreview ? (
        <div className="rounded-lg border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-white shadow-2xs relative">
          {/* TipTap WYSIWYG Toolbar */}
          {!disabled && (
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 border-b border-slate-200 text-slate-700 flex-wrap select-none">
              {/* Bold */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                title="In đậm (Ctrl+B)"
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                  editor?.isActive('bold')
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white hover:bg-slate-200 text-slate-800 border-slate-200/80'
                }`}
              >
                <strong>B</strong>
              </button>

              {/* Italic */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                title="In nghiêng (Ctrl+I)"
                className={`px-1.5 py-0.5 rounded text-[11px] italic font-serif border transition-colors cursor-pointer ${
                  editor?.isActive('italic')
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white hover:bg-slate-200 text-slate-800 border-slate-200/80'
                }`}
              >
                <em>I</em>
              </button>

              {/* Underline */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                title="Gạch chân (Ctrl+U)"
                className={`px-1.5 py-0.5 rounded text-[11px] underline border transition-colors cursor-pointer ${
                  editor?.isActive('underline')
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white hover:bg-slate-200 text-slate-800 border-slate-200/80'
                }`}
              >
                <UnderlineIcon className="w-3 h-3" />
              </button>

              <div className="w-px h-3.5 bg-slate-300 mx-0.5" />

              {/* Bullet List */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                title="Danh sách chấm tròn"
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
                  editor?.isActive('bulletList')
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-200/80'
                }`}
              >
                <List className="w-3 h-3" />
                <span>• Chấm</span>
              </button>

              {/* Ordered List */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                title="Đánh số thứ tự"
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
                  editor?.isActive('orderedList')
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-200/80'
                }`}
              >
                <ListOrdered className="w-3 h-3" />
                <span>1) Số</span>
              </button>

              <div className="w-px h-3.5 bg-slate-300 mx-0.5" />

              {/* Blue Checkmark Token */}
              <button
                type="button"
                onClick={() => insertSymbol('✅ ')}
                title="Chèn biểu tượng tích tròn giải đấu"
                className="px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-[10px] font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Tích tròn</span>
              </button>

              {/* Indent / Non-breaking space */}
              <button
                type="button"
                onClick={() => insertSymbol('\u00A0\u00A0\u00A0\u00A0')}
                title="Thụt đầu dòng (4 khoảng cách)"
                className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 text-[10px] font-medium text-slate-700 border border-slate-200/80 shadow-2xs transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <Indent className="w-3 h-3" />
                <span>Thụt lề</span>
              </button>

              <div className="w-px h-3.5 bg-slate-300 mx-0.5" />

              {/* Windows-style Emoji & More Picker Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Bảng biểu tượng & Emoji (kiểu Windows Win+.)"
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                    showEmojiPicker
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                  }`}
                >
                  <Smile className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[10px] font-extrabold">Emoji</span>
                </button>

                {/* Windows 11 Style Floating Emoji Picker Dialog */}
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute left-0 top-full mt-1.5 z-50 w-[290px] sm:w-[320px] bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-700/80 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
                    style={{ backdropFilter: 'blur(16px)' }}
                  >
                    {/* Windows Emoji Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-200 flex items-center gap-1.5">
                          <Smile className="w-4 h-4 text-amber-400" />
                          Emoji & Biểu tượng
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(false)}
                        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={emojiSearch}
                        onChange={e => setEmojiSearch(e.target.value)}
                        placeholder="Tìm biểu tượng..."
                        className="w-full pl-8 pr-7 py-1.5 bg-slate-800/90 text-xs text-white rounded-lg border border-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      {emojiSearch && (
                        <button
                          type="button"
                          onClick={() => setEmojiSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Category Nav Tabs */}
                    {!emojiSearch && (
                      <div className="flex items-center gap-1 border-b border-slate-800 pb-1.5 overflow-x-auto no-scrollbar">
                        {EMOJI_CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                              activeCategory === cat.id
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            <span>{cat.icon}</span>
                            <span className="text-[10px]">{cat.label.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Emoji Grid Display Area */}
                    <div className="max-h-[190px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {emojiSearch.trim() ? (
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                            Kết quả tìm kiếm ({filteredEmojis.length})
                          </p>
                          {filteredEmojis.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-4">Không tìm thấy emoji phù hợp</p>
                          ) : (
                            <div className="grid grid-cols-7 gap-1">
                              {filteredEmojis.map((emoji, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSelectEmoji(emoji)}
                                  className="w-8 h-8 rounded-lg hover:bg-slate-700/80 active:scale-95 text-lg flex items-center justify-center transition-all cursor-pointer"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* Recent Emojis */}
                          {recentEmojis.length > 0 && (
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 text-slate-400" />
                                Gần đây
                              </p>
                              <div className="grid grid-cols-7 gap-1">
                                {recentEmojis.map((emoji, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectEmoji(emoji)}
                                    className="w-8 h-8 rounded-lg hover:bg-slate-700/80 active:scale-95 text-lg flex items-center justify-center transition-all cursor-pointer"
                                    title={emoji}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Active Category Emojis */}
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                              {EMOJI_CATEGORIES.find(c => c.id === activeCategory)?.label}
                            </p>
                            <div className="grid grid-cols-7 gap-1">
                              {EMOJI_CATEGORIES.find(c => c.id === activeCategory)?.emojis.map((emoji, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSelectEmoji(emoji)}
                                  className="w-8 h-8 rounded-lg hover:bg-slate-700/80 active:scale-95 text-lg flex items-center justify-center transition-all cursor-pointer"
                                  title={emoji}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-px h-3.5 bg-slate-300 mx-0.5" />

              {/* Undo / Redo */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
                title="Hoàn tác (Ctrl+Z)"
                className="p-1 rounded bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 border border-slate-200/80 cursor-pointer"
              >
                <Undo className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
                title="Làm lại (Ctrl+Y)"
                className="p-1 rounded bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 border border-slate-200/80 cursor-pointer"
              >
                <Redo className="w-3 h-3" />
              </button>

              {!label && (
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-1 cursor-pointer"
                  title="Xem trước"
                >
                  <Eye className="w-3 h-3" />
                  <span>Xem</span>
                </button>
              )}
            </div>
          )}

          <EditorContent editor={editor} />
        </div>
      ) : (
        <div className="p-3 bg-blue-50/40 rounded-lg border border-blue-200/80 min-h-[70px] text-xs text-slate-700 leading-relaxed space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
              <Eye className="w-3 h-3" /> Giao diện trang chủ sẽ hiển thị:
            </span>
            {!label && (
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200"
              >
                Đóng xem trước
              </button>
            )}
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
            <FormattedText text={value} />
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminRules: React.FC = () => {
  const { tournament, updateRules, updatePrizes, updateSupplementaryRegulations } = useTournament();

  const isEditable = tournament.status === 'UPCOMING';

  const [rules, setRules] = useState<TournamentRuleItem[]>(tournament.rules || []);
  const [prizes, setPrizes] = useState<Prize[]>(tournament.prizes || []);
  const [supplementaryRegulations, setSupplementaryRegulations] = useState<SupplementaryRegulation[]>(
    tournament.supplementaryRegulations && tournament.supplementaryRegulations.length > 0
      ? tournament.supplementaryRegulations
      : DEFAULT_SUPPLEMENTARY_REGULATIONS
  );
  const [isRulesSaved, setIsRulesSaved] = useState(false);
  const [isPrizesSaved, setIsPrizesSaved] = useState(false);
  const [isSuppSaved, setIsSuppSaved] = useState(false);

  useEffect(() => {
    if (tournament.rules) {
      setRules(tournament.rules);
    }
    if (tournament.prizes) {
      setPrizes(tournament.prizes);
    }
    if (tournament.supplementaryRegulations && tournament.supplementaryRegulations.length > 0) {
      setSupplementaryRegulations(tournament.supplementaryRegulations);
    }
  }, [tournament.rules, tournament.prizes, tournament.supplementaryRegulations]);

  const handleRuleChange = (index: number, field: keyof TournamentRuleItem, value: any) => {
    if (!isEditable) return;
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: value };
    setRules(updated);
  };

  const handleScoringRuleChange = (ruleIdx: number, itemIdx: number, value: string) => {
    if (!isEditable) return;
    const updated = [...rules];
    const scoringRules = [...updated[ruleIdx].scoringRules];
    scoringRules[itemIdx] = value;
    updated[ruleIdx] = { ...updated[ruleIdx], scoringRules };
    setRules(updated);
  };

  const handleAddScoringRule = (ruleIdx: number) => {
    if (!isEditable) return;
    const updated = [...rules];
    updated[ruleIdx] = {
      ...updated[ruleIdx],
      scoringRules: [...updated[ruleIdx].scoringRules, 'Quy định mới...'],
    };
    setRules(updated);
  };

  const handleRemoveScoringRule = (ruleIdx: number, itemIdx: number) => {
    if (!isEditable) return;
    const updated = [...rules];
    updated[ruleIdx] = {
      ...updated[ruleIdx],
      scoringRules: updated[ruleIdx].scoringRules.filter((_, i) => i !== itemIdx),
    };
    setRules(updated);
  };

  const handlePrizeAmountChange = (idx: number, rawValue: string) => {
    if (!isEditable) return;
    const parsed = Math.max(0, parseInt(rawValue, 10) || 0);
    const updated = [...prizes];
    updated[idx] = { ...updated[idx], amount: parsed };
    setPrizes(updated);
  };

  const handlePrizeTitleChange = (idx: number, title: string) => {
    if (!isEditable) return;
    const updated = [...prizes];
    updated[idx] = { ...updated[idx], title };
    setPrizes(updated);
  };

  const currentTotalPrize = prizes.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const handleSaveRules = () => {
    if (!isEditable) return;
    const cleanedRules: TournamentRuleItem[] = rules.map(r => ({
      stage: r.stage || '',
      formatDescription: r.formatDescription || '',
      scoringRules: [],
      advancement: '',
    }));
    setRules(cleanedRules);
    updateRules(cleanedRules);
    setIsRulesSaved(true);
    setTimeout(() => setIsRulesSaved(false), 3000);
  };

  const handleSavePrizes = () => {
    if (!isEditable) return;
    updatePrizes(prizes);
    setIsPrizesSaved(true);
    setTimeout(() => setIsPrizesSaved(false), 3000);
  };

  const handleSuppTitleChange = (regIndex: number, title: string) => {
    if (!isEditable) return;
    const updated = [...supplementaryRegulations];
    updated[regIndex] = { ...updated[regIndex], title };
    setSupplementaryRegulations(updated);
  };

  const handleSuppSubtitleChange = (regIndex: number, subtitle: string) => {
    if (!isEditable) return;
    const updated = [...supplementaryRegulations];
    updated[regIndex] = { ...updated[regIndex], subtitle };
    setSupplementaryRegulations(updated);
  };

  const handleSuppItemChange = (
    regIndex: number,
    itemIndex: number,
    field: 'title' | 'description' | 'label',
    val: string
  ) => {
    if (!isEditable) return;
    const updated = [...supplementaryRegulations];
    const items = [...updated[regIndex].items];
    items[itemIndex] = { ...items[itemIndex], [field]: val };
    updated[regIndex] = { ...updated[regIndex], items };
    setSupplementaryRegulations(updated);
  };

  const handleAddSuppItem = (regIndex: number) => {
    if (!isEditable) return;
    const updated = [...supplementaryRegulations];
    const isLet = updated[regIndex].id === 'let_rule' || regIndex === 0;
    const currentItems = updated[regIndex].items || [];
    const nextIdx = currentItems.length;
    const nextLabel = isLet ? `${nextIdx + 1}` : String.fromCharCode(65 + nextIdx);
    
    const newItem = {
      id: `supp-${Date.now()}-${nextIdx}`,
      label: nextLabel,
      title: '',
      description: ''
    };
    
    updated[regIndex] = { ...updated[regIndex], items: [...currentItems, newItem] };
    setSupplementaryRegulations(updated);
  };

  const handleDeleteSuppItem = (regIndex: number, itemIndex: number) => {
    if (!isEditable) return;
    const updated = [...supplementaryRegulations];
    const items = updated[regIndex].items.filter((_, idx) => idx !== itemIndex);
    updated[regIndex] = { ...updated[regIndex], items };
    setSupplementaryRegulations(updated);
  };

  const handleSuppNoteChange = (regIndex: number, field: 'noteTitle' | 'noteContent', val: string) => {
    if (!isEditable) return;
    const updated = [...supplementaryRegulations];
    updated[regIndex] = { ...updated[regIndex], [field]: val };
    setSupplementaryRegulations(updated);
  };

  const handleSaveSupplementary = () => {
    if (!isEditable) return;
    updateSupplementaryRegulations(supplementaryRegulations);
    setIsSuppSaved(true);
    setTimeout(() => setIsSuppSaved(false), 3000);
  };

  const handleResetSupplementary = () => {
    if (!isEditable) return;
    setSupplementaryRegulations(DEFAULT_SUPPLEMENTARY_REGULATIONS);
    updateSupplementaryRegulations(DEFAULT_SUPPLEMENTARY_REGULATIONS);
    setIsSuppSaved(true);
    setTimeout(() => setIsSuppSaved(false), 3000);
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 font-display flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Biên Soạn Điều Lệ &amp; Cơ Cấu Giải Thưởng
          </h2>
        </div>

        {!isEditable && (
          <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{tournament.status === 'COMPLETED' ? 'Hệ thống đã khóa (Đã bế mạc)' : 'Đã khóa chỉnh sửa điều lệ (Đang diễn ra)'}</span>
          </div>
        )}
      </div>

      {/* Rules Editor Cards */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            1. Quy Định Các Vòng Đấu (Vòng Bảng, Bán Kết, Chung Kết)
          </h3>

          <div className="flex items-center gap-2">
            {isRulesSaved && (
              <div className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã lưu điều lệ!</span>
              </div>
            )}
            {isEditable && (
              <button
                type="button"
                onClick={handleSaveRules}
                className="px-3 py-1 rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Thay Đổi (Phần 1)</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
          {rules.map((rule, ruleIdx) => (
            <div
              key={ruleIdx}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 sm:p-3.5 space-y-2.5 flex flex-col justify-start"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-black text-[10px] uppercase tracking-wider">
                    GIAI ĐOẠN 0{ruleIdx + 1}
                  </span>
                </div>

                {/* Stage Title */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Tên Vòng Đấu / Giai Đoạn
                  </label>
                  <input
                    type="text"
                    value={rule.stage}
                    onChange={e => handleRuleChange(ruleIdx, 'stage', e.target.value)}
                    disabled={!isEditable}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                    placeholder="VD: Vòng Bảng, Bán Kết, Chung Kết..."
                  />
                </div>

                {/* Single unified Rich Editor for the whole stage content */}
                <FormatEditor
                  label="Nội Dung Thể Thức & Quy Định"
                  value={rule.formatDescription}
                  onChange={val => handleRuleChange(ruleIdx, 'formatDescription', val)}
                  disabled={!isEditable}
                  placeholder="Nhập toàn bộ thể thức, quy định tính điểm, số set, emoji, thụt lề..."
                  rows={8}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prize Editor */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            2. Cơ Cấu Tiền Thưởng Giải Đấu (VNĐ)
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Tổng Quỹ: <strong className="text-amber-700 font-black">{currentTotalPrize.toLocaleString('vi-VN')} VNĐ</strong></span>
            </div>

            {isPrizesSaved && (
              <div className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1 animate-in fade-in shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã lưu giải thưởng!</span>
              </div>
            )}

            {isEditable && (
              <button
                type="button"
                onClick={handleSavePrizes}
                className="px-3 py-1 rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Thay Đổi (Phần 2)</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {prizes.map((pz, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 sm:p-3.5 space-y-2.5 flex flex-col justify-start"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-black text-[10px] uppercase tracking-wider">
                  {pz.titleEn} (HẠNG {pz.rank})
                </span>
                <span className="text-base">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️'}
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Tên Danh Hiệu
                </label>
                <input
                  type="text"
                  value={pz.title}
                  onChange={e => handlePrizeTitleChange(idx, e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  placeholder="VD: Vô Địch, Á Quân..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Tiền Thưởng (VNĐ)
                </label>
                <input
                  type="number"
                  step={50000}
                  min={0}
                  value={pz.amount === 0 ? '' : pz.amount}
                  placeholder="0"
                  onChange={e => handlePrizeAmountChange(idx, e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
                <div className="mt-1.5 px-2 py-1 bg-amber-50/60 rounded-md border border-amber-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">Quy đổi:</span>
                  <span className="text-xs font-bold text-amber-800">
                    {(pz.amount || 0).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Supplementary Regulations Editor */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            3. Quy Định Đánh Lại Điểm (Let) &amp; Xử Lý Bỏ Cuộc / Bỏ Giải (Walkover)
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {isSuppSaved && (
              <div className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1 animate-in fade-in shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã lưu quy định bổ sung!</span>
              </div>
            )}

            {isEditable && (
              <>
                <button
                  type="button"
                  onClick={handleResetSupplementary}
                  className="px-2.5 py-1 rounded-lg font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="Khôi phục về nội dung mặc định của BTC"
                >
                  Khôi Phục Mặc Định
                </button>

                <button
                  type="button"
                  onClick={handleSaveSupplementary}
                  className="px-3 py-1 rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Thay Đổi (Phần 3)</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {supplementaryRegulations.map((reg, regIdx) => {
            const isLet = reg.id === 'let_rule' || regIdx === 0;

            return (
              <div
                key={reg.id || regIdx}
                className={`bg-white rounded-xl border ${
                  isLet ? 'border-blue-200' : 'border-amber-200'
                } shadow-xs p-3 sm:p-3.5 space-y-3 flex flex-col justify-start`}
              >
                {/* Header of the Card */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{isLet ? '🔄' : '⚠️'}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider ${
                        isLet ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isLet ? 'QUY ĐỊNH ĐÁNH LẠI (LET)' : 'QUY ĐỊNH BỎ CUỘC (WALKOVER)'}
                    </span>
                  </div>
                </div>

                {/* Tiêu đề & Mô tả phụ của Thẻ */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Tiêu Đề Chính Của Thẻ
                    </label>
                    <input
                      type="text"
                      value={reg.title}
                      onChange={e => handleSuppTitleChange(regIdx, e.target.value)}
                      disabled={!isEditable}
                      className={`w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 ${
                        isLet ? 'focus:ring-blue-500' : 'focus:ring-amber-500'
                      } disabled:bg-slate-100 disabled:text-slate-500`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Mô Tả Phụ (Subtitle)
                    </label>
                    <input
                      type="text"
                      value={reg.subtitle}
                      onChange={e => handleSuppSubtitleChange(regIdx, e.target.value)}
                      disabled={!isEditable}
                      className={`w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 ${
                        isLet ? 'focus:ring-blue-500' : 'focus:ring-amber-500'
                      } disabled:bg-slate-100 disabled:text-slate-500`}
                    />
                  </div>
                </div>

                {/* Danh Sách Các Mục / Trường Hợp Chi Tiết */}
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Danh Sách Chi Tiết Các Trường Hợp ({reg.items.length} Mục)
                    </label>
                  </div>

                  {reg.items.length === 0 && (
                    <div className="p-3 text-center rounded-lg bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400">
                      Chưa có trường hợp nào. Nhấn "Thêm Trường Hợp" để thêm mới.
                    </div>
                  )}

                  {reg.items.map((item, itemIdx) => (
                    <div
                      key={item.id || itemIdx}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.label || (isLet ? `${itemIdx + 1}` : String.fromCharCode(65 + itemIdx))}
                          onChange={e => handleSuppItemChange(regIdx, itemIdx, 'label', e.target.value)}
                          disabled={!isEditable}
                          title="Ký hiệu thứ tự (1, 2... hoặc A, B...)"
                          className={`w-7 h-7 text-center rounded-md font-bold text-xs shrink-0 border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                            isLet ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
                          }`}
                        />
                        <input
                          type="text"
                          value={item.title}
                          onChange={e => handleSuppItemChange(regIdx, itemIdx, 'title', e.target.value)}
                          disabled={!isEditable}
                          placeholder="Tiêu đề trường hợp (VD: Ngoại cảnh can thiệp:)..."
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-slate-100"
                        />
                        {isEditable && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSuppItem(regIdx, itemIdx)}
                            title="Xóa trường hợp này"
                            className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <textarea
                        value={item.description}
                        onChange={e => handleSuppItemChange(regIdx, itemIdx, 'description', e.target.value)}
                        disabled={!isEditable}
                        rows={2}
                        placeholder="Nội dung giải thích chi tiết..."
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-slate-100 resize-y"
                      />
                    </div>
                  ))}

                  {reg.items.length > 0 && isEditable && (
                    <button
                      type="button"
                      onClick={() => handleAddSuppItem(regIdx)}
                      className={`w-full py-1.5 rounded-lg border border-dashed text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isLet
                          ? 'border-blue-300 text-blue-700 hover:bg-blue-50/70'
                          : 'border-amber-300 text-amber-800 hover:bg-amber-50/70'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm Trường Hợp Mới
                    </button>
                  )}
                </div>

                {/* Phần Lưu Ý / Quyết Định ở cuối Thẻ */}
                <div
                  className={`p-2.5 rounded-lg border ${
                    isLet ? 'bg-blue-50/70 border-blue-200' : 'bg-amber-50/70 border-amber-200'
                  } space-y-1.5`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={reg.noteTitle || ''}
                      onChange={e => handleSuppNoteChange(regIdx, 'noteTitle', e.target.value)}
                      disabled={!isEditable}
                      placeholder={isLet ? '📌 Lưu ý:' : '⚖️ Quyết định:'}
                      className="w-32 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-slate-100"
                    />
                    <span className="text-[10px] text-slate-500 font-medium">(Nhãn ghi chú)</span>
                  </div>
                  <textarea
                    value={reg.noteContent || ''}
                    onChange={e => handleSuppNoteChange(regIdx, 'noteContent', e.target.value)}
                    disabled={!isEditable}
                    rows={2}
                    placeholder="Nội dung lưu ý / quyết định..."
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-slate-100 resize-y"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
