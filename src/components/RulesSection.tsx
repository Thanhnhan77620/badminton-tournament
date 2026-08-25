import React from 'react';
import { TournamentRuleItem } from '../types/tournament';
import { FileText, CheckCircle2 } from 'lucide-react';

interface RulesSectionProps {
  rules: TournamentRuleItem[];
}

export const RulesSection: React.FC<RulesSectionProps> = ({ rules }) => {
  return (
    <section className="py-8 bg-slate-50/70 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Section Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Điều Lệ & Thể Thức Thi Đấu
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Quy định luật thi đấu, cách thức tính điểm và tiến trình giải ISC Badminton Open 2026
            </p>
          </div>
        </div>

        {/* Detailed Rules Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{rule.stage}</h3>
                </div>

                <p className="text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
                  {rule.formatDescription}
                </p>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Quy Định Tính Điểm & Set:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {rule.scoringRules.map((sc, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{sc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                <span className="font-bold text-slate-900 block mb-0.5">Tiến Trình:</span>
                <span className="text-emerald-700 font-semibold">{rule.advancement}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Supplementary Regulations: Quả Cầu Đánh Lại & Xử Lý Bỏ Cuộc / Bỏ Giải */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1: Các Trường Hợp Đánh Lại Điểm (Pha Cầu Hỏng / Let) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-blue-200/80 shadow-xs space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                <span className="text-sm font-black">🔄</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  Quy Định Đánh Lại Điểm (Quả Cầu Hỏng / "Let")
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Các trường hợp pha cầu bị hủy và tiến hành phát lại mà không tính điểm
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-slate-900 block">Ngoại cảnh can thiệp bất ngờ:</strong>
                  <span>Có cầu từ sân khác bay vào khu vực thi đấu, hoặc có người/vật cản đột ngột di chuyển vào sân làm ảnh hưởng trực tiếp đến pha cầu đang diễn ra.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-slate-900 block">Bên nhận chưa sẵn sàng:</strong>
                  <span>Bên phát cầu thực hiện giao cầu khi bên nhận chưa có tư thế sẵn sàng (với điều kiện bên nhận không có hành động cố gắng đỡ cầu).</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-slate-900 block">Cầu hỏng hoặc mắc kẹt trên lưới:</strong>
                  <span>Quả cầu bị gãy cánh lông/vỡ nát bất ngờ giữa pha đánh, hoặc cầu bị mắc lại trên đỉnh lưới (ngoại trừ trường hợp quả giao cầu chạm lưới).</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <strong className="text-slate-900 block">Tranh chấp không thể phân định:</strong>
                  <span>Trọng tài hoặc 2 đội không thể xác định chính xác cầu trong hay ngoài sân và không đạt được sự đồng thuận sau khi trao đổi nhanh.</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-[11px] text-blue-900 font-medium flex items-center gap-2">
              <span className="font-bold shrink-0">📌 Lưu ý:</span>
              <span>Khi có hiệu lệnh "Đánh lại", bên vừa phát cầu sẽ thực hiện lại quả giao cầu từ ô phát cầu tương ứng với điểm số hiện tại.</span>
            </div>
          </div>

          {/* Card 2: Quy Định Xử Lý Bỏ Cuộc / Bỏ Giải (Walkover & Forfeiture) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                <span className="text-sm font-black">⚠️</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  Quy Định Bỏ Cuộc / Bỏ Giải (Walkover - WO)
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Biện pháp xử lý điểm số và thứ hạng khi có cặp VĐV không thể hoàn thành giải đấu
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  A
                </span>
                <div>
                  <strong className="text-slate-900 block">Bỏ cuộc giữa trận (Dừng do chấn thương / sự cố):</strong>
                  <span>Cặp đấu dừng trận bị xử thua. Cặp đối thủ được tính thắng với điểm tối đa của trận (21 điểm hoặc đủ điểm thắng set), giữ nguyên điểm số hiện có của cặp bỏ cuộc để ghi nhận biên bản.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  B
                </span>
                <div>
                  <strong className="text-slate-900 block">Bỏ giải hoàn toàn ở Vòng Bảng:</strong>
                  <span>Nếu 1 cặp đôi rút lui hoàn toàn khỏi giải: BTC sẽ xử thua <strong>0 - 21 (Walkover)</strong> ở tất cả các trận chưa thi đấu của cặp đó. Các trận đã diễn ra trước đó vẫn được bảo lưu kết quả bảng điểm.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  C
                </span>
                <div>
                  <strong className="text-slate-900 block">Bỏ cuộc tại Vòng Bán Kết / Chung Kết:</strong>
                  <span>Cặp đối thủ trực tiếp được đặc cách thắng (Walkover) và vào thẳng vòng tiếp theo hoặc nhận hạng giải tương ứng (Quán Quân / Á Quân / Hạng Ba).</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  D
                </span>
                <div>
                  <strong className="text-slate-900 block">Quyền hạn cao nhất của Ban Tổ Chức (BTC):</strong>
                  <span>Trong các trường hợp phát sinh tranh chấp hoặc trường hợp bất khả kháng, quyết định của BTC là <strong>quyết định cuối cùng và có hiệu lực tuyệt đối</strong>.</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-900 font-medium flex items-center gap-2">
              <span className="font-bold shrink-0">⚖️ Quyết định:</span>
              <span>Mọi vận động viên tham gia cam kết tuân thủ tinh thần thể thao cao thượng, fair-play và tôn trọng quyết định điều hành giải đấu.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
