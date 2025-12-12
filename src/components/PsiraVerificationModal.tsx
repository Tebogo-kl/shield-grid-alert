// components/PsiraVerificationModal.tsx (Enhanced Version)
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';

const API_BASE_URL = 'https://localhost:44339/api';

interface PsiraVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'company' | 'officer';
  initialPsiraNumber?: string;
  onVerificationComplete: () => void;
}

interface PsiraVerificationData {
  psiraNumber: string;
  status: string;
  expiryDate: string;
  isVerified: boolean;
}

const PsiraVerificationModal: React.FC<PsiraVerificationModalProps> = ({
  isOpen,
  onClose,
  entityId,
  entityType,
  initialPsiraNumber = '',
  onVerificationComplete
}) => {
  const [psiraNumber, setPsiraNumber] = useState(initialPsiraNumber);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [verificationData, setVerificationData] = useState<PsiraVerificationData>({
    psiraNumber: initialPsiraNumber,
    status: '',
    expiryDate: '',
    isVerified: false
  });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState<'input' | 'capture' | 'review'>('input');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleOpenPsiraWebsite = () => {
    if (!psiraNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a PSIRA number",
        variant: "destructive",
      });
      return;
    }

    // Open PSIRA verification website
    window.open(
      `https://digitalservices.psira.co.za/verify-user/${psiraNumber}`,
      'psira_verification',
      'width=1024,height=768,scrollbars=yes,resizable=yes'
    );

    toast({
      title: "PSIRA Website Opened",
      description: "Please take a screenshot of the verification result and upload it for OCR processing.",
    });

    setVerificationStep('capture');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      setCapturedImage(imageUrl);
      await performOCR(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const performOCR = async (imageUrl: string) => {
    setOcrLoading(true);
    
    try {
      console.log('Starting OCR processing...');
      
      const { data: { text } } = await Tesseract.recognize(
        imageUrl,
        'eng',
        {
          logger: (m) => console.log(m)
        }
      );

      console.log('OCR Result:', text);

      // Parse the OCR text to extract verification details
      const parsedData = parseOCRText(text);
      
      setVerificationData({
        psiraNumber: parsedData.psiraNumber || psiraNumber,
        status: parsedData.status || '',
        expiryDate: parsedData.expiryDate || '',
        isVerified: parsedData.isVerified
      });

      setVerificationStep('review');

      toast({
        title: "OCR Complete",
        description: "Please review the extracted information",
      });

    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "OCR Failed",
        description: "Failed to process image. Please enter details manually.",
        variant: "destructive",
      });
    } finally {
      setOcrLoading(false);
    }
  };

  const parseOCRText = (text: string): Partial<PsiraVerificationData> => {
    const lowerText = text.toLowerCase();
    
    // Extract PSIRA number (typically 8 digits)
    const psiraMatch = text.match(/\b\d{8}\b/);
    
    // Detect status
    let status = '';
    let isVerified = false;
    
    if (lowerText.includes('active') || lowerText.includes('registered')) {
      status = lowerText.includes('active') ? 'Active' : 'Registered';
      isVerified = true;
    } else if (lowerText.includes('withdrawn')) {
      status = 'Withdrawn';
      isVerified = false;
    } else if (lowerText.includes('pending') || lowerText.includes('renewal')) {
      status = 'Pending renewal';
      isVerified = false;
    }

    // Extract expiry date (various formats)
    const datePatterns = [
      /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/,  // DD/MM/YYYY or DD-MM-YYYY
      /(\d{4})[\/\-](\d{2})[\/\-](\d{2})/,  // YYYY/MM/DD or YYYY-MM-DD
      /expiry[:\s]*(\d{2})[\/\-](\d{2})[\/\-](\d{4})/i
    ];

    let expiryDate = '';
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        // Convert to YYYY-MM-DD format
        if (pattern === datePatterns[0]) {
          expiryDate = `${match[3]}-${match[2]}-${match[1]}`;
        } else {
          expiryDate = `${match[1]}-${match[2]}-${match[3]}`;
        }
        break;
      }
    }

    return {
      psiraNumber: psiraMatch?.[0],
      status,
      expiryDate,
      isVerified
    };
  };

  const handleSaveVerification = async () => {
    if (!verificationData.status) {
      toast({
        title: "Error",
        description: "Please enter a verification status",
        variant: "destructive",
      });
      return;
    }

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
          psiraNumber: verificationData.psiraNumber,
          isPsiraVerified: verificationData.isVerified,
          psiraStatus: verificationData.status,
          psiraCertificateExpiry: verificationData.expiryDate || null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update verification');
      }

      toast({
        title: "Success!",
        description: "PSIRA verification saved successfully",
      });

      onVerificationComplete();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save verification result",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPsiraNumber('');
    setVerificationData({
      psiraNumber: '',
      status: '',
      expiryDate: '',
      isVerified: false
    });
    setCapturedImage(null);
    setVerificationStep('input');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>PSIRA Verification</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Input PSIRA Number */}
          {verificationStep === 'input' && (
            <div className="space-y-4">
              <div>
                <Label>PSIRA Number</Label>
                <Input
                  value={psiraNumber}
                  onChange={(e) => setPsiraNumber(e.target.value)}
                  placeholder="Enter 8-digit PSIRA number"
                  className="bg-gray-800 border-gray-700"
                  maxLength={8}
                />
              </div>

              <Button 
                onClick={handleOpenPsiraWebsite}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Open PSIRA Verification Website
              </Button>

              <div className="text-center text-gray-400 text-sm">
                <p>or enter details manually below</p>
              </div>

              <ManualVerificationForm
                psiraNumber={psiraNumber}
                onSubmit={(data) => {
                  setVerificationData(data);
                  setVerificationStep('review');
                }}
              />
            </div>
          )}

          {/* Step 2: Capture/Upload Screenshot */}
          {verificationStep === 'capture' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-400 mb-4">
                  Take a screenshot of the PSIRA verification result and upload it for automatic processing
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={ocrLoading}
                >
                  {ocrLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Screenshot
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setVerificationStep('input')}
                  variant="outline"
                  className="w-full border-gray-700"
                >
                  Enter Manually Instead
                </Button>
              </div>

              {capturedImage && (
                <div className="mt-4">
                  <Label>Captured Image</Label>
                  <img 
                    src={capturedImage} 
                    alt="PSIRA verification screenshot" 
                    className="w-full rounded border border-gray-700 mt-2"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review and Confirm */}
          {verificationStep === 'review' && (
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold flex items-center">
                  {verificationData.isVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400 mr-2" />
                  )}
                  Verification Result
                </h3>

                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-400">PSIRA Number</Label>
                    <Input
                      value={verificationData.psiraNumber}
                      onChange={(e) => setVerificationData({...verificationData, psiraNumber: e.target.value})}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-400">Status</Label>
                    <select
                      value={verificationData.status}
                      onChange={(e) => {
                        const status = e.target.value;
                        const isVerified = status === 'Active' || status === 'Registered';
                        setVerificationData({...verificationData, status, isVerified});
                      }}
                      className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white"
                    >
                      <option value="">Select status</option>
                      <option value="Registered">Registered</option>
                      <option value="Active">Active</option>
                      <option value="Pending renewal">Pending Renewal</option>
                      <option value="Withdrawn">Withdrawn</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-gray-400">Certificate Expiry Date</Label>
                    <Input
                      type="date"
                      value={verificationData.expiryDate}
                      onChange={(e) => setVerificationData({...verificationData, expiryDate: e.target.value})}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-400">Verification Status</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        checked={verificationData.isVerified}
                        onChange={(e) => setVerificationData({...verificationData, isVerified: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Mark as verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {capturedImage && (
                <div>
                  <Label className="text-gray-400">Reference Image</Label>
                  <img 
                    src={capturedImage} 
                    alt="PSIRA verification screenshot" 
                    className="w-full rounded border border-gray-700 mt-2 max-h-48 object-contain"
                  />
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={() => setVerificationStep('capture')}
                  variant="outline"
                  className="flex-1 border-gray-700"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSaveVerification}
                  disabled={loading || !verificationData.status}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Verification'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Manual Entry Form Component
interface ManualVerificationFormProps {
  psiraNumber: string;
  onSubmit: (data: PsiraVerificationData) => void;
}

const ManualVerificationForm: React.FC<ManualVerificationFormProps> = ({ psiraNumber, onSubmit }) => {
  const [formData, setFormData] = useState<PsiraVerificationData>({
    psiraNumber: psiraNumber,
    status: '',
    expiryDate: '',
    isVerified: false
  });

  const handleSubmit = () => {
    if (!formData.status) {
      alert('Please select a status');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="border-t border-gray-700 pt-4 space-y-4">
      <h4 className="font-semibold text-sm text-gray-400">Manual Entry</h4>
      
      <div>
        <Label>Status</Label>
        <select
          value={formData.status}
          onChange={(e) => {
            const status = e.target.value;
            const isVerified = status === 'Active' || status === 'Registered';
            setFormData({...formData, status, isVerified});
          }}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
        >
          <option value="">Select status</option>
          <option value="Registered">Registered</option>
          <option value="Active">Active</option>
          <option value="Pending renewal">Pending Renewal</option>
          <option value="Withdrawn">Withdrawn</option>
        </select>
      </div>

      <div>
        <Label>Certificate Expiry Date (Optional)</Label>
        <Input
          type="date"
          value={formData.expiryDate}
          onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
          className="bg-gray-800 border-gray-700"
        />
      </div>

      <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
        Continue to Review
      </Button>
    </div>
  );
};

export default PsiraVerificationModal;