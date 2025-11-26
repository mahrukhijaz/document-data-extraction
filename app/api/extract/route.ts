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
  data?: {
    extracted_schema?: any;
    markdown?: string;
    extraction_metadata?: any;
    chunks?: any[];
  };
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
    const apiUrl = process.env.LANDINGAI_API_URL || 'https://api.va.landing.ai/v1/tools/agentic-document-analysis';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Please set LANDINGAI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define the JSON schema for invoice extraction
    const invoiceSchema = {
      type: 'object',
      properties: {
        invoice_number: { type: 'string', description: 'The invoice number or ID' },
        invoice_date: { type: 'string', description: 'The date the invoice was issued' },
        due_date: { type: 'string', description: 'The payment due date' },
        po_number: { type: 'string', description: 'Purchase order number if present' },
        vendor_name: { type: 'string', description: 'Name of the vendor or seller' },
        vendor_address: { type: 'string', description: 'Full address of the vendor' },
        vendor_contact: { type: 'string', description: 'Vendor phone, email or contact info' },
        customer_name: { type: 'string', description: 'Name of the customer or buyer' },
        customer_address: { type: 'string', description: 'Full address of the customer' },
        line_items: {
          type: 'array',
          description: 'List of items or services on the invoice',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string', description: 'Item or service description' },
              quantity: { type: 'number', description: 'Quantity or hours' },
              unit_price: { type: 'number', description: 'Price per unit' },
              amount: { type: 'number', description: 'Total amount for this line item' }
            }
          }
        },
        subtotal: { type: 'number', description: 'Subtotal before tax and discounts' },
        discount: { type: 'number', description: 'Discount amount if any' },
        tax: { type: 'number', description: 'Tax amount' },
        shipping: { type: 'number', description: 'Shipping or handling fees' },
        total: { type: 'number', description: 'Final total amount due' },
        currency: { type: 'string', description: 'Currency code (USD, EUR, etc.)' }
      }
    };

    // Create form data for LandingAI Agentic Document Analysis API
    const landingAIFormData = new FormData();

    // Use 'pdf' or 'image' field name depending on file type
    const fieldName = file.type === 'application/pdf' ? 'pdf' : 'image';
    landingAIFormData.append(fieldName, new Blob([buffer], { type: file.type }), file.name);
    landingAIFormData.append('fields_schema', JSON.stringify(invoiceSchema));

    // Call LandingAI Agentic Document Analysis API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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

  // Extract from the extracted_schema field
  const extracted = response.data?.extracted_schema || {};

  // Map the extracted schema to our invoice data structure
  if (extracted.invoice_number) {
    invoiceData.invoiceNumber = extracted.invoice_number;
  }

  if (extracted.invoice_date) {
    invoiceData.invoiceDate = extracted.invoice_date;
  }

  if (extracted.due_date) {
    invoiceData.dueDate = extracted.due_date;
  }

  if (extracted.vendor_name) {
    invoiceData.vendorName = extracted.vendor_name;
  }

  if (extracted.vendor_address) {
    invoiceData.vendorAddress = extracted.vendor_address;
  }

  if (extracted.customer_name) {
    invoiceData.customerName = extracted.customer_name;
  }

  if (extracted.customer_address) {
    invoiceData.customerAddress = extracted.customer_address;
  }

  // Extract line items
  if (extracted.line_items && Array.isArray(extracted.line_items)) {
    invoiceData.lineItems = extracted.line_items.map((item: any) => ({
      description: item.description || '',
      quantity: item.quantity || 0,
      unitPrice: item.unit_price || 0,
      amount: item.amount || 0,
    }));
  }

  // Extract totals
  if (extracted.subtotal !== undefined) {
    invoiceData.subtotal = extracted.subtotal;
  }

  if (extracted.tax !== undefined) {
    invoiceData.tax = extracted.tax;
  }

  if (extracted.total !== undefined) {
    invoiceData.total = extracted.total;
  }

  if (extracted.currency) {
    invoiceData.currency = extracted.currency;
  }

  return invoiceData;
}
