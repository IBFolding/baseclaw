#!/usr/bin/env python3
"""
Database Manager - PostgreSQL management and queries.
Usage: python db_manager.py --query "SELECT * FROM trades"
"""

import argparse
import os
import json
from datetime import datetime
from pathlib import Path

# Try to import psycopg2, fallback to sqlite for testing
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    POSTGRES_AVAILABLE = True
except ImportError:
    POSTGRES_AVAILABLE = False
    print("⚠️  psycopg2 not installed. Using SQLite fallback for demos.")
    import sqlite3


class DatabaseManager:
    """Manage database connections and queries."""
    
    def __init__(self, connection_string: str = None):
        self.connection_string = connection_string or os.getenv("DATABASE_URL")
        self.db_type = "postgres" if POSTGRES_AVAILABLE and self.connection_string else "sqlite"
        
        if self.db_type == "sqlite":
            self.db_path = Path.home() / ".local.db"
            self._init_sqlite()
    
    def _init_sqlite(self):
        """Initialize SQLite with sample schema."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create sample tables
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trades (
                id INTEGER PRIMARY KEY,
                symbol TEXT,
                side TEXT,
                amount REAL,
                price REAL,
                timestamp TEXT,
                pnl REAL
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS positions (
                id INTEGER PRIMARY KEY,
                symbol TEXT,
                quantity REAL,
                avg_price REAL,
                unrealized_pnl REAL
            )
        """)
        
        conn.commit()
        conn.close()
    
    def get_connection(self):
        """Get database connection."""
        if self.db_type == "postgres":
            return psycopg2.connect(self.connection_string)
        else:
            return sqlite3.connect(self.db_path)
    
    def execute(self, query: str, params: tuple = None) -> list:
        """Execute a query and return results."""
        conn = self.get_connection()
        
        try:
            if self.db_type == "postgres":
                cursor = conn.cursor(cursor_factory=RealDictCursor)
            else:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
            
            cursor.execute(query, params or ())
            
            # Check if query returns results
            if cursor.description:
                results = cursor.fetchall()
                if self.db_type == "postgres":
                    return [dict(row) for row in results]
                else:
                    return [dict(row) for row in results]
            else:
                conn.commit()
                return [{"affected_rows": cursor.rowcount}]
        
        except Exception as e:
            print(f"❌ Query error: {e}")
            return []
        
        finally:
            conn.close()
    
    def migrate(self, migration_file: str):
        """Run a migration file."""
        with open(migration_file) as f:
            queries = f.read().split(";")
        
        for query in queries:
            query = query.strip()
            if query:
                self.execute(query)
        
        print(f"✅ Migration applied: {migration_file}")
    
    def backup(self, output_file: str = None):
        """Create database backup."""
        if not output_file:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"db_backup_{timestamp}.sql"
        
        if self.db_type == "sqlite":
            import shutil
            shutil.copy(self.db_path, output_file)
            print(f"✅ Backup created: {output_file}")
        else:
            # For PostgreSQL, would use pg_dump
            print("PostgreSQL backup: pg_dump -Fc database > backup.dump")
    
    def restore(self, backup_file: str):
        """Restore from backup."""
        if self.db_type == "sqlite":
            import shutil
            shutil.copy(backup_file, self.db_path)
            print(f"✅ Restored from: {backup_file}")
        else:
            print("PostgreSQL restore: pg_restore -d database backup.dump")
    
    def get_stats(self) -> dict:
        """Get database statistics."""
        if self.db_type == "sqlite":
            tables = self.execute("SELECT name FROM sqlite_master WHERE type='table'")
            stats = {"tables": [t["name"] for t in tables], "type": "sqlite"}
            
            for table in stats["tables"]:
                count = self.execute(f"SELECT COUNT(*) as count FROM {table}")[0]
                stats[f"{table}_count"] = count["count"]
            
            return stats
        else:
            # PostgreSQL stats
            return {"type": "postgres", "connection": "active"}


def main():
    parser = argparse.ArgumentParser(description="Database management tool")
    parser.add_argument("--query", help="Execute SQL query")
    parser.add_argument("--migrate", help="Run migration file")
    parser.add_argument("--backup", action="store_true", help="Create backup")
    parser.add_argument("--restore", help="Restore from backup file")
    parser.add_argument("--stats", action="store_true", help="Show database stats")
    parser.add_argument("--format", choices=["json", "table"], default="table", help="Output format")
    
    args = parser.parse_args()
    
    db = DatabaseManager()
    
    if args.query:
        results = db.execute(args.query)
        
        if args.format == "json":
            print(json.dumps(results, indent=2))
        else:
            if results:
                # Print as table
                keys = results[0].keys()
                print(" | ".join(keys))
                print("-" * 50)
                for row in results:
                    print(" | ".join(str(row[k]) for k in keys))
    
    elif args.migrate:
        db.migrate(args.migrate)
    
    elif args.backup:
        db.backup()
    
    elif args.restore:
        db.restore(args.restore)
    
    elif args.stats:
        stats = db.get_stats()
        print(json.dumps(stats, indent=2))
    
    else:
        print("Database Manager")
        print("\nExamples:")
        print("  Query: python db_manager.py --query 'SELECT * FROM trades'")
        print("  Migrate: python db_manager.py --migrate schema.sql")
        print("  Backup: python db_manager.py --backup")


if __name__ == "__main__":
    main()
