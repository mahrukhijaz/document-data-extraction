import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Types for the extracted invoice data
export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceData {
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

// LandingAI API response structure
interface LandingAIResponse {
  predictions?: any;
  extracted_data?: any;
  fields?: Record<string, any>;
  data?: any;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or image file.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const apiKey = process.env.LANDINGAI_API_KEY;
    const apiUrl = process.env.LANDINGAI_API_URL || 'https://api.landing.ai/v1/dpt/extract';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Please set LANDINGAI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create form data for LandingAI API
    const landingAIFormData = new FormData();
    landingAIFormData.append('file', new Blob([buffer], { type: file.type }), file.name);
    landingAIFormData.append('document_type', 'invoice');

    // Call LandingAI DPT API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${apiKey}`,
      },
      body: landingAIFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LandingAI API error:', errorText);
      return NextResponse.json(
        {
          error: `LandingAI API error: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data: LandingAIResponse = await response.json();

    // Parse and structure the response
    const extractedData = parseInvoiceData(data);

    return NextResponse.json({
      success: true,
      data: extractedData,
      rawResponse: data, // Include raw response for debugging
    });

  } catch (error: any) {
    console.error('Error processing invoice:', error);
    return NextResponse.json(
      {
        error: 'Failed to process invoice',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Parse the LandingAI response into structured invoice data
function parseInvoiceData(response: LandingAIResponse): InvoiceData {
  const invoiceData: InvoiceData = {};

  // The actual structure depends on LandingAI's response format
  // This is a flexible parser that handles various response structures
  const data = response.predictions || response.extracted_data || response.fields || response.data || {};

  // Extract common invoice fields
  if (data.invoice_number || data.invoiceNumber || data.invoice_no) {
    invoiceData.invoiceNumber = data.invoice_number || data.invoiceNumber || data.invoice_no;
  }

  if (data.invoice_date || data.invoiceDate || data.date) {
    invoiceData.invoiceDate = data.invoice_date || data.invoiceDate || data.date;
  }

  if (data.due_date || data.dueDate) {
    invoiceData.dueDate = data.due_date || data.dueDate;
  }

  if (data.vendor_name || data.vendorName || data.supplier || data.from) {
    invoiceData.vendorName = data.vendor_name || data.vendorName || data.supplier || data.from;
  }

  if (data.vendor_address || data.vendorAddress || data.supplier_address) {
    invoiceData.vendorAddress = data.vendor_address || data.vendorAddress || data.supplier_address;
  }

  if (data.customer_name || data.customerName || data.bill_to || data.to) {
    invoiceData.customerName = data.customer_name || data.customerName || data.bill_to || data.to;
  }

  if (data.customer_address || data.customerAddress || data.billing_address) {
    invoiceData.customerAddress = data.customer_address || data.customerAddress || data.billing_address;
  }

  // Extract line items
  if (data.line_items || data.lineItems || data.items) {
    const items = data.line_items || data.lineItems || data.items;
    if (Array.isArray(items)) {
      invoiceData.lineItems = items.map((item: any) => ({
        description: item.description || item.name || item.item || '',
        quantity: parseFloat(item.quantity || item.qty || 0),
        unitPrice: parseFloat(item.unit_price || item.unitPrice || item.price || 0),
        amount: parseFloat(item.amount || item.total || item.line_total || 0),
      }));
    }
  }

  // Extract totals
  if (data.subtotal || data.sub_total) {
    invoiceData.subtotal = parseFloat(data.subtotal || data.sub_total);
  }

  if (data.tax || data.tax_amount || data.vat) {
    invoiceData.tax = parseFloat(data.tax || data.tax_amount || data.vat);
  }

  if (data.total || data.total_amount || data.grand_total) {
    invoiceData.total = parseFloat(data.total || data.total_amount || data.grand_total);
  }

  if (data.currency) {
    invoiceData.currency = data.currency;
  }

  return invoiceData;
}
