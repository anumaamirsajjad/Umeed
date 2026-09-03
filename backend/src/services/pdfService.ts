import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { SafetyPlan } from '../types/index.js';

const PAGE_MARGIN = 50;
const PAGE_SIZE: [number, number] = [612, 792]; // US Letter

function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateSafetyPlanPDF(plan: SafetyPlan): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage(PAGE_SIZE);
  const contentWidth = PAGE_SIZE[0] - PAGE_MARGIN * 2;
  let yPos = PAGE_SIZE[1] - PAGE_MARGIN;

  const ensureSpace = (needed: number) => {
    if (yPos - needed < PAGE_MARGIN + 40) {
      page = pdfDoc.addPage(PAGE_SIZE);
      yPos = PAGE_SIZE[1] - PAGE_MARGIN;
    }
  };

  // Brand palette (see frontend/tailwind.config.js): primary-900 for headings,
  // accent-700 for the trusted-contacts heading, ink-light for body text.
  const primary900 = rgb(0.427, 0.29, 0.212); // #6d4a36
  const ink = rgb(0.227, 0.188, 0.157); // ink-light #3a3128
  const muted = rgb(0.5, 0.44, 0.38);

  const drawHeading = (text: string) => {
    ensureSpace(30);
    page.drawText(text, { x: PAGE_MARGIN, y: yPos, size: 16, font: boldFont, color: primary900 });
    yPos -= 26;
  };

  const drawBullets = (items: string[], emptyLabel: string) => {
    if (items.length === 0) {
      ensureSpace(18);
      page.drawText(emptyLabel, { x: PAGE_MARGIN + 15, y: yPos, size: 11, font, color: muted });
      yPos -= 22;
      return;
    }
    for (const item of items) {
      const lines = wrapText(`•  ${item}`, font, 11, contentWidth - 15);
      for (const line of lines) {
        ensureSpace(18);
        page.drawText(line, { x: PAGE_MARGIN + 15, y: yPos, size: 11, font, color: ink });
        yPos -= 18;
      }
    }
    yPos -= 8;
  };

  // Title
  page.drawText('My Personal Safety Plan', {
    x: PAGE_MARGIN,
    y: yPos,
    size: 24,
    font: boldFont,
    color: primary900,
  });
  yPos -= 40;

  drawHeading('Warning Signs');
  drawBullets(plan.warningSigns, 'No warning signs added yet.');

  drawHeading('Coping Strategies');
  drawBullets(plan.copingStrategies, 'No coping strategies added yet.');

  drawHeading('Trusted Contacts');
  if (plan.trustedContacts.length === 0) {
    ensureSpace(18);
    page.drawText('No trusted contacts added yet.', {
      x: PAGE_MARGIN + 15,
      y: yPos,
      size: 11,
      font,
      color: muted,
    });
    yPos -= 22;
  } else {
    for (const contact of plan.trustedContacts) {
      ensureSpace(18);
      const details = [contact.relationship, contact.phone, contact.email].filter(Boolean).join(' · ');
      page.drawText(`•  ${contact.name}${details ? ` (${details})` : ''}`, {
        x: PAGE_MARGIN + 15,
        y: yPos,
        size: 11,
        font,
        color: ink,
      });
      yPos -= 18;
    }
    yPos -= 8;
  }

  drawHeading('Reasons to Stay Safe');
  drawBullets(plan.reasonsToStaySafe, 'No reasons added yet.');

  drawHeading('Making Space Safer');
  drawBullets(plan.environmentSafetySteps, 'Nothing added yet.');

  // Crisis footer on the final page
  ensureSpace(60);
  yPos -= 10;
  page.drawLine({
    start: { x: PAGE_MARGIN, y: yPos },
    end: { x: PAGE_SIZE[0] - PAGE_MARGIN, y: yPos },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });
  yPos -= 20;
  const crisisFooterLines = wrapText(
    'In crisis? Call Rozan Helpline at 0304-111-1741 — confidential counseling & crisis intervention, available 24/7.',
    boldFont,
    11,
    contentWidth
  );
  for (const line of crisisFooterLines) {
    ensureSpace(18);
    page.drawText(line, { x: PAGE_MARGIN, y: yPos, size: 11, font: boldFont, color: rgb(0.7, 0.1, 0.1) });
    yPos -= 16;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export default { generateSafetyPlanPDF };
