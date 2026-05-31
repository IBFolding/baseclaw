# invoice-generator

Auto-generate professional invoices and track payments.

## Features

- PDF invoice generation with custom branding
- Payment tracking and status management
- Client database
- Automated reminder emails
- Multiple currency support
- Recurring invoices

## Usage

```bash
# Generate a new invoice
./invoice.py create --client "Acme Corp" --amount 5000 --description "Web Development"

# List all invoices
./invoice.py list

# Mark invoice as paid
./invoice.py pay INV-001 --amount 5000 --date 2024-02-15

# Send reminder email
./invoice.py remind INV-001

# Generate PDF
./invoice.py pdf INV-001 --output invoice.pdf

# Add a client
./client.py add --name "Acme Corp" --email "billing@acme.com" --address "123 Main St"

# List clients
./client.py list
```

## Invoice Data

Invoices are stored in `~/.openclaw/invoices/` as JSON files.

```json
{
  "id": "INV-001",
  "client": "Acme Corp",
  "amount": 5000.00,
  "currency": "USD",
  "description": "Web Development Services",
  "status": "unpaid",
  "issue_date": "2024-02-01",
  "due_date": "2024-03-01",
  "paid_date": null,
  "paid_amount": 0
}
```

## Configuration

Create `~/.openclaw/invoice-config.json`:

```json
{
  "company": {
    "name": "Your Company",
    "email": "billing@yourcompany.com",
    "address": "123 Business St",
    "phone": "+1 555-1234",
    "logo": "/path/to/logo.png"
  },
  "payment_terms": "Net 30",
  "default_currency": "USD",
  "tax_rate": 0.0,
  "smtp": {
    "host": "smtp.gmail.com",
    "port": 587,
    "user": "your-email@gmail.com",
    "password": "app-password"
  }
}
```

## Directory Structure

```
~/.openclaw/
├── invoices/          # Invoice JSON files
├── clients/           # Client data
├── templates/         # PDF templates
└── invoice-config.json
```

## Requirements

- Python 3.8+
- reportlab (PDF generation)
- jinja2 (templates)

## Install

```bash
pip install reportlab jinja2
```
