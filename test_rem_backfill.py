"""
Tests for REM Backfill System

Verifies:
- Import from prediction_history.db
- Import from CSV/JSON
- Backfill dreams/thoughts
- Diary timeline queries
- Data integrity (no corruption)

Author: Howard (H.O.W.A.R.D)
"""

import unittest
import sqlite3
import json
import csv
import tempfile
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

from rem_backfill import REMBackfillEngine, DiaryEntry, REMInsight


class TestREMBackfill(unittest.TestCase):
    """Test suite for REM Backfill system."""
    
    def setUp(self):
        """Set up test database."""
        self.temp_dir = tempfile.mkdtemp()
        self.db_path = Path(self.temp_dir) / "test_paul_world.db"
        self.engine = REMBackfillEngine(db_path=str(self.db_path))
    
    def tearDown(self):
        """Clean up test database."""
        if self.db_path.exists():
            self.db_path.unlink()
        os.rmdir(self.temp_dir)
    
    def test_database_initialization(self):
        """Test that database tables are created correctly."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = {row[0] for row in cursor.fetchall()}
        
        self.assertIn('rem_insights', tables)
        self.assertIn('diary_entries', tables)
        self.assertIn('rem_sessions', tables)
        self.assertIn('backfill_log', tables)
        
        conn.close()
    
    def test_save_and_retrieve_diary_entry(self):
        """Test saving and retrieving a diary entry."""
        entry = DiaryEntry(
            entry_id="test_001",
            paul_name="Visionary Paul",
            entry_type="dream",
            content="Dreamed about BTC reaching $100K",
            timestamp=datetime.now(),
            location="dreamscape",
            mood=0.8,
            energy=75.0,
            metadata={'test': True}
        )
        
        # Save entry
        self.engine._save_diary_entry(entry)
        
        # Retrieve entry
        entries = self.engine.get_diary_timeline(paul_name="Visionary Paul", days=1)
        
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0].entry_id, "test_001")
        self.assertEqual(entries[0].content, "Dreamed about BTC reaching $100K")
        self.assertEqual(entries[0].metadata['test'], True)
    
    def test_import_from_prediction_history(self):
        """Test importing from prediction_history.db format."""
        # Create a mock prediction database
        pred_db_path = Path(self.temp_dir) / "test_predictions.db"
        conn = sqlite3.connect(pred_db_path)
        cursor = conn.cursor()
        
        # Create predictions table
        cursor.execute('''
            CREATE TABLE predictions (
                id TEXT PRIMARY KEY,
                timestamp TEXT,
                question TEXT,
                consensus_direction TEXT,
                consensus_confidence REAL,
                sentiment_score REAL,
                pauls_count INTEGER
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE paul_votes (
                id INTEGER PRIMARY KEY,
                prediction_id TEXT,
                paul_name TEXT,
                vote_direction TEXT,
                confidence REAL,
                reasoning TEXT
            )
        ''')
        
        # Insert test data
        cursor.execute('''
            INSERT INTO predictions VALUES 
            ('pred_001', ?, 'Will BTC reach 100K?', 'BULLISH', 0.75, 0.6, 100)
        ''', (datetime.now().isoformat(),))
        
        cursor.execute('''
            INSERT INTO paul_votes VALUES 
            (1, 'pred_001', 'Visionary Paul', 'BULLISH', 0.85, 'Strong momentum'),
            (2, 'pred_001', 'Skeptic Paul', 'NEUTRAL', 0.55, 'Uncertain macro')
        ''')
        
        conn.commit()
        conn.close()
        
        # Import from prediction database
        result = self.engine.import_from_prediction_history(str(pred_db_path))
        
        self.assertGreater(result['entries_created'], 0)
        self.assertIn('Visionary Paul', result['pauls_affected'])
        self.assertIn('Skeptic Paul', result['pauls_affected'])
        
        # Verify entries were created
        entries = self.engine.get_diary_timeline(days=1)
        self.assertGreater(len(entries), 0)
        
        # Clean up
        pred_db_path.unlink()
    
    def test_import_from_csv(self):
        """Test importing diary entries from CSV."""
        csv_path = Path(self.temp_dir) / "test_entries.csv"
        
        with open(csv_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['paul_name', 'entry_type', 'content', 'timestamp', 'mood', 'energy'])
            writer.writerow(['Trader Paul', 'thought', 'Feeling bullish today', datetime.now().isoformat(), '0.7', '85'])
            writer.writerow(['Professor Paul', 'activity', 'Researching macro trends', datetime.now().isoformat(), '0.5', '90'])
        
        result = self.engine.import_from_csv(str(csv_path))
        
        self.assertEqual(result['entries_created'], 2)
        self.assertEqual(len(result['errors']), 0)
        
        # Verify entries
        entries = self.engine.get_diary_timeline(days=1)
        self.assertEqual(len(entries), 2)
        
        # Clean up
        csv_path.unlink()
    
    def test_import_from_json(self):
        """Test importing diary entries from JSON."""
        json_path = Path(self.temp_dir) / "test_entries.json"
        
        data = {
            'entries': [
                {
                    'entry_id': 'json_001',
                    'paul_name': 'Degen Paul',
                    'entry_type': 'dream',
                    'content': 'Dreamed of 100x gains',
                    'timestamp': datetime.now().isoformat(),
                    'mood': 0.9,
                    'energy': 60.0,
                    'metadata': {'source': 'test'}
                },
                {
                    'entry_id': 'json_002',
                    'paul_name': 'Whale Paul',
                    'entry_type': 'thought',
                    'content': 'Institutional money is flowing in',
                    'timestamp': datetime.now().isoformat(),
                    'mood': 0.8,
                    'energy': 95.0,
                }
            ]
        }
        
        with open(json_path, 'w') as f:
            json.dump(data, f)
        
        result = self.engine.import_from_json(str(json_path))
        
        self.assertEqual(result['entries_created'], 2)
        self.assertIn('Degen Paul', result['pauls_affected'])
        self.assertIn('Whale Paul', result['pauls_affected'])
        
        # Clean up
        json_path.unlink()
    
    def test_backfill_dreams(self):
        """Test generating retroactive dreams."""
        pauls = ['Visionary Paul', 'Trader Paul']
        result = self.engine.backfill_dreams(pauls, days=7)
        
        self.assertGreater(result['entries_created'], 0)
        self.assertEqual(result['pauls_affected'], pauls)
        self.assertEqual(result['days_covered'], 7)
        
        # Verify dreams were created
        entries = self.engine.get_diary_timeline(entry_types=['dream'])
        self.assertGreater(len(entries), 0)
        
        # Check dream properties
        for entry in entries:
            self.assertEqual(entry.entry_type, 'dream')
            self.assertEqual(entry.location, 'dreamscape')
            self.assertIn('dream_phase', entry.metadata)
    
    def test_backfill_thoughts(self):
        """Test generating retroactive thoughts."""
        pauls = ['Skeptic Paul']
        result = self.engine.backfill_thoughts(pauls, count=3)
        
        self.assertEqual(result['entries_created'], 3)
        self.assertEqual(result['pauls_affected'], pauls)
        
        # Verify thoughts - query without type filter since timestamps might vary
        entries = self.engine.get_diary_timeline(paul_name='Skeptic Paul', days=30)
        self.assertGreaterEqual(len(entries), 3)
    
    def test_diary_timeline_filtering(self):
        """Test filtering diary entries by type and date."""
        # Create entries of different types
        for i, entry_type in enumerate(['dream', 'thought', 'activity', 'prediction']):
            entry = DiaryEntry(
                entry_id=f"filter_{i}",
                paul_name="Test Paul",
                entry_type=entry_type,
                content=f"Test {entry_type}",
                timestamp=datetime.now() - timedelta(hours=i),
                mood=0.5,
                energy=80.0,
            )
            self.engine._save_diary_entry(entry)
        
        # Test type filtering
        dreams = self.engine.get_diary_timeline(paul_name="Test Paul", entry_types=['dream'])
        self.assertEqual(len(dreams), 1)
        self.assertEqual(dreams[0].entry_type, 'dream')
        
        # Test multiple types
        mixed = self.engine.get_diary_timeline(paul_name="Test Paul", entry_types=['dream', 'thought'])
        self.assertEqual(len(mixed), 2)
    
    def test_data_integrity_no_corruption(self):
        """Verify that backfill operations don't corrupt existing data."""
        # Create initial data
        initial_entry = DiaryEntry(
            entry_id="initial_001",
            paul_name="Original Paul",
            entry_type="thought",
            content="Original thought",
            timestamp=datetime.now() - timedelta(days=1),
            mood=0.5,
            energy=80.0,
        )
        self.engine._save_diary_entry(initial_entry)
        
        # Get initial count (all Pauls)
        initial_entries = self.engine.get_diary_timeline(days=30)
        initial_count = len(initial_entries)
        
        # Perform multiple backfill operations
        self.engine.backfill_dreams(['New Paul'], days=5)
        self.engine.backfill_thoughts(['Another Paul'], count=2)
        
        # Verify original data is intact
        final_entries = self.engine.get_diary_timeline(days=30)
        original_entries = [e for e in final_entries if e.paul_name == "Original Paul"]
        
        self.assertEqual(len(original_entries), 1)
        self.assertEqual(original_entries[0].content, "Original thought")
        self.assertEqual(original_entries[0].entry_id, "initial_001")
        
        # Verify total count increased (new data added, not replaced)
        self.assertGreater(len(final_entries), initial_count)
    
    def test_world_timeline(self):
        """Test getting world timeline with all Pauls."""
        # Create entries for multiple Pauls
        for paul in ['Paul A', 'Paul B', 'Paul C']:
            entry = DiaryEntry(
                entry_id=f"world_{paul}",
                paul_name=paul,
                entry_type='activity',
                content=f'{paul} activity',
                timestamp=datetime.now(),
            )
            self.engine._save_diary_entry(entry)
        
        timeline = self.engine.get_world_timeline(days=1)
        
        self.assertEqual(len(timeline), 3)
        paul_names = {e['paul_name'] for e in timeline}
        self.assertEqual(paul_names, {'Paul A', 'Paul B', 'Paul C'})
    
    def test_get_pauls_with_entries(self):
        """Test getting list of Pauls with entries."""
        # Create entries for specific Pauls
        for paul in ['Active Paul', 'Busy Paul']:
            for i in range(3):
                entry = DiaryEntry(
                    entry_id=f"{paul}_{i}",
                    paul_name=paul,
                    entry_type='thought',
                    content=f'Thought {i}',
                    timestamp=datetime.now() - timedelta(hours=i),
                )
                self.engine._save_diary_entry(entry)
        
        pauls = self.engine.get_pauls_with_entries()
        
        self.assertEqual(len(pauls), 2)
        for p in pauls:
            self.assertEqual(p['entry_count'], 3)
            self.assertIn('last_entry', p)
    
    def test_diary_entry_from_dict(self):
        """Test creating DiaryEntry from dictionary."""
        data = {
            'entry_id': 'dict_001',
            'paul_name': 'Dict Paul',
            'entry_type': 'dream',
            'content': 'Test content',
            'timestamp': datetime.now().isoformat(),
            'location': 'home',
            'mood': 0.7,
            'energy': 85.0,
            'related_pauls': ['Paul A', 'Paul B'],
            'metadata': {'key': 'value'}
        }
        
        entry = DiaryEntry.from_dict(data)
        
        self.assertEqual(entry.entry_id, 'dict_001')
        self.assertEqual(entry.paul_name, 'Dict Paul')
        self.assertEqual(entry.related_pauls, ['Paul A', 'Paul B'])
        self.assertEqual(entry.metadata['key'], 'value')
    
    def test_backfill_history_logging(self):
        """Test that backfill operations are logged."""
        # Perform a backfill
        self.engine.backfill_dreams(['Test Paul'], days=5)
        
        # Check history
        history = self.engine.get_backfill_history(limit=10)
        
        self.assertGreater(len(history), 0)
        latest = history[0]
        self.assertEqual(latest['source_type'], 'dreams')
        self.assertGreater(latest['records_imported'], 0)


class TestREMBackfillIntegration(unittest.TestCase):
    """Integration tests with Paul's World."""
    
    def setUp(self):
        """Set up test environment."""
        self.temp_dir = tempfile.mkdtemp()
        self.db_path = Path(self.temp_dir) / "integration_test.db"
        self.engine = REMBackfillEngine(db_path=str(self.db_path))
    
    def tearDown(self):
        """Clean up."""
        if self.db_path.exists():
            self.db_path.unlink()
        os.rmdir(self.temp_dir)
    
    def test_multiple_imports_idempotent(self):
        """Test that running imports multiple times doesn't duplicate entries."""
        # Create a JSON file
        json_path = Path(self.temp_dir) / "entries.json"
        data = {
            'entries': [
                {
                    'entry_id': 'unique_001',
                    'paul_name': 'Unique Paul',
                    'entry_type': 'thought',
                    'content': 'Unique content',
                    'timestamp': datetime.now().isoformat(),
                }
            ]
        }
        with open(json_path, 'w') as f:
            json.dump(data, f)
        
        # Import twice
        result1 = self.engine.import_from_json(str(json_path))
        result2 = self.engine.import_from_json(str(json_path))
        
        # Should have same entry (upsert behavior)
        entries = self.engine.get_diary_timeline(paul_name='Unique Paul')
        self.assertEqual(len(entries), 1)
        
        json_path.unlink()


def run_tests():
    """Run all tests."""
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add test classes
    suite.addTests(loader.loadTestsFromTestCase(TestREMBackfill))
    suite.addTests(loader.loadTestsFromTestCase(TestREMBackfillIntegration))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    return result.wasSuccessful()


if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
