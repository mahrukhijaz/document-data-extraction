'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  AlertCircle,
  DollarSign,
  Calendar,
  Building2,
  Hash,
} from 'lucide-react';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  vendorName?: string;
  vendorAddress?: string;
  customerName?: string;
  customerAddress?: string;
  lineItems?: LineItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  currency?: string;
}

interface ExtractedResult {
  data: InvoiceData;
  rawResponse?: any;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleExtract = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract data');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!result) return;

    const json = JSON.stringify(result.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoice Data Extraction</h1>
              <p className="text-sm text-gray-600">Powered by LandingAI Document Pre-trained Transformer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Upload */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Invoice</CardTitle>
                <CardDescription>
                  Upload a PDF or image file of your invoice to extract structured data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    {isDragActive ? (
                      <p className="text-lg font-medium text-primary">Drop the file here...</p>
                    ) : (
                      <>
                        <p className="text-lg font-medium text-gray-700">
                          Drag & drop your invoice here
                        </p>
                        <p className="text-sm text-gray-500">or click to browse</p>
                      </>
                    )}
                    <p className="text-xs text-gray-400">Supports PDF, JPG, PNG (max 10MB)</p>
                  </div>
                </div>

                {/* Selected File */}
                {file && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleExtract}
                    disabled={!file || loading}
                    className="flex-1"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Extract Data
                      </>
                    )}
                  </Button>
                  {file && !loading && (
                    <Button variant="outline" onClick={handleReset} size="lg">
                      Reset
                    </Button>
                  )}
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Info Alert */}
                {!file && !result && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Getting Started</AlertTitle>
                    <AlertDescription>
                      Upload an invoice to automatically extract key information like invoice number,
                      dates, vendor details, line items, and totals using AI.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* API Configuration Note */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Configuration Required
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 space-y-2">
                <p>To use this demo, you need to set up your LandingAI API credentials:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Get your API key from LandingAI</li>
                  <li>Create a <code className="bg-white px-1 py-0.5 rounded">.env.local</code> file</li>
                  <li>Add: <code className="bg-white px-1 py-0.5 rounded">LANDINGAI_API_KEY=your_key</code></li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            {loading && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p className="text-lg font-medium text-gray-700">Processing your invoice...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                </CardContent>
              </Card>
            )}

            {result && !loading && (
              <>
                {/* Success Header */}
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="flex items-center gap-3 py-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900">Extraction Successful!</p>
                      <p className="text-sm text-green-700">Data extracted and parsed</p>
                    </div>
                    <Button onClick={handleDownloadJSON} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download JSON
                    </Button>
                  </CardContent>
                </Card>

                {/* Invoice Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Invoice Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {result.data.invoiceNumber && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Hash className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Invoice Number</p>
                            <p className="font-semibold text-gray-900">{result.data.invoiceNumber}</p>
                          </div>
                        </div>
                      )}

                      {result.data.invoiceDate && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Invoice Date</p>
                            <p className="font-semibold text-gray-900">{result.data.invoiceDate}</p>
                          </div>
                        </div>
                      )}

                      {result.data.dueDate && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Calendar className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Due Date</p>
                            <p className="font-semibold text-gray-900">{result.data.dueDate}</p>
                          </div>
                        </div>
                      )}

                      {result.data.total !== undefined && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Total Amount</p>
                            <p className="font-semibold text-gray-900 text-lg">
                              {result.data.currency || '$'} {result.data.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Vendor & Customer Info */}
                {(result.data.vendorName || result.data.customerName) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Parties
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.data.vendorName && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">Vendor</Badge>
                          </div>
                          <p className="font-semibold text-gray-900">{result.data.vendorName}</p>
                          {result.data.vendorAddress && (
                            <p className="text-sm text-gray-600 mt-1">{result.data.vendorAddress}</p>
                          )}
                        </div>
                      )}

                      {result.data.customerName && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">Customer</Badge>
                          </div>
                          <p className="font-semibold text-gray-900">{result.data.customerName}</p>
                          {result.data.customerAddress && (
                            <p className="text-sm text-gray-600 mt-1">{result.data.customerAddress}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Line Items */}
                {result.data.lineItems && result.data.lineItems.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Line Items</CardTitle>
                      <CardDescription>{result.data.lineItems.length} items</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.data.lineItems.map((item, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.description}</p>
                                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                  <span>Qty: {item.quantity}</span>
                                  <span>
                                    Unit Price: {result.data.currency || '$'}{item.unitPrice.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  {result.data.currency || '$'}{item.amount.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Totals Summary */}
                {(result.data.subtotal !== undefined || result.data.tax !== undefined) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.data.subtotal !== undefined && (
                          <div className="flex justify-between text-gray-700">
                            <span>Subtotal</span>
                            <span className="font-medium">
                              {result.data.currency || '$'}{result.data.subtotal.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {result.data.tax !== undefined && (
                          <div className="flex justify-between text-gray-700">
                            <span>Tax</span>
                            <span className="font-medium">
                              {result.data.currency || '$'}{result.data.tax.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {result.data.total !== undefined && (
                          <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t">
                            <span>Total</span>
                            <span>
                              {result.data.currency || '$'}{result.data.total.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Empty State */}
            {!loading && !result && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Yet</h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Upload an invoice and click "Extract Data" to see the results here
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t mt-12 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Built with Next.js 14, Tailwind CSS, and LandingAI DPT API</p>
            <p className="mt-1 text-xs text-gray-500">
              Ready for Vercel deployment
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
