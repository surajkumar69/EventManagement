import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { QrCode, ShieldAlert, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const ScanGate = () => {
  const { addToast } = useToast();
  const [scanning, setScanning] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Initialize html5-qrcode scanner
    const scanner = new Html5QrcodeScanner(
      'qr-reader-gate',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [0] // 0 means Monitor camera only
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error('Failed to clear scanner:', err));
      }
    };
  }, []);

  const onScanSuccess = async (decodedText) => {
    // Stop scanning once we get a result
    if (checkingIn || scanResult) return;

    setCheckingIn(true);
    setScanning(false);
    
    try {
      // Hit check-in API
      const { data } = await api.post('/bookings/check-in', {
        qrCodeData: decodedText,
      });

      setScanResult(data);
      setScanError(null);
      addToast(`Checked in: ${data.attendeeName}!`, 'success');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Invalid ticket code';
      setScanError(errMsg);
      setScanResult(null);
      addToast(errMsg, 'error');
    } finally {
      setCheckingIn(false);
    }
  };

  const onScanFailure = (error) => {
    // We ignore normal scan failures (unrecognized frames) to avoid terminal spam
  };

  const handleResetScanner = () => {
    setScanResult(null);
    setScanError(null);
    setScanning(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight font-heading">QR Gate Check-in</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Scan visitor tickets QR codes to record platform attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scanner Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          
          {scanning ? (
            <div className="w-full max-w-[450px] space-y-4">
              <div id="qr-reader-gate" className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold text-xs"></div>
              <p className="text-center text-xs text-gray-400 font-semibold tracking-wider">
                Align the visitor ticket QR code inside the bounding box
              </p>
            </div>
          ) : (
            // Results Display panel
            <div className="w-full max-w-md text-center py-8 space-y-6">
              {checkingIn && (
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                  <p className="text-sm font-semibold text-gray-500">Checking Ticket Authenticity...</p>
                </div>
              )}

              {scanResult && (
                <div className="space-y-4 animate-fade-in">
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-950/20 text-green-500 border border-green-100 dark:border-green-900/30 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle className="w-9 h-9" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-800 dark:text-gray-100 m-0">
                      {scanResult.message}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{scanResult.eventTitle}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 text-left text-xs font-semibold text-gray-500 space-y-2.5">
                    <div className="flex justify-between">
                      <span>Attendee:</span>
                      <strong className="text-gray-800 dark:text-gray-250">{scanResult.attendeeName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <strong className="text-gray-800 dark:text-gray-250 truncate max-w-[180px]">{scanResult.attendeeEmail}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Tickets count:</span>
                      <strong className="text-gray-800 dark:text-gray-250">{scanResult.ticketsBooked} Ticket(s)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Check-in Date:</span>
                      <strong className="text-gray-850 dark:text-gray-200">
                        {new Date(scanResult.checkedInAt).toLocaleTimeString()}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {scanError && (
                <div className="space-y-4 animate-fade-in">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/30 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <XCircle className="w-9 h-9" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-800 dark:text-gray-150 m-0">Verification Failed</h3>
                    <p className="text-sm font-semibold text-red-500 mt-1.5">{scanError}</p>
                  </div>
                </div>
              )}

              {!checkingIn && (
                <button
                  onClick={handleResetScanner}
                  className="mx-auto flex items-center gap-2 py-2.5 px-6 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-sm text-sm cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Scan Next Ticket</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Informative Side Rules Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-250 m-0 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-indigo-500" />
              <span>Checking Guidelines</span>
            </h3>
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-3 pl-4 list-disc font-medium leading-relaxed">
              <li>Admins or event organizers must grant browser webcam permissions.</li>
              <li>Hold tickets stable in front of the camera window.</li>
              <li>Checked-in records are updated instantly in the centralized database.</li>
              <li>Duplicate scans will return check-in warning logs with original timestamps.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanGate;
