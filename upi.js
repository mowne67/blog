const recipient = { id: 'mowne@axl', name: 'Mownetharan A K S' };

export function wireUpi() {
  const trigger = document.getElementById('upi-support');
  const dialog = document.getElementById('upi-dialog');
  if (!trigger || !dialog || !recipient.id || !recipient.name) return;

  const paymentUrl = `upi://pay?${new URLSearchParams({
    pa: recipient.id, pn: recipient.name, cu: 'INR', tn: 'Support Mowne',
  })}`;
  const id = document.getElementById('upi-id');
  const status = document.getElementById('upi-status');
  const qr = document.getElementById('upi-qr');
  id.textContent = recipient.id;
  document.getElementById('upi-recipient').textContent = recipient.name;
  document.getElementById('upi-pay').href = paymentUrl;
  trigger.hidden = false;

  let qrPromise;
  trigger.addEventListener('click', async () => {
    dialog.showModal();
    try {
      qrPromise ||= import('qrcode').then(({ default: QRCode }) =>
        QRCode.toDataURL(paymentUrl, { width: 240, margin: 4, errorCorrectionLevel: 'M' })
      );
      qr.src = await qrPromise;
      qr.hidden = false;
    } catch {
      qrPromise = undefined;
      status.textContent = 'QR code unavailable. Copy the UPI ID to pay.';
    }
  });
  document.getElementById('upi-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => { status.textContent = ''; });
  document.getElementById('upi-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(recipient.id);
      status.textContent = 'UPI ID copied.';
    } catch {
      const selection = getSelection();
      selection.removeAllRanges();
      const range = document.createRange();
      range.selectNodeContents(id);
      selection.addRange(range);
      status.textContent = 'Select and copy the UPI ID above.';
    }
  });
}
