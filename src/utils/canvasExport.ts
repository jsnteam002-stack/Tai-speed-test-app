import html2canvas from 'html2canvas';

export async function downloadResultCardAsPng(elementId: string, filename: string = 'TSI-SpeedTest-Result.png'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Result card element not found for download');
  }

  const canvas = await html2canvas(element, {
    backgroundColor: '#070b14',
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
