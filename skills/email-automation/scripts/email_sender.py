#!/usr/bin/env python3
"""
Email Automation - Send emails and follow-up sequences.
Usage: python email_sender.py --to recipient@example.com --subject "Hello" --body "Message"
"""

import argparse
import os
import smtplib
import json
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path


class EmailSender:
    """Handle email sending via SMTP."""
    
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_pass = os.getenv("SMTP_PASS")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_user)
    
    def send(self, to: str, subject: str, body: str, html: bool = False) -> bool:
        """Send an email."""
        if not all([self.smtp_user, self.smtp_pass]):
            print("❌ SMTP credentials not configured")
            return False
        
        try:
            msg = MIMEMultipart()
            msg["From"] = self.from_email
            msg["To"] = to
            msg["Subject"] = subject
            
            content_type = "html" if html else "plain"
            msg.attach(MIMEText(body, content_type))
            
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_pass)
            server.send_message(msg)
            server.quit()
            
            print(f"✅ Email sent to {to}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            return False


class FollowUpSequence:
    """Manage follow-up email sequences."""
    
    def __init__(self, sequence_file: str = "~/.email_sequences.json"):
        self.sequence_file = Path(sequence_file).expanduser()
        self.sequences = self._load_sequences()
    
    def _load_sequences(self) -> dict:
        if self.sequence_file.exists():
            with open(self.sequence_file) as f:
                return json.load(f)
        return {}
    
    def _save_sequences(self):
        with open(self.sequence_file, "w") as f:
            json.dump(self.sequences, f, indent=2)
    
    def create_sequence(self, name: str, steps: list):
        """Create a follow-up sequence.
        
        steps: list of dicts with 'delay_days', 'subject', 'body'
        """
        self.sequences[name] = {
            "created": datetime.now().isoformat(),
            "steps": steps
        }
        self._save_sequences()
        print(f"✅ Created sequence: {name} ({len(steps)} steps)")
    
    def start_sequence(self, name: str, recipient: str, sender: EmailSender):
        """Start a sequence for a recipient."""
        if name not in self.sequences:
            print(f"❌ Sequence '{name}' not found")
            return
        
        sequence = self.sequences[name]
        start_time = datetime.now()
        
        for i, step in enumerate(sequence["steps"]):
            send_time = start_time + timedelta(days=step["delay_days"])
            
            print(f"\n📧 Step {i+1}: Send at {send_time}")
            print(f"   Subject: {step['subject']}")
            
            # For demo, send immediately or schedule (in real app, use cron/job queue)
            if step["delay_days"] == 0:
                sender.send(recipient, step["subject"], step["body"])
            else:
                print(f"   ⏰ Scheduled for {send_time}")


def main():
    parser = argparse.ArgumentParser(description="Email automation tool")
    parser.add_argument("--to", help="Recipient email")
    parser.add_argument("--subject", help="Email subject")
    parser.add_argument("--body", help="Email body")
    parser.add_argument("--body-file", help="File containing email body")
    parser.add_argument("--html", action="store_true", help="Send as HTML")
    parser.add_argument("--sequence", help="Use a follow-up sequence")
    parser.add_argument("--create-sequence", help="Create new sequence (name)")
    parser.add_argument("--list-sequences", action="store_true", help="List all sequences")
    
    args = parser.parse_args()
    
    sender = EmailSender()
    
    if args.list_sequences:
        seq_manager = FollowUpSequence()
        for name, data in seq_manager.sequences.items():
            print(f"{name}: {len(data['steps'])} steps")
    
    elif args.create_sequence:
        seq_manager = FollowUpSequence()
        # Example sequence for cold outreach
        steps = [
            {
                "delay_days": 0,
                "subject": "Quick question about your trading setup",
                "body": "Hi there,\n\nI noticed you're active in the trading space..."
            },
            {
                "delay_days": 3,
                "subject": "Following up - trading automation",
                "body": "Hey, just following up on my previous email..."
            },
            {
                "delay_days": 7,
                "subject": "Last try - trading bot opportunity",
                "body": "Hi, this is my last email. Wanted to share..."
            }
        ]
        seq_manager.create_sequence(args.create_sequence, steps)
    
    elif args.sequence:
        if not args.to:
            print("❌ Need --to for sequence")
            return
        seq_manager = FollowUpSequence()
        seq_manager.start_sequence(args.sequence, args.to, sender)
    
    elif args.to and args.subject:
        body = args.body
        if args.body_file:
            with open(args.body_file) as f:
                body = f.read()
        
        if not body:
            print("❌ Need --body or --body-file")
            return
        
        sender.send(args.to, args.subject, body, args.html)
    
    else:
        print("Usage examples:")
        print("  Send email: python email_sender.py --to test@example.com --subject 'Hi' --body 'Hello'")
        print("  Use sequence: python email_sender.py --to test@example.com --sequence cold_outreach")


if __name__ == "__main__":
    main()
