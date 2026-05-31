#!/usr/bin/env python3
"""
Client Manager - Manage your client database
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional

# Data directory
CLIENT_DIR = Path.home() / ".openclaw" / "clients"


def ensure_dir():
    """Create client directory"""
    CLIENT_DIR.mkdir(parents=True, exist_ok=True)


def get_client_filename(name: str) -> str:
    """Generate safe filename for client"""
    safe_name = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in name)
    return safe_name.replace(' ', '_').lower() + ".json"


def add_client(
    name: str,
    email: str,
    address: str = "",
    phone: str = "",
    notes: str = ""
) -> Dict:
    """Add a new client"""
    ensure_dir()
    
    client = {
        "name": name,
        "email": email,
        "address": address,
        "phone": phone,
        "notes": notes,
        "created_at": datetime.now().isoformat()
    }
    
    filename = get_client_filename(name)
    filepath = CLIENT_DIR / filename
    
    with open(filepath, 'w') as f:
        json.dump(client, f, indent=2)
    
    return client


def load_client(name: str) -> Optional[Dict]:
    """Load client by name"""
    filename = get_client_filename(name)
    filepath = CLIENT_DIR / filename
    
    if filepath.exists():
        with open(filepath) as f:
            return json.load(f)
    
    # Try to find by exact match
    for file in CLIENT_DIR.glob("*.json"):
        with open(file) as f:
            client = json.load(f)
            if client.get("name", "").lower() == name.lower():
                return client
    
    return None


def load_all_clients() -> List[Dict]:
    """Load all clients"""
    clients = []
    if CLIENT_DIR.exists():
        for file in CLIENT_DIR.glob("*.json"):
            with open(file) as f:
                clients.append(json.load(f))
    return sorted(clients, key=lambda x: x.get("name", ""))


def update_client(name: str, updates: Dict) -> bool:
    """Update client information"""
    client = load_client(name)
    if not client:
        return False
    
    client.update(updates)
    filename = get_client_filename(client["name"])
    filepath = CLIENT_DIR / filename
    
    with open(filepath, 'w') as f:
        json.dump(client, f, indent=2)
    
    return True


def delete_client(name: str) -> bool:
    """Delete a client"""
    filename = get_client_filename(name)
    filepath = CLIENT_DIR / filename
    
    if filepath.exists():
        filepath.unlink()
        return True
    return False


def display_client(client: Dict):
    """Display client details"""
    print(f"\n{'='*60}")
    print(f"👤 {client['name']}")
    print(f"{'='*60}")
    print(f"Email:   {client.get('email', 'N/A')}")
    print(f"Phone:   {client.get('phone', 'N/A')}")
    print(f"Address: {client.get('address', 'N/A')}")
    if client.get('notes'):
        print(f"Notes:   {client['notes']}")
    print(f"{'='*60}")


def list_clients():
    """List all clients"""
    clients = load_all_clients()
    
    if not clients:
        print("No clients found.")
        return
    
    print(f"\n{'='*70}")
    print(f"{'Name':<30} {'Email':<30} {'Phone':<15}")
    print(f"{'='*70}")
    
    for client in clients:
        name = client.get('name', 'N/A')[:28]
        email = client.get('email', 'N/A')[:28]
        phone = client.get('phone', 'N/A')[:15]
        print(f"{name:<30} {email:<30} {phone:<15}")
    
    print(f"{'='*70}")
    print(f"Total clients: {len(clients)}")


def main():
    from datetime import datetime
    
    parser = argparse.ArgumentParser(description='Client Manager')
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Add client
    add_parser = subparsers.add_parser('add', help='Add new client')
    add_parser.add_argument('--name', required=True, help='Client name')
    add_parser.add_argument('--email', required=True, help='Email address')
    add_parser.add_argument('--address', default='', help='Physical address')
    add_parser.add_argument('--phone', default='', help='Phone number')
    add_parser.add_argument('--notes', default='', help='Additional notes')
    
    # List clients
    subparsers.add_parser('list', help='List all clients')
    
    # Show client
    show_parser = subparsers.add_parser('show', help='Show client details')
    show_parser.add_argument('name', help='Client name')
    
    # Update client
    update_parser = subparsers.add_parser('update', help='Update client')
    update_parser.add_argument('name', help='Client name')
    update_parser.add_argument('--email', help='New email')
    update_parser.add_argument('--address', help='New address')
    update_parser.add_argument('--phone', help='New phone')
    
    # Delete client
    delete_parser = subparsers.add_parser('delete', help='Delete client')
    delete_parser.add_argument('name', help='Client name')
    
    args = parser.parse_args()
    
    if args.command == 'add':
        client = add_client(
            name=args.name,
            email=args.email,
            address=args.address,
            phone=args.phone,
            notes=args.notes
        )
        print(f"✅ Client added: {client['name']}")
        display_client(client)
    
    elif args.command == 'list':
        list_clients()
    
    elif args.command == 'show':
        client = load_client(args.name)
        if client:
            display_client(client)
        else:
            print(f"Client '{args.name}' not found")
    
    elif args.command == 'update':
        updates = {}
        if args.email:
            updates['email'] = args.email
        if args.address:
            updates['address'] = args.address
        if args.phone:
            updates['phone'] = args.phone
        
        if update_client(args.name, updates):
            print(f"✅ Client '{args.name}' updated")
        else:
            print(f"Client '{args.name}' not found")
    
    elif args.command == 'delete':
        if delete_client(args.name):
            print(f"✅ Client '{args.name}' deleted")
        else:
            print(f"Client '{args.name}' not found")
    
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
