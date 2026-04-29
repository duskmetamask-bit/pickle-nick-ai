"use client";
import { useState } from "react";

const SUBJECTS = [
  {
    id: "mathematics", label: "Mathematics", color: "#2563eb",
    strands: [
      {
        id: "number", label: "Number",
        content: {
          F: [
            { code: "AC9MFN01", desc: "Name, represent and order numbers including zero up to 20" },
            { code: "AC9MFN02", desc: "Partition and combine numbers up to 10" },
            { code: "AC9MFN03", desc: "Quantify and compare collections to at least 20" },
          ],
          "1": [
            { code: "AC9M1N01", desc: "Recognise, represent and order numbers to at least 120" },
            { code: "AC9M1N02", desc: "Partition two-digit numbers using place value" },
            { code: "AC9M1N03", desc: "Add and subtract numbers within 20" },
            { code: "AC9M1N04", desc: "Multiply and divide by 1, 2, 5 and 10" },
          ],
          "2": [
            { code: "AC9M2N01", desc: "Recognise, represent and order numbers to at least 1000" },
            { code: "AC9M2N02", desc: "Partition, rearrange and regroup two- and three-digit numbers" },
            { code: "AC9M2N03", desc: "Add and subtract numbers using efficient strategies" },
            { code: "AC9M2N04", desc: "Multiply and divide by 2, 3, 5 and 10" },
          ],
          "3": [
            { code: "AC9M3N01", desc: "Recognise, represent and order whole numbers to at least 10,000" },
            { code: "AC9M3N02", desc: "Add and subtract two- and three-digit numbers" },
            { code: "AC9M3N03", desc: "Multiply and divide by single-digit numbers" },
            { code: "AC9M3N04", desc: "Count by fractions and locate them on a number line" },
          ],
          "4": [
            { code: "AC9M4N01", desc: "Recognise and represent multiples and factors" },
            { code: "AC9M4N02", desc: "Develop efficient strategies for multiplication" },
            { code: "AC9M4N03", desc: "Multiply two- and three-digit numbers by single-digit numbers" },
            { code: "AC9M4N04", desc: "Divide by single-digit numbers, including remainders" },
          ],
          "5": [
            { code: "AC9M5N01", desc: "Interpret, compare and order numbers of any size" },
            { code: "AC9M5N02", desc: "Multiply and divide by 10, 100 and 1000" },
            { code: "AC9M5N03", desc: "Solve problems involving multiplication of large numbers" },
            { code: "AC9M5N04", desc: "Find the absolute value of integers" },
          ],
          "6": [
            { code: "AC9M6N01", desc: "Apply systematic enumeration strategies" },
            { code: "AC9M6N02", desc: "Multiply and divide fractions and decimals" },
            { code: "AC9M6N03", desc: "Solve problems with integers using all four operations" },
            { code: "AC9M6N04", desc: "Apply the order of operations" },
          ],
        }
      },
      {
        id: "algebra", label: "Algebra",
        content: {
          F: [
            { code: "AC9MFN01", desc: "Name, represent and order numbers including zero up to 20" },
          ],
          "1": [
            { code: "AC9M1A01", desc: "Recognise, continue and create pattern sequences" },
          ],
          "2": [
            { code: "AC9M2A01", desc: "Describe patterns with numbers and shapes" },
          ],
          "3": [
            { code: "AC9M3A01", desc: "Recognise equivalent fractions and locate them on a number line" },
          ],
          "4": [
            { code: "AC9M4A01", desc: "Find unknown values in number sentences involving addition and subtraction" },
          ],
          "5": [
            { code: "AC9M5A01", desc: "Use equivalence to find unknown values in number sentences" },
          ],
          "6": [
            { code: "AC9M6A01", desc: "Interpret and continue number sequences involving multiples" },
          ],
        }
      },
      {
        id: "measurement", label: "Measurement",
        content: {
          F: [
            { code: "AC9MFN01", desc: "Use direct and indirect comparisons to order length, mass and capacity" },
          ],
          "1": [
            { code: "AC9M1M01", desc: "Measure and compare non-standard lengths, masses and capacities" },
            { code: "AC9M1M02", desc: "Identify half and quarter measures on continuous quantities" },
          ],
          "2": [
            { code: "AC9M2M01", desc: "Measure using metric units: metres, centimetres, kilograms, grams, litres, millilitres" },
            { code: "AC9M2M02", desc: "Read and record time in hours, half-hours and quarter-hours" },
          ],
          "3": [
            { code: "AC9M3M01", desc: "Measure and compare objects using metric units: mass (kg, g), length (m, cm, mm), capacity (L, mL)" },
            { code: "AC9M3M02", desc: "Read and record time using analog and digital clocks" },
          ],
          "4": [
            { code: "AC9M4M01", desc: "Use scaled instruments to measure length, mass, capacity and temperature" },
            { code: "AC9M4M02", desc: "Compare 12- and 24-hour time systems" },
          ],
          "5": [
            { code: "AC9M5M01", desc: "Choose appropriate metric units and convert between them" },
            { code: "AC9M5M02", desc: "Solve problems involving the perimeter of quadrilaterals" },
          ],
          "6": [
            { code: "AC9M6M01", desc: "Convert between metric units including length, mass and capacity" },
            { code: "AC9M6M02", desc: "Solve problems involving the area of triangles and parallelograms" },
          ],
        }
      },
    ],
  },
  {
    id: "english", label: "English", color: "#7C3AED",
    strands: [
      {
        id: "literature", label: "Literature",
        content: {
          F: [
            { code: "AC9EFLA01", desc: "Recognise and appreciate how sounds and文字 connect" },
            { code: "AC9EFLE01", desc: "Respond to texts, sharing preferences and opinions" },
          ],
          "1": [
            { code: "AC9E1LA01", desc: "Understand how text structures create meaning" },
            { code: "AC9E1LE01", desc: "Discuss stories, informative texts and poems" },
          ],
          "2": [
            { code: "AC9E2LA01", desc: "Identify features of different text types" },
            { code: "AC9E2LE01", desc: "Identify the audience and purpose of texts" },
          ],
          "3": [
            { code: "AC9E3LA01", desc: "Understand how language choices affect meaning" },
            { code: "AC9E3LE01", desc: "Analyse texts to identify viewpoint and intended audience" },
          ],
          "4": [
            { code: "AC9E4LA01", desc: "Analyse how text structures support the purpose of a text" },
            { code: "AC9E4LE01", desc: "Make and justify interpretations of texts" },
          ],
          "5": [
            { code: "AC9E5LA01", desc: "Investigate how language features create layers of meaning" },
            { code: "AC9E5LE01", desc: "Analyse and evaluate text structures and language features" },
          ],
          "6": [
            { code: "AC9E6LA01", desc: "Analyse language features including vocabulary, syntax and grammar" },
            { code: "AC9E6LE01", desc: "Critically analyse how texts present perspectives and positions" },
          ],
        }
      },
      {
        id: "literacies", label: "Literacies",
        content: {
          F: [
            { code: "AC9EFLY01", desc: "Use comprehension strategies to understand texts" },
          ],
          "1": [
            { code: "AC9E1LY01", desc: "Read and view texts using combined knowledge of syllables, rhyme and letter patterns" },
          ],
          "2": [
            { code: "AC9E2LY01", desc: "Read and view texts using developing phonic, fluency and comprehension strategies" },
          ],
          "3": [
            { code: "AC9E3LY01", desc: "Use phonic, fluency and comprehension strategies to read texts" },
          ],
          "4": [
            { code: "AC9E4LY01", desc: "Read and view texts and compose written and multimodal texts" },
          ],
          "5": [
            { code: "AC9E5LY01", desc: "Navigate, read and view imaginative, informative and persuasive texts" },
          ],
          "6": [
            { code: "AC9E6LY01", desc: "Read, view and compose written, spoken and multimodal texts" },
          ],
        }
      },
    ],
  },
  {
    id: "science", label: "Science", color: "#16A34A",
    strands: [
      {
        id: "biological", label: "Biological Sciences",
        content: {
          F: [
            { code: "AC9SFU01", desc: "Identify and describe living things and non-living things" },
            { code: "AC9SFU02", desc: "Sort and describe living things based on features" },
          ],
          "1": [
            { code: "AC9S1U01", desc: "Describe the observable features of living things and their environments" },
            { code: "AC9S1U02", desc: "Describe how different places provide different habitats" },
          ],
          "2": [
            { code: "AC9S2U01", desc: "Describe how living things have observable features and grow" },
            { code: "AC9S2U02", desc: "Identify that living things live in different places within their environment" },
          ],
          "3": [
            { code: "AC9S3U01", desc: "Describe how living things meet their needs in their environment" },
            { code: "AC9S3U02", desc: "Investigate how environments change and this affects living things" },
          ],
          "4": [
            { code: "AC9S4U01", desc: "Examine how the structural and behavioural features of living things help them survive" },
          ],
          "5": [
            { code: "AC9S5U01", desc: "Investigate the life cycles of different living things" },
            { code: "AC9S5U02", desc: "Describe how food provides energy and nutrients for living things" },
          ],
          "6": [
            { code: "AC9S6U01", desc: "Analyse the adaptions of living things in relation to their environment" },
            { code: "AC9S6U02", desc: "Investigate how selective breeding changes living things" },
          ],
        }
      },
      {
        id: "chemical", label: "Chemical Sciences",
        content: {
          F: [
            { code: "AC9SFU03", desc: "Sort objects by their observable properties" },
          ],
          "1": [
            { code: "AC9S1U03", desc: "Identify different materials and describe their uses" },
          ],
          "2": [
            { code: "AC9S2U03", desc: "Describe how different materials can be combined" },
          ],
          "3": [
            { code: "AC9S3U03", desc: "Describe how heat can cause changes in materials" },
          ],
          "4": [
            { code: "AC9S4U03", desc: "Investigate how materials change when heated or cooled" },
          ],
          "5": [
            { code: "AC9S5U03", desc: "Investigate how different mixtures can be separated" },
          ],
          "6": [
            { code: "AC9S6U03", desc: "Analyse the effects of forces on the behaviour of objects" },
          ],
        }
      },
    ],
  },
  {
    id: "hass", label: "HASS", color: "#EA580C",
    strands: [
      {
        id: "history", label: "History",
        content: {
          F: [
            { code: "AC9HFU01", desc: "Explore how people describe their daily life experiences" },
          ],
          "1": [
            { code: "AC9H1U01", desc: "Describe events in their own life and in the lives of family members" },
          ],
          "2": [
            { code: "AC9H2U01", desc: "Describe significant events in the history of their community" },
          ],
          "3": [
            { code: "AC9H3U01", desc: "Describe people, events and changes in the local community over time" },
          ],
          "4": [
            { code: "AC9H4U01", desc: "Describe the significance of people and events in the development of Australia" },
          ],
          "5": [
            { code: "AC9H5U01", desc: "Analyse the causes and effects of European settlement on First Australians" },
          ],
          "6": [
            { code: "AC9H6U01", desc: "Analyse the development of Australian democracy and its impact on rights" },
          ],
        }
      },
      {
        id: "geography", label: "Geography",
        content: {
          F: [
            { code: "AC9GFU01", desc: "Identify and describe features of places they experience" },
          ],
          "1": [
            { code: "AC9G1U01", desc: "Describe the features of the places they live in and belong to" },
          ],
          "2": [
            { code: "AC9G2U01", desc: "Describe the natural features of places and how they change" },
          ],
          "3": [
            { code: "AC9G3U01", desc: "Identify and describe the native vegetation and climate of places" },
          ],
          "4": [
            { code: "AC9G4U01", desc: "Investigate how people manage and care for environments" },
          ],
          "5": [
            { code: "AC9G5U01", desc: "Analyse how the environment influences the way people live in different places" },
          ],
          "6": [
            { code: "AC9G6U01", desc: "Analyse how interconnections influence the characteristics of places" },
          ],
        }
      },
    ],
  },
  {
    id: "technologies", label: "Technologies", color: "#0891B2",
    strands: [
      {
        id: "digital", label: "Digital Technologies",
        content: {
          F: [
            { code: "AC9TDI01", desc: "Identify and explore digital systems and their purpose" },
          ],
          "1": [
            { code: "AC9TDI01", desc: "Recognise and explore digital systems for different purposes" },
          ],
          "2": [
            { code: "AC9TDI01", desc: "Collect and explore simple data from digital systems" },
          ],
          "3": [
            { code: "AC9TDI01", desc: "Identify and describe the components of digital systems" },
          ],
          "4": [
            { code: "AC9TDI01", desc: "Explain how digital systems represent data in ways that computers use" },
          ],
          "5": [
            { code: "AC9TDI01", desc: "Investigate how data is transmitted and secured in digital systems" },
          ],
          "6": [
            { code: "AC9TDI01", desc: "Analyse the components and structure of digital systems" },
          ],
        }
      },
    ],
  },
];

const YEAR_LEVELS = ["F", "1", "2", "3", "4", "5", "6"];

export default function CurriculumView() {
  const [selectedSubject, setSelectedSubject] = useState(0);
  const [selectedStrand, setSelectedStrand] = useState("");
  const subject = SUBJECTS[selectedSubject];

  const selectedStrandData = subject?.strands.find(s => s.id === selectedStrand);

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Curriculum Guide</h1>
        <p style={{ color: "var(--text2)", fontSize: 13 }}>Australian Curriculum v9 — content descriptors by subject, strand and year level</p>
      </div>

      {/* Subject tabs */}
      <div style={{ padding: "14px 28px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {SUBJECTS.map((s, i) => (
          <button key={s.id} onClick={() => { setSelectedSubject(i); setSelectedStrand(""); }}
            style={{ padding: "8px 16px", background: selectedSubject === i ? s.color : "var(--surface2)", color: selectedSubject === i ? "#fff" : "var(--text2)", border: "none", borderRadius: 20, fontSize: 13, fontWeight: selectedSubject === i ? 700 : 400, cursor: "pointer" }}>
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 130px)" }}>
        {/* Strand list */}
        <div style={{ borderRight: "1px solid var(--border)", padding: "16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Strands</div>
          {subject?.strands.map(strand => (
            <button key={strand.id} onClick={() => setSelectedStrand(selectedStrand === strand.id ? "" : strand.id)}
              style={{ width: "100%", padding: "9px 12px", background: selectedStrand === strand.id ? "rgba(99,102,241,0.15)" : "transparent", color: selectedStrand === strand.id ? "var(--primary)" : "var(--text2)", border: "none", borderRadius: 8, fontSize: 13, textAlign: "left", cursor: "pointer", marginBottom: 2 }}>
              {strand.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: "24px 28px", overflowY: "auto" }}>
          {selectedStrand && selectedStrandData?.content ? (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: subject?.color }}>{selectedStrandData.label}</h2>
              <p style={{ color: "var(--text2)", fontSize: 13, marginBottom: 20 }}>{subject?.label} — {selectedStrandData.label} content descriptors (AC9)</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {YEAR_LEVELS.map(yl => {
                  const items = selectedStrandData.content[yl as keyof typeof selectedStrandData.content] || [];
                  if (items.length === 0) return null;
                  return (
                    <div key={yl} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 14, padding: "1rem" }}>
                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, color: subject?.color, display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${subject?.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: subject?.color }}>{yl}</div>
                        Year {yl}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {items.map((item: { code: string; desc: string }) => {
                          const [copied, setCopied] = useState(false);
                          return (
                            <div key={item.code} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", position: "relative" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "var(--primary)" }}>{item.code}</div>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${item.code} — ${item.desc}`);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 1500);
                                  }}
                                  style={{ fontSize: 11, padding: "3px 8px", background: copied ? "var(--success-dim)" : "var(--surface2)", color: copied ? "var(--success)" : "var(--text3)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
                                >
                                  {copied ? "✓ Copied" : "Copy"}
                                </button>
                              </div>
                              <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{item.desc}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>Learn</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: subject?.color }}>{subject?.label}</h2>
              <p style={{ color: "var(--text2)", fontSize: 14 }}>Select a strand to view AC9 content descriptors</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
