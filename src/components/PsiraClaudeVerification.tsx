// components/PsiraClaudeVerification.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, CheckCircle, XCircle, AlertTriangle, ExternalLink, Copy } from 'lucide-react';

const API_BASE_URL = 'https://localhost:44339/api';

interface ComplianceRecord {
  appNo: string;
  psiraNo: string;
  companyName: string;
  tradingAs: string;
  regStatus: string;
  regDate: string;
  regNo: string;
  isTrainingCenter: string;
  certificateStatus: string;
  certificateExpiryDate: string;
  trainingNumber: string;
}

interface ClaudeAnalysisResult {
  status: 'Compliant' | 'Non-Compliant';
  latestRecord: {
    certificateStatus: string;
    expiryDate: string;
    regStatus: string;
  };
  reason: string;
  recommendation: string;
}

interface PsiraClaudeVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'company' | 'officer';
  onVerificationComplete: (result: ClaudeAnalysisResult) => void;
}

const PsiraClaudeVerification: React.FC<PsiraClaudeVerificationProps> = ({
  isOpen,
  onClose,
  entityId,
  entityType,
  onVerificationComplete
}) => {
  const [psiraNumber, setPsiraNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>([]);
  const [analysisResult, setAnalysisResult] = useState<ClaudeAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const popupCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (popupCheckInterval.current) {
        clearInterval(popupCheckInterval.current);
      }
      if (popupWindow && !popupWindow.closed) {
        popupWindow.close();
      }
    };
  }, [popupWindow]);

  const handleOpenPsiraPopup = () => {
    if (!psiraNumber && !companyName) {
      toast({
        title: "Error",
        description: "Please enter PSIRA number or company name",
        variant: "destructive",
      });
      return;
    }

    // Construct PSIRA search URL
    const baseUrl = 'https://digitalservices.psira.co.za/verify-user/8';
    const params = new URLSearchParams();
    
    if (psiraNumber) {
      params.append('psiraNo', psiraNumber);
    }
    if (companyName) {
      params.append('companyName', companyName);
    }

    const url = `${baseUrl}?${params.toString()}`;

    // Open popup window (similar to OAuth)
    const width = 1000;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
      url,
      'psira_verification',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site and try again",
        variant: "destructive",
      });
      return;
    }

    setPopupWindow(popup);
    setIsPopupOpen(true);

    // Monitor popup window
    startPopupMonitoring(popup);

    toast({
      title: "PSIRA Window Opened",
      description: "Search for your compliance data, then click 'Extract Data' when ready",
    });
  };

  const startPopupMonitoring = (popup: Window) => {
    // Check if popup is still open
    popupCheckInterval.current = setInterval(() => {
      if (popup.closed) {
        setIsPopupOpen(false);
        if (popupCheckInterval.current) {
          clearInterval(popupCheckInterval.current);
        }
        
        // If closed without extracting data, show message
        if (complianceRecords.length === 0) {
          toast({
            title: "Popup Closed",
            description: "Data was not extracted. Please try again.",
            variant: "destructive",
          });
        }
      }
    }, 500);
  };

  const extractDataFromPopup = async () => {
    if (!popupWindow || popupWindow.closed) {
      toast({
        title: "Error",
        description: "Popup window is closed. Please open it again.",
        variant: "destructive",
      });
      return;
    }

    setExtracting(true);

    try {
      // Try to access popup document (will work if same-origin)
      try {
        const popupDoc = popupWindow.document;
        const records = parseComplianceTable(popupDoc);
        
        if (records.length > 0) {
          processExtractedData(records);
          popupWindow.close();
          setExtracting(false);
          return;
        }
      } catch (corsError) {
        console.log('Direct access blocked by CORS, using message-based approach');
      }

      // Fallback: Inject script into popup to extract data and send via postMessage
      await injectExtractionScript(popupWindow);

    } catch (error) {
      console.error('Extraction error:', error);
      toast({
        title: "Extraction Failed",
        description: "Could not extract data. Please use manual entry or try the backend proxy method.",
        variant: "destructive",
      });
      setExtracting(false);
    }
  };

  const injectExtractionScript = async (popup: Window) => {
    // Listen for message from popup
    const messageHandler = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin && 
          !event.origin.includes('psira.co.za')) {
        return;
      }

      if (event.data.type === 'PSIRA_DATA_EXTRACTED') {
        const records = event.data.records;
        if (records && records.length > 0) {
          processExtractedData(records);
          popup.close();
        } else {
          toast({
            title: "No Data Found",
            description: "Could not find compliance records in the page",
            variant: "destructive",
          });
        }
        setExtracting(false);
        window.removeEventListener('message', messageHandler);
      }
    };

    window.addEventListener('message', messageHandler);

    // Create script content
    const scriptContent = `
      (function() {
        try {
          const records = [];
          const table = document.querySelector('table');
          
          if (!table) {
            window.opener.postMessage({
              type: 'PSIRA_DATA_EXTRACTED',
              records: []
            }, '*');
            return;
          }

          const rows = table.querySelectorAll('tbody tr');
          
          rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 9) {
              records.push({
                appNo: cells[1]?.textContent?.trim() || '',
                psiraNo: cells[2]?.textContent?.trim() || '',
                companyName: cells[3]?.textContent?.trim() || '',
                tradingAs: cells[4]?.textContent?.trim() || '',
                regStatus: cells[5]?.textContent?.trim() || '',
                regDate: cells[6]?.textContent?.trim() || '',
                regNo: cells[7]?.textContent?.trim() || '',
                isTrainingCenter: cells[8]?.textContent?.trim() || '',
                certificateStatus: cells[9]?.textContent?.trim() || '',
                certificateExpiryDate: cells[10]?.textContent?.trim() || '',
                trainingNumber: cells[11]?.textContent?.trim() || ''
              });
            }
          });

          window.opener.postMessage({
            type: 'PSIRA_DATA_EXTRACTED',
            records: records
          }, '*');
        } catch (error) {
          console.error('Extraction error:', error);
          window.opener.postMessage({
            type: 'PSIRA_DATA_EXTRACTED',
            records: []
          }, '*');
        }
      })();
    `;

    try {
      // Try to inject script into popup using createElement
      const script = popup.document.createElement('script');
      script.textContent = scriptContent;
      popup.document.body.appendChild(script);
    } catch (error) {
      console.error('Script injection failed:', error);
      
      // Show user that automatic extraction won't work
      toast({
        title: "Automatic Extraction Unavailable",
        description: "Due to browser security, please use manual entry below.",
        variant: "destructive",
      });
      setExtracting(false);
    }

    // Timeout after 10 seconds
    setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      if (extracting) {
        setExtracting(false);
      }
    }, 10000);
  };

  const parseComplianceTable = (doc: Document): ComplianceRecord[] => {
    const records: ComplianceRecord[] = [];
    
    try {
      const table = doc.querySelector('table');
      if (!table) return records;

      const rows = table.querySelectorAll('tbody tr');
      
      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        
        if (cells.length >= 9) {
          records.push({
            appNo: cells[1]?.textContent?.trim() || '',
            psiraNo: cells[2]?.textContent?.trim() || '',
            companyName: cells[3]?.textContent?.trim() || '',
            tradingAs: cells[4]?.textContent?.trim() || '',
            regStatus: cells[5]?.textContent?.trim() || '',
            regDate: cells[6]?.textContent?.trim() || '',
            regNo: cells[7]?.textContent?.trim() || '',
            isTrainingCenter: cells[8]?.textContent?.trim() || '',
            certificateStatus: cells[9]?.textContent?.trim() || '',
            certificateExpiryDate: cells[10]?.textContent?.trim() || '',
            trainingNumber: cells[11]?.textContent?.trim() || ''
          });
        }
      });

      return records;
    } catch (error) {
      console.error('Parse error:', error);
      return records;
    }
  };

  const processExtractedData = (records: ComplianceRecord[]) => {
    setComplianceRecords(records);
    setIsPopupOpen(false);

    toast({
      title: "Data Extracted!",
      description: `Found ${records.length} compliance record(s)`,
    });

    // Automatically analyze with Claude
    analyzeWithClaude(records);
  };

  const analyzeWithClaude = async (records: ComplianceRecord[]) => {
    setAnalyzing(true);
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/psira/analyze-compliance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records,
          entityId,
          entityType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze compliance');
      }

      const result = await response.json();
      setAnalysisResult(result);

      toast({
        title: result.status === 'Compliant' ? "✅ Compliant" : "⚠️ Non-Compliant",
        description: result.reason,
        variant: result.status === 'Compliant' ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze compliance with Claude",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveVerification = async () => {
    if (!analysisResult) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const endpoint = entityType === 'company' 
        ? `${API_BASE_URL}/companies/${entityId}/psira-verification`
        : `${API_BASE_URL}/securityofficers/${entityId}/psira-verification`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          psiraNumber: psiraNumber,
          isPsiraVerified: analysisResult.status === 'Compliant',
          psiraStatus: analysisResult.latestRecord.certificateStatus,
          psiraCertificateExpiry: analysisResult.latestRecord.expiryDate || null,
          complianceAnalysis: JSON.stringify(analysisResult)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save verification');
      }

      toast({
        title: "Success!",
        description: "PSIRA verification saved successfully",
      });

      onVerificationComplete(analysisResult);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save verification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPsiraNumber('');
    setCompanyName('');
    setComplianceRecords([]);
    setAnalysisResult(null);
    setIsPopupOpen(false);
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
    }
  };

  const closePopup = () => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
    }
    setIsPopupOpen(false);
  };

  const copySearchUrl = () => {
    const baseUrl = 'https://digitalservices.psira.co.za/verify-user/8';
    const params = new URLSearchParams();
    
    if (psiraNumber) params.append('psiraNo', psiraNumber);
    if (companyName) params.append('companyName', companyName);
    
    const url = `${baseUrl}?${params.toString()}`;
    
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "Search URL copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>PSIRA Compliance Verification (AI-Powered)</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Form */}
          <div className="bg-gray-800 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>PSIRA Number</Label>
                <Input
                  value={psiraNumber}
                  onChange={(e) => setPsiraNumber(e.target.value)}
                  placeholder="Enter PSIRA number"
                  className="bg-gray-900 border-gray-700"
                  disabled={isPopupOpen}
                />
              </div>
              <div>
                <Label>Company Name</Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  className="bg-gray-900 border-gray-700"
                  disabled={isPopupOpen}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              {!isPopupOpen ? (
                <>
                  <Button 
                    onClick={handleOpenPsiraPopup}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open PSIRA Search (Popup)
                  </Button>
                  <Button
                    onClick={copySearchUrl}
                    variant="outline"
                    className="border-gray-700"
                    title="Copy search URL"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={extractDataFromPopup}
                    disabled={extracting || analyzing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {extracting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Extracting Data...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Extract Data from Popup
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={closePopup}
                    variant="outline"
                    className="border-gray-700"
                  >
                    Close Popup
                  </Button>
                </>
              )}
            </div>

            {/* Popup Status Indicator */}
            {isPopupOpen && (
              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-blue-400 text-sm font-semibold">
                    PSIRA popup is open - search for data, then click "Extract Data"
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          {!complianceRecords.length && !analysisResult && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-300">How it works:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
                <li>Enter PSIRA number or company name above</li>
                <li>Click "Open PSIRA Search" - a popup window will open</li>
                <li>The PSIRA website will load with your search</li>
                <li>Once you see the results table, click "Extract Data from Popup"</li>
                <li>Claude AI will automatically analyze the compliance status</li>
                <li>Review and save the results</li>
              </ol>
            </div>
          )}

          {/* Compliance Records Table */}
          {complianceRecords.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                Extracted Compliance Records
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="p-2 text-left">PSIRA#</th>
                      <th className="p-2 text-left">Company Name</th>
                      <th className="p-2 text-left">Reg Status</th>
                      <th className="p-2 text-left">Certificate Status</th>
                      <th className="p-2 text-left">Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceRecords.map((record, index) => (
                      <tr key={index} className="border-t border-gray-700">
                        <td className="p-2">{record.psiraNo}</td>
                        <td className="p-2">{record.companyName}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            record.regStatus === 'Registered' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {record.regStatus}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            record.certificateStatus === 'Renewed' || record.certificateStatus === 'Valid'
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {record.certificateStatus}
                          </span>
                        </td>
                        <td className="p-2">{record.certificateExpiryDate || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Claude Analysis Loading */}
          {analyzing && (
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-400" />
              <p className="text-gray-400">Claude is analyzing compliance records...</p>
              <p className="text-gray-500 text-sm mt-2">This usually takes 2-5 seconds</p>
            </div>
          )}

          {/* Claude Analysis Result */}
          {analysisResult && (
            <div className={`p-6 rounded-lg border-2 ${
              analysisResult.status === 'Compliant'
                ? 'bg-green-500/10 border-green-500/50'
                : 'bg-red-500/10 border-red-500/50'
            }`}>
              <div className="flex items-start space-x-3 mb-4">
                {analysisResult.status === 'Compliant' ? (
                  <CheckCircle className="h-8 w-8 text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    {analysisResult.status === 'Compliant' ? 'COMPLIANT ✓' : 'NON-COMPLIANT ✗'}
                  </h3>
                  <p className="text-gray-300 mb-4">{analysisResult.reason}</p>
                </div>
              </div>

              <div className="bg-gray-900/50 p-4 rounded space-y-3">
                <h4 className="font-semibold text-sm text-gray-400">Latest Record Details:</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Certificate Status:</span>
                    <p className="font-semibold">{analysisResult.latestRecord.certificateStatus}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Registration Status:</span>
                    <p className="font-semibold">{analysisResult.latestRecord.regStatus}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Expiry Date:</span>
                    <p className="font-semibold">{analysisResult.latestRecord.expiryDate || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {analysisResult.recommendation && (
                <div className="mt-4 bg-blue-500/10 border border-blue-500/50 p-3 rounded">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-400">
                      <strong>Recommendation:</strong> {analysisResult.recommendation}
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSaveVerification}
                disabled={loading}
                className={`w-full mt-4 ${
                  analysisResult.status === 'Compliant'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `Save as ${analysisResult.status}`
                )}
              </Button>
            </div>
          )}

          {/* Manual Entry Fallback */}
          {!isPopupOpen && complianceRecords.length === 0 && !analysisResult && (
            <ManualComplianceEntry
              psiraNumber={psiraNumber}
              onDataEntered={(records) => {
                setComplianceRecords(records);
                analyzeWithClaude(records);
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Manual Entry Component
interface ManualComplianceEntryProps {
  psiraNumber: string;
  onDataEntered: (records: ComplianceRecord[]) => void;
}

const ManualComplianceEntry: React.FC<ManualComplianceEntryProps> = ({ psiraNumber, onDataEntered }) => {
  const [record, setRecord] = useState<ComplianceRecord>({
    appNo: '',
    psiraNo: psiraNumber,
    companyName: '',
    tradingAs: '',
    regStatus: '',
    regDate: '',
    regNo: '',
    isTrainingCenter: 'NO',
    certificateStatus: '',
    certificateExpiryDate: '',
    trainingNumber: ''
  });

  const handleSubmit = () => {
    if (!record.certificateStatus) {
      alert('Please select a certificate status');
      return;
    }
    onDataEntered([record]);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4 border-t-2 border-gray-700">
      <h3 className="font-semibold text-gray-400">Manual Compliance Entry</h3>
      <p className="text-sm text-gray-500">If automatic extraction doesn't work, enter the data manually:</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm">Company Name *</Label>
          <Input
            value={record.companyName}
            onChange={(e) => setRecord({...record, companyName: e.target.value})}
            className="bg-gray-900 border-gray-700"
          />
        </div>
        
        <div>
          <Label className="text-sm">Registration Status *</Label>
          <select
            value={record.regStatus}
            onChange={(e) => setRecord({...record, regStatus: e.target.value})}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white"
          >
            <option value="">Select...</option>
            <option value="Registered">Registered</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>

        <div>
          <Label className="text-sm">Certificate Status *</Label>
          <select
            value={record.certificateStatus}
            onChange={(e) => setRecord({...record, certificateStatus: e.target.value})}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white"
          >
            <option value="">Select...</option>
            <option value="Renewed">Renewed</option>
            <option value="Valid">Valid</option>
            <option value="Pending Renewal">Pending Renewal</option>
          </select>
        </div>

        <div>
          <Label className="text-sm">Certificate Expiry Date</Label>
          <Input
            type="date"
            value={record.certificateExpiryDate}
            onChange={(e) => setRecord({...record, certificateExpiryDate: e.target.value})}
            className="bg-gray-900 border-gray-700"
          />
        </div>
      </div>

      <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
        <Search className="h-4 w-4 mr-2" />
        Analyze with Claude
      </Button>
    </div>
  );
};

export default PsiraClaudeVerification;