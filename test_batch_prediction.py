#!/usr/bin/env python3
"""
Test script for Swimming Pauls v2.1 Batch Prediction System
Tests batch_predict() with 50, 100, and 1000 Pauls using mock mode
"""

import sys
import time
sys.path.insert(0, '/Users/brain/.openclaw/workspace/swimming_pauls')

from persona_factory import generate_swimming_pauls_pool
from skill_bridge import BatchPredictionEngine


def test_batch_prediction(paul_count: int):
    """Test batch prediction with specified number of Pauls."""
    print(f"\n{'='*60}")
    print(f"🧪 Testing Batch Prediction with {paul_count} Pauls")
    print(f"{'='*60}")
    
    # Generate Paul personas
    print(f"\n📊 Generating {paul_count} Paul personas...")
    start = time.time()
    pauls = generate_swimming_pauls_pool(count=paul_count)
    gen_time = time.time() - start
    print(f"   ✓ Generated {len(pauls)} personas in {gen_time:.2f}s")
    
    # Create batch engine
    print(f"\n🔌 Initializing batch prediction engine...")
    engine = BatchPredictionEngine()
    
    # Test question
    question = "Will Bitcoin reach $100,000 by the end of 2025?"
    
    print(f"\n🎯 Question: {question}")
    print(f"\n🚀 Running batch prediction (single API call)...")
    print(f"   Note: Using mock mode (no API key required for testing)")
    start = time.time()
    
    try:
        predictions = engine.batch_predict(question, pauls)
        batch_time = time.time() - start
        
        print(f"   ✓ Batch prediction complete in {batch_time:.2f}s")
        print(f"   ✓ Received {len(predictions)} predictions")
        
        # Verify structure
        print(f"\n🔍 Verifying prediction structure...")
        for i, pred in enumerate(predictions[:3]):
            print(f"   Prediction {i+1}:")
            print(f"     - paul_name: {pred.paul_name}")
            print(f"     - sentiment: {pred.sentiment}")
            print(f"     - confidence: {pred.confidence}")
            print(f"     - reasoning: {pred.reasoning[:60]}...")
        
        # Analyze results
        sentiments = {"bullish": 0, "bearish": 0, "neutral": 0}
        total_confidence = 0.0
        
        for pred in predictions:
            sentiments[pred.sentiment] += 1
            total_confidence += pred.confidence
        
        avg_confidence = total_confidence / len(predictions) if predictions else 0
        
        print(f"\n📈 Results Summary:")
        print(f"   - Bullish: {sentiments['bullish']} ({sentiments['bullish']/len(predictions)*100:.1f}%)")
        print(f"   - Bearish: {sentiments['bearish']} ({sentiments['bearish']/len(predictions)*100:.1f}%)")
        print(f"   - Neutral: {sentiments['neutral']} ({sentiments['neutral']/len(predictions)*100:.1f}%)")
        print(f"   - Avg Confidence: {avg_confidence:.2f}")
        
        # Verify all predictions have unique Paul names
        paul_names = [p.paul_name for p in predictions]
        unique_names = set(paul_names)
        print(f"\n✅ Unique Pauls: {len(unique_names)}/{len(predictions)}")
        
        return {
            "success": True,
            "paul_count": paul_count,
            "predictions": len(predictions),
            "batch_time": batch_time,
            "sentiments": sentiments,
            "avg_confidence": avg_confidence
        }
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "paul_count": paul_count,
            "error": str(e)
        }


def main():
    print("\n" + "="*60)
    print("🦷 SWIMMING PAULS v2.1 - BATCH PREDICTION TEST SUITE")
    print("="*60)
    print("\nNote: This test uses mock mode (no API key required)")
    print("      In production, set OPENROUTER_API_KEY or KIMI_API_KEY")
    
    results = []
    
    # Test with 50 Pauls
    result_50 = test_batch_prediction(50)
    results.append(result_50)
    
    # Test with 100 Pauls
    result_100 = test_batch_prediction(100)
    results.append(result_100)
    
    # Test with 1000 Pauls
    result_1000 = test_batch_prediction(1000)
    results.append(result_1000)
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    for r in results:
        if r["success"]:
            print(f"\n✅ {r['paul_count']} Pauls: {r['predictions']} predictions in {r['batch_time']:.2f}s")
            print(f"   Sentiment: Bullish={r['sentiments']['bullish']}, Bearish={r['sentiments']['bearish']}, Neutral={r['sentiments']['neutral']}")
        else:
            print(f"\n❌ {r['paul_count']} Pauls: FAILED - {r.get('error', 'Unknown error')}")
    
    print("\n" + "="*60)
    print("🎉 All tests completed!")
    print("="*60)


if __name__ == "__main__":
    main()
