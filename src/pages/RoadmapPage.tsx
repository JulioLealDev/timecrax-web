import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./RoadmapPage.css";

type HoverArea = "blacksmith" | "laboratory" | "castle" | "university" | null;

export function RoadmapPage() {
  const { t } = useTranslation();
  const [activeArea, setActiveArea] = useState<HoverArea>(null);

  return (
    <div className="roadmap-page">
      <h1 className="roadmap-title">{t("roadmap.title")}</h1>
      <div className="roadmap-container">
        {/* Base layers - always visible */}
        <img
          src="/images/RoadmapBackground.png"
          alt="Roadmap Background"
          className="roadmap-layer"
        />
        <img
          src="/images/RoadmapPath.png"
          alt="Roadmap Path"
          className="roadmap-layer"
        />
        <img
          src="/images/RoadmapPathDone.png"
          alt="Roadmap Path Done"
          className="roadmap-layer roadmap-path-done"
        />

        {/* Interactive layers - visible on hover */}
        <img
          src="/images/RoadmapBlacksmith.png"
          alt="Blacksmith"
          className={`roadmap-layer roadmap-interactive ${activeArea === "blacksmith" ? "active" : ""}`}
        />
        <img
          src="/images/RoadmapLaboratory.png"
          alt="Laboratory"
          className={`roadmap-layer roadmap-interactive ${activeArea === "laboratory" ? "active" : ""}`}
        />
        <img
          src="/images/RoadmapCastle.png"
          alt="Castle"
          className={`roadmap-layer roadmap-interactive ${activeArea === "castle" ? "active" : ""}`}
        />
        <img
          src="/images/RoadmapUniversity.png"
          alt="University"
          className={`roadmap-layer roadmap-interactive ${activeArea === "university" ? "active" : ""}`}
        />

        {/* Frame - top layer */}
        <img
          src="/images/RoadmapFrame.png"
          alt="Frame"
          className="roadmap-layer"
        />

        {/* Info Cards */}
        <div className={`roadmap-card ${activeArea === "blacksmith" ? "active" : ""}`}>
          <div className="roadmap-card-header">
            <h3 className="roadmap-card-title">{t("roadmap.blacksmith.title")}</h3>
            <span className="roadmap-card-date">{t("roadmap.blacksmith.date")}</span>
          </div>
          <p className="roadmap-card-description">{t("roadmap.blacksmith.description")}</p>
        </div>

        <div className={`roadmap-card ${activeArea === "laboratory" ? "active" : ""}`}>
          <div className="roadmap-card-header">
            <h3 className="roadmap-card-title">{t("roadmap.laboratory.title")}</h3>
            <span className="roadmap-card-date">{t("roadmap.laboratory.date")}</span>
          </div>
          <p className="roadmap-card-description">{t("roadmap.laboratory.description")}</p>
        </div>

        <div className={`roadmap-card ${activeArea === "castle" ? "active" : ""}`}>
          <div className="roadmap-card-header">
            <h3 className="roadmap-card-title">{t("roadmap.castle.title")}</h3>
            <span className="roadmap-card-date">{t("roadmap.castle.date")}</span>
          </div>
          <p className="roadmap-card-description">{t("roadmap.castle.description")}</p>
        </div>

        <div className={`roadmap-card ${activeArea === "university" ? "active" : ""}`}>
          <div className="roadmap-card-header">
            <h3 className="roadmap-card-title">{t("roadmap.university.title")}</h3>
            <span className="roadmap-card-date">{t("roadmap.university.date")}</span>
          </div>
          <p className="roadmap-card-description">{t("roadmap.university.description")}</p>
        </div>

        {/* Hover areas */}
        <div
          className="roadmap-hover-area blacksmith-area"
          onMouseEnter={() => setActiveArea("blacksmith")}
          onMouseLeave={() => setActiveArea(null)}
        />
        <div
          className="roadmap-hover-area laboratory-area"
          onMouseEnter={() => setActiveArea("laboratory")}
          onMouseLeave={() => setActiveArea(null)}
        />
        <div
          className="roadmap-hover-area castle-area"
          onMouseEnter={() => setActiveArea("castle")}
          onMouseLeave={() => setActiveArea(null)}
        />
        <div
          className="roadmap-hover-area university-area"
          onMouseEnter={() => setActiveArea("university")}
          onMouseLeave={() => setActiveArea(null)}
        />
      </div>

      <h2 className="roadmap-schedule-title">{t("roadmap.schedule")}</h2>

      <div className="schedule-matrix">
        {/* Header Row */}
        <div className="schedule-header-row">
          <div className="schedule-corner">{t("roadmap.header.phases")}</div>
          <div className="schedule-header-cell header-description">{t("roadmap.header.description")}</div>
          <div className="schedule-header-cell">4º 2024</div>
          <div className="schedule-header-cell">1º 2025</div>
          <div className="schedule-header-cell">2º 2025</div>
          <div className="schedule-header-cell">3º 2025</div>
          <div className="schedule-header-cell">4º 2025</div>
          <div className="schedule-header-cell">1º 2026</div>
          <div className="schedule-header-cell">2º 2026</div>
          <div className="schedule-header-cell">3º 2026</div>
          <div className="schedule-header-cell">4º 2026</div>
          <div className="schedule-header-cell">1º 2027</div>
          <div className="schedule-header-cell">2º 2027</div>
          <div className="schedule-header-cell">3º 2027</div>
          <div className="schedule-header-cell">4º 2027</div>
          <div className="schedule-header-cell">1º 2028</div>
          <div className="schedule-header-cell">2º 2028</div>
          <div className="schedule-header-cell">3º 2028</div>
          <div className="schedule-header-cell header-risks">{t("roadmap.header.risks")}</div>
        </div>

        {/* Body: Phase Column + Data Grid + Risks Column */}
        <div className="schedule-body">
          {/* Phase Headers Column */}
          <div className="schedule-phase-column">
            <div className="schedule-phase phase-1">
              {t("roadmap.phases.phase1")}
            </div>
            <div className="schedule-phase phase-2">
              {t("roadmap.phases.phase2")}
            </div>
            <div className="schedule-phase phase-3">
              {t("roadmap.phases.phase3")}
            </div>
            <div className="schedule-phase phase-4">
              {t("roadmap.phases.phase4")}
            </div>
          </div>

          {/* Data Grid: 20 rows x 17 columns */}
          <div className="schedule-data">
            {Array.from({ length: 20 }, (_, rowIndex) => {
              const phaseNum = Math.floor(rowIndex / 5) + 1;
              const shadeNum = (rowIndex % 5) + 1;

              // Map of active quarters per row (0-indexed columns)
              // Columns: 0=4º2024, 1=1º2025, 2=2º2025, 3=3º2025, 4=4º2025, etc.
              const activeQuarters: Record<number, number[]> = {
                0: [0, 1],          // Row 1: 4º 2024, 1º 2025
                1: [0, 1],          // Row 2: 4º 2024, 1º 2025
                2: [2, 3],          // Row 3: 2º 2025, 3º 2025
                3: [2, 3],          // Row 4: 2º 2025, 3º 2025
                4: [3],             // Row 5: 3º 2025
                5: [3, 4],          // Row 6: 3º 2025, 4º 2025
                6: [4, 5, 6, 7],    // Row 7: 4º 2025, 1º 2026, 2º 2026, 3º 2026
                7: [4, 5, 6, 7],    // Row 8: 4º 2025, 1º 2026, 2º 2026, 3º 2026
                8: [7, 8],          // Row 9: 3º 2026, 4º 2026
                9: [7, 8],          // Row 10: 3º 2026, 4º 2026
                10: [7],            // Row 11: 3º 2026
                11: [7, 8],         // Row 12: 3º 2026, 4º 2026
                12: [8, 9],         // Row 13: 4º 2026, 1º 2027
                13: [9, 10],        // Row 14: 1º 2027, 2º 2027
                14: [10, 11],       // Row 15: 2º 2027, 3º 2027
                15: [11, 12],       // Row 16: 3º 2027, 4º 2027
                16: [12, 13, 14],   // Row 17: 4º 2027, 1º 2028, 2º 2028
                17: [13, 14, 15],   // Row 18: 1º 2028, 2º 2028, 3º 2028
                18: [14, 15],       // Row 19: 2º 2028, 3º 2028
                19: [14, 15],       // Row 20: 2º 2028, 3º 2028
              };

              const activeColsForRow = activeQuarters[rowIndex] || [];

              return (
                <div key={rowIndex} className={`schedule-row phase-${phaseNum}-row shade-${shadeNum}`}>
                  <div className="schedule-cell schedule-activity">
                    {t(`roadmap.activities.activity${rowIndex + 1}`)}
                  </div>
                  {Array.from({ length: 16 }, (_, colIndex) => (
                    <div
                      key={colIndex}
                      className={`schedule-cell${activeColsForRow.includes(colIndex) ? ' quarter-active' : ''}`}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          {/* Risks Column - 2 cells per phase (2.5 rows each) */}
          <div className="schedule-risks-column">
            {[1, 2, 3, 4].map((phaseNum) => (
              <div key={phaseNum} className={`schedule-risks-phase phase-${phaseNum}-risks`}>
                <div className="schedule-risks-cell">
                  <span className="risk-label">{t(`roadmap.risks.phase${phaseNum}.risk1.title`)}</span>
                  <span className="risk-text">{t(`roadmap.risks.phase${phaseNum}.risk1.mitigation`)}</span>
                </div>
                <div className="schedule-risks-cell">
                  <span className="risk-label">{t(`roadmap.risks.phase${phaseNum}.risk2.title`)}</span>
                  <span className="risk-text">{t(`roadmap.risks.phase${phaseNum}.risk2.mitigation`)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
