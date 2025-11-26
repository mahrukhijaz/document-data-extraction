# Invoice Data Extraction Demo

A production-ready Next.js 14 application for extracting structured data from invoices using LandingAI's Document Pre-trained Transformer (DPT) API.

![Invoice Extraction Demo](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)

## Features

- 🎯 **Drag & Drop Upload** - Intuitive file upload interface
- 🤖 **AI-Powered Extraction** - Leverages LandingAI's DPT API for accurate data extraction
- 📊 **Structured Data Display** - Beautiful card-based layout for extracted information
- 💾 **JSON Export** - Download extracted data as JSON
- ⚡ **Real-time Processing** - Live loading states and instant feedback
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components
- 🔒 **Production Ready** - Comprehensive error handling and validation
- 🚀 **Vercel Optimized** - One-click deployment to Vercel

## Extracted Data Fields

The application extracts and displays:

- **Invoice Information**: Number, Date, Due Date
- **Vendor Details**: Name, Address
- **Customer Details**: Name, Address
- **Line Items**: Description, Quantity, Unit Price, Amount
- **Financial Summary**: Subtotal, Tax, Total Amount
- **Currency Information**

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **File Upload**: react-dropzone
- **Icons**: Lucide React
- **API Integration**: LandingAI DPT API

## Getting Started

### Prerequisites

- Node.js 18+ installed
- LandingAI API key ([Get one here](https://landing.ai))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd document-data-extraction
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
LANDINGAI_API_KEY=your_api_key_here
LANDINGAI_API_URL=https://api.landing.ai/v1/dpt/extract
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload an Invoice**
   - Drag and drop a PDF or image file (JPG, PNG)
   - Or click the upload area to browse files
   - Maximum file size: 10MB

2. **Extract Data**
   - Click the "Extract Data" button
   - Wait for the AI to process your invoice

3. **View Results**
   - Review the extracted information in the right panel
   - Data is organized into logical sections

4. **Download JSON**
   - Click "Download JSON" to export the data
   - Use the structured data in your applications

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `LANDINGAI_API_KEY` | Your LandingAI API key | Yes |
| `LANDINGAI_API_URL` | LandingAI DPT API endpoint | No (has default) |

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/document-data-extraction)

1. Click the "Deploy" button above
2. Connect your GitHub account
3. Add your `LANDINGAI_API_KEY` environment variable
4. Deploy!

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## API Routes

### POST /api/extract

Extracts structured data from an invoice document.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: File (PDF, JPG, PNG)

**Response:**
```json
{
  "success": true,
  "data": {
    "invoiceNumber": "INV-001",
    "invoiceDate": "2024-01-15",
    "vendorName": "ACME Corp",
    "total": 1500.00,
    "lineItems": [...]
  }
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Project Structure

```
document-data-extraction/
├── app/
│   ├── api/
│   │   └── extract/
│   │       └── route.ts          # API endpoint for extraction
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page component
├── components/
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       └── alert.tsx
├── lib/
│   └── utils.ts                  # Utility functions
├── public/                       # Static assets
├── .env.example                  # Environment variables template
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Supported File Formats

- PDF (.pdf)
- JPEG (.jpg, .jpeg)
- PNG (.png)

Maximum file size: 10MB

## Error Handling

The application includes comprehensive error handling for:

- Invalid file types
- File size limits
- API connection errors
- Missing API credentials
- Malformed responses
- Network timeouts

## Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Linter
```bash
npm run lint
```

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions:
- Open an issue on GitHub
- Check LandingAI documentation for API-related questions

## Credits

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Powered by [LandingAI](https://landing.ai/)
