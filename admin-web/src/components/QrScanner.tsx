import React, { useEffect, useRef, useState } from 'react';

interface QrScannerProps {
  onScan: (token: string) => void;
  disabled?: boolean;
}

export function QrScanner({ onScan, disabled }: QrScannerProps) {
  const scannerRef = useRef<InstanceType<
    typeof import('html5-qrcode').Html5QrcodeScanner
  > | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [scannerReady, setScannerReady] = useState(false);
  const containerId = 'qr-reader';

  useEffect(() => {
    let scanner: InstanceType<typeof import('html5-qrcode').Html5QrcodeScanner>;

    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      scanner = new Html5QrcodeScanner(
        containerId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false,
      );
      scanner.render(
        (decodedText: string) => {
          onScan(decodedText);
        },
        () => {
          // scan error - ignore
        },
      );
      scannerRef.current = scanner;
      setScannerReady(true);
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [onScan]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (manualToken.trim()) {
      onScan(manualToken.trim());
      setManualToken('');
    }
  }

  return (
    <div>
      <div id={containerId} style={{ width: '100%', maxWidth: 400 }} />
      {!scannerReady && <p>Initializing camera…</p>}

      <hr style={{ margin: '1.5rem 0' }} />
      <h4>Manual token entry</h4>
      <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <textarea
          value={manualToken}
          onChange={(e) => setManualToken(e.target.value)}
          placeholder="Paste QR token here…"
          rows={2}
          disabled={disabled}
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={disabled || !manualToken.trim()}>
          Submit
        </button>
      </form>
    </div>
  );
}
