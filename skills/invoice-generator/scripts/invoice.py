#!/usr/bin/env python3
"""
Invoice Generator - Create and manage professional invoices
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
import uuid

# Data directories
DATA_DIR = Path.home() / ".openclaw"
INVOICE_DIR = DATA_DIR / "invoices"
CLIENT_DIR = DATA_DIR / "clients"


def ensure_dirs():
    """Create necessary directories"""
    INVOICE_DIR.mkdir(parents=True, exist_ok=True)
    CLIENT_DIR.mkdir(parents=True, exist_ok=True)


def load_config() -> Dict:
    """Load configuration"""
    config_path = DATA_DIR / "invoice-config.json"
    if config_path.exists():
        with open(config_path) as f:
            return json.load(f)
    return {
        "company": {
            "name": "Your Company",
            "email": "billing@example.com"
        },
        "payment_terms": "Net 30",
        "default_currency": "USD",
        "tax_rate": 0.0
    }


def load_clients() -> List[Dict]:
    """Load all clients"""
    clients = []
    if CLIENT_DIR.exists():
        for file in CLIENT_DIR.glob("*.json"):
            with open(file) as f:
                clients.append(json.load(f))
    return clients


def get_client(name: str) -> Optional[Dict]:
    """Get client by name"""
    clients = load_clients()
    for client in clients:
        if client.get("name", "").lower() == name.lower():
            return client
    return None


def generate_invoice_id() -> str:
    """Generate unique invoice ID"""
    timestamp = datetime.now().strftime("%Y%m")
    # Get count of invoices this month
    count = len(list(INVOICE_DIR.glob(f"INV-{timestamp}*.json"))) + 1
    return f"INV-{timestamp}-{count:03d}"


def create_invoice(
    client_name: str,
    amount: float,
    description: str,
    currency: str = "USD",
    due_days: int = 30,
    items: Optional[List[Dict]] = None
) -> Dict:
    """Create a new invoice"""
    ensure_dirs()
    
    invoice_id = generate_invoice_id()
    issue_date = datetime.now()
    due_date = issue_date + timedelta(days=due_days)
    
    client = get_client(client_name)
    
    invoice = {
        "id": invoice_id,
        "client": client_name,
        "client_email": client.get("email", "") if client else "",
        "amount": float(amount),
        "currency": currency,
        "description": description,
        "items": items or [{"description": description, "amount": amount}],
        "status": "unpaid",
        "issue_date": issue_date.strftime("%Y-%m-%d"),
        "due_date": due_date.strftime("%Y-%m-%d"),
        "paid_date": None,
        "paid_amount": 0.0,
        "created_at": issue_date.isoformat()
    }
    
    # Save invoice
    invoice_path = INVOICE_DIR / f"{invoice_id}.json"
    with open(invoice_path, 'w') as f:
        json.dump(invoice, f, indent=2)
    
    return invoice


def load_invoice(invoice_id: str) -> Optional[Dict]:
    """Load invoice by ID"""
    invoice_path = INVOICE_DIR / f"{invoice_id}.json"
    if invoice_path.exists():
        with open(invoice_path) as f:
            return json.load(f)
    return None


def load_all_invoices() -> List[Dict]:
    """Load all invoices"""
    invoices = []
    if INVOICE_DIR.exists():
        for file in INVOICE_DIR.glob("*.json"):
            with open(file) as f:
                invoices.append(json.load(f))
    return sorted(invoices, key=lambda x: x.get("created_at", ""), reverse=True)


def update_invoice(invoice_id: str, updates: Dict) -> bool:
    """Update invoice data"""
    invoice = load_invoice(invoice_id)
    if not invoice:
        return False
    
    invoice.update(updates)
    invoice_path = INVOICE_DIR / f"{invoice_id}.json"
    with open(invoice_path, 'w') as f:
        json.dump(invoice, f, indent=2)
    return True


def mark_paid(invoice_id: str, amount: Optional[float] = None, date: Optional[str] = None) -> bool:
    """Mark invoice as paid"""
    invoice = load_invoice(invoice_id)
    if not invoice:
        print(f"Invoice {invoice_id} not found")
        return False
    
    paid_amount = amount or invoice["amount"]
    paid_date = date or datetime.now().strftime("%Y-%m-%d")
    
    updates = {
        "status": "paid",
        "paid_amount": paid_amount,
        "paid_date": paid_date
    }
    
    update_invoice(invoice_id, updates)
    print(f"✅ Invoice {invoice_id} marked as paid (${paid_amount:,.2f})")
    return True


def display_invoice(invoice: Dict):
    """Display invoice details"""
    print(f"\n{'='*60}")
    print(f"📄 INVOICE {invoice['id']}")
    print(f"{'='*60}")
    print(f"Client:       {invoice['client']}")
    print(f"Amount:       ${invoice['amount']:,.2f} {invoice['currency']}")
    print(f"Status:       {invoice['status'].upper()}")
    print(f"Issue Date:   {invoice['issue_date']}")
    print(f"Due Date:     {invoice['due_date']}")
    print(f"Description:  {invoice['description']}")
    
    if invoice['status'] == 'paid':
        print(f"Paid Date:    {invoice['paid_date']}")
        print(f"Paid Amount:  ${invoice['paid_amount']:,.2f}")
    
    # Check if overdue
    if invoice['status'] == 'unpaid':
        due = datetime.strptime(invoice['due_date'], "%Y-%m-%d")
        if due < datetime.now():
            days_overdue = (datetime.now() - due).days
            print(f"⚠️  OVERDUE by {days_overdue} days")
    
    print(f"{'='*60}")


def list_invoices(status: Optional[str] = None):
    """List all invoices"""
    invoices = load_all_invoices()
    
    if status:
        invoices = [i for i in invoices if i["status"] == status]
    
    if not invoices:
        print("No invoices found.")
        return
    
    print(f"\n{'='*90}")
    print(f"{'ID':<15} {'Client':<20} {'Amount':>12} {'Status':<10} {'Due Date':<12} {'Age':>8}")
    print(f"{'='*90}")
    
    total_unpaid = 0
    total_paid = 0
    
    for inv in invoices:
        inv_id = inv['id']
        client = inv['client'][:18]
        amount = f"${inv['amount']:,.2f}"
        stat = inv['status'].upper()
        due = inv['due_date']
        
        # Calculate age
        issue = datetime.strptime(inv['issue_date'], "%Y-%m-%d")
        age_days = (datetime.now() - issue).days
        age = f"{age_days}d"
        
        # Status emoji
        if stat == "PAID":
            emoji = "✅"
            total_paid += inv['amount']
        elif datetime.strptime(due, "%Y-%m-%d") < datetime.now():
            emoji = "🔴"
            total_unpaid += inv['amount']
        else:
            emoji = "⏳"
            total_unpaid += inv['amount']
        
        print(f"{inv_id:<15} {client:<20} {amount:>12} {emoji} {stat:<8} {due:<12} {age:>8}")
    
    print(f"{'='*90}")
    print(f"Total Invoices: {len(invoices)}")
    print(f"💰 Paid: ${total_paid:,.2f} | ⏳ Unpaid: ${total_unpaid:,.2f}")


def send_reminder(invoice_id: str):
    """Send payment reminder (placeholder)"""
    invoice = load_invoice(invoice_id)
    if not invoice:
        print(f"Invoice {invoice_id} not found")
        return
    
    if invoice['status'] == 'paid':
        print(f"Invoice {invoice_id} is already paid")
        return
    
    client_email = invoice.get('client_email', '')
    if not client_email:
        print(f"No email for client {invoice['client']}")
        return
    
    # In a real implementation, this would send an email
    print(f"\n📧 REMINDER EMAIL PREVIEW")
    print(f"{'='*60}")
    print(f"To: {client_email}")
    print(f"Subject: Payment Reminder - Invoice {invoice_id}")
    print(f"{'='*60}")
    print(f"""
Dear {invoice['client']},

This is a friendly reminder that Invoice {invoice_id} for ${invoice['amount']:,.2f} 
is due on {invoice['due_date']}.

Description: {invoice['description']}

Please let us know if you have any questions.

Best regards,
{load_config()['company']['name']}
""")
    print(f"{'='*60}")
    print(f"To send: Configure SMTP in {DATA_DIR}/invoice-config.json")


def generate_pdf(invoice_id: str, output_path: Optional[str] = None):
    """Generate PDF invoice"""
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
    except ImportError:
        print("Error: reportlab not installed. Run: pip install reportlab")
        return
    
    invoice = load_invoice(invoice_id)
    if not invoice:
        print(f"Invoice {invoice_id} not found")
        return
    
    config = load_config()
    output = output_path or f"{invoice_id}.pdf"
    
    doc = SimpleDocTemplate(output, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    # Header
    elements.append(Paragraph(f"<b>INVOICE</b>", styles['Heading1']))
    elements.append(Spacer(1, 20))
    
    # Company info
    company = config['company']
    elements.append(Paragraph(f"<b>{company['name']}</b>", styles['Heading3']))
    if company.get('address'):
        elements.append(Paragraph(company['address'], styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Invoice details
    data = [
        ['Invoice #:', invoice['id']],
        ['Date:', invoice['issue_date']],
        ['Due Date:', invoice['due_date']],
        ['Client:', invoice['client']],
    ]
    
    t = Table(data, colWidths=[100, 300])
    t.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 30))
    
    # Items table
    elements.append(Paragraph("<b>Items</b>", styles['Heading3']))
    
    items_data = [['Description', 'Amount']]
    for item in invoice.get('items', []):
        items_data.append([
            item.get('description', ''),
            f"${item.get('amount', 0):,.2f}"
        ])
    
    items_data.append(['', ''])
    items_data.append(['<b>Total</b>', f"<b>${invoice['amount']:,.2f}</b>"])
    
    t = Table(items_data, colWidths=[400, 100])
    t.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('LINEABOVE', (0, -1), (-1, -1), 1, colors.black),
    ]))
    elements.append(t)
    
    doc.build(elements)
    print(f"✅ PDF generated: {output}")


def main():
    parser = argparse.ArgumentParser(description='Invoice Generator')
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Create invoice
    create_parser = subparsers.add_parser('create', help='Create new invoice')
    create_parser.add_argument('--client', required=True, help='Client name')
    create_parser.add_argument('--amount', type=float, required=True, help='Invoice amount')
    create_parser.add_argument('--description', required=True, help='Description')
    create_parser.add_argument('--currency', default='USD', help='Currency')
    create_parser.add_argument('--due-days', type=int, default=30, help='Due date offset')
    
    # List invoices
    list_parser = subparsers.add_parser('list', help='List invoices')
    list_parser.add_argument('--status', choices=['paid', 'unpaid', 'overdue'])
    
    # Show invoice
    show_parser = subparsers.add_parser('show', help='Show invoice details')
    show_parser.add_argument('invoice_id', help='Invoice ID')
    
    # Mark as paid
    pay_parser = subparsers.add_parser('pay', help='Mark invoice as paid')
    pay_parser.add_argument('invoice_id', help='Invoice ID')
    pay_parser.add_argument('--amount', type=float, help='Paid amount')
    pay_parser.add_argument('--date', help='Payment date (YYYY-MM-DD)')
    
    # Send reminder
    remind_parser = subparsers.add_parser('remind', help='Send payment reminder')
    remind_parser.add_argument('invoice_id', help='Invoice ID')
    
    # Generate PDF
    pdf_parser = subparsers.add_parser('pdf', help='Generate PDF')
    pdf_parser.add_argument('invoice_id', help='Invoice ID')
    pdf_parser.add_argument('--output', help='Output file path')
    
    args = parser.parse_args()
    
    if args.command == 'create':
        invoice = create_invoice(
            client_name=args.client,
            amount=args.amount,
            description=args.description,
            currency=args.currency,
            due_days=args.due_days
        )
        print(f"✅ Invoice created: {invoice['id']}")
        display_invoice(invoice)
    
    elif args.command == 'list':
        list_invoices(args.status)
    
    elif args.command == 'show':
        invoice = load_invoice(args.invoice_id)
        if invoice:
            display_invoice(invoice)
        else:
            print(f"Invoice {args.invoice_id} not found")
    
    elif args.command == 'pay':
        mark_paid(args.invoice_id, args.amount, args.date)
    
    elif args.command == 'remind':
        send_reminder(args.invoice_id)
    
    elif args.command == 'pdf':
        generate_pdf(args.invoice_id, args.output)
    
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
