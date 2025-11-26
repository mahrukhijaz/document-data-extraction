// Shared types for invoice data extraction

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

export interface ExtractedResult {
  success: boolean;
  data: InvoiceData;
  rawResponse?: any;
}

export interface ApiError {
  error: string;
  details?: string;
}
