const PptxGenJS = require('pptxgenjs');

async function testPptx(content, title) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = title || 'Plan';
  
  const slide1 = pptx.addSlide();
  slide1.background = { color: '1E1B4B' };
  slide1.addText(title || 'Test', { x: 0.5, y: 1.6, w: 8.5, h: 2, fontSize: 36, color: 'FFFFFF', bold: true });

  const lines = content.split('\n');
  let slideTitle = 'Overview';
  let textBlocks = [];
  let slideIndex = 1;

  function flushSlide(heading, textArr) {
    if (textArr.length === 0) return;
    const slide = pptx.addSlide();
    slide.background = { color: 'F8FAFC' };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: '6366F1' } });
    slide.addText(heading.replace(/\*\*/g, ''), { x: 0.4, y: 0.15, w: 9.2, h: 0.6, fontSize: 18, color: 'FFFFFF', bold: true });

    const bulletItems = textArr.filter(l => l.trim()).map(l => l.replace(/^[-*]\s+/, '• ').replace(/\*\*/g, '')).filter(l => l.trim());
    const chunks = [];
    let current = '';
    for (const item of bulletItems) {
      if (current.length + item.length > 700) { chunks.push(current); current = item + '\n'; }
      else current += item + '\n';
    }
    if (current) chunks.push(current);
    const visibleChunks = chunks.slice(0, 2);
    slide.addText(visibleChunks.join('\n'), { x: 0.5, y: 1.1, w: 9, h: 4, fontSize: 13, color: '1E1B4B', valign: 'top' });
    slideIndex++;
  }

  for (const line of lines) {
    const hMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      if (textBlocks.length > 0) flushSlide(slideTitle, textBlocks);
      textBlocks = [];
      const lvl = hMatch[1].length;
      const heading = hMatch[2].trim();
      if (lvl <= 2) slideTitle = heading;
      else textBlocks.push(heading);
    } else if (line.startsWith('|')) {
      textBlocks.push(line);
    } else if (line.trim()) {
      textBlocks.push(line);
    } else if (textBlocks.length > 2) {
      flushSlide(slideTitle, textBlocks);
      textBlocks = [];
    }
  }
  if (textBlocks.length > 0) flushSlide(slideTitle, textBlocks);

  const blob = await pptx.write();
  const ab = await blob.arrayBuffer();
  console.log(`[${title}] -> ${new Uint8Array(ab).length} bytes, ${slideIndex} slides`);
}

async function main() {
  // Test 1: Well-formatted markdown
  await testPptx(`# Year 4 Science Lesson
**Year Level:** Year 4
**Subject:** Science

## Overview
- Introduction to energy transfers
- Students will explore different forms

## WALT
Understand how energy moves between objects

## Materials
- Balls
- Ramps
- Thermometers
`, 'Formatted Lesson');

  // Test 2: Plain text (AI often returns this)
  await testPptx(`Here is a Year 4 Science lesson plan on Energy Transfers:

The students will learn about how energy moves from one object to another. We start with a warm-up discussion about different types of energy they encounter daily.

Then we move to a hands-on investigation where students roll a ball down a ramp and observe what happens.

Finally, we discuss the key vocabulary and students complete an exit ticket.
`, 'Plain Text (No Headers)');

  // Test 3: Partial markdown
  await testPptx(`Year 4 Science — Energy Transfers

## WALT
Understand how energy moves between objects

## Main Activities
- Warm-up: brainstorm energy types
- Investigation: ball and ramp experiment
- Discussion: key vocabulary
- Exit ticket: 3-2-1 reflection
`, 'Partial Markdown');

  console.log('\nAll tests passed!');
}

main().catch(e => console.error('Error:', e.message));
