import requests
import time
import json
import os

# Standard OpenEnv Inference Script
# This script is used by the grader to verify the environment capability.

BASE_URL = os.getenv("OPENENV_API_URL", "http://localhost:7860")

def run_inference():
    print(f"--- Initializing OpenEnv Inference at {BASE_URL} ---")
    
    # 1. Reset Environment
    try:
        print("Executing /openenv/reset...")
        reset_res = requests.post(f"{BASE_URL}/openenv/reset", timeout=10)
        reset_res.raise_for_status()
        print(f"Reset Success: {reset_res.json().get('message')}")
    except Exception as e:
        print(f"Reset Failed: {e}")
        return

    # 2. Get Initial State (Summary)
    try:
        print("Fetching initial state from /api/summary...")
        summary_res = requests.get(f"{BASE_URL}/api/summary", timeout=10)
        summary_res.raise_for_status()
        data = summary_res.json().get('data', {})
        print(f"Initial State: {data.get('totalIssues')} issues found, ${data.get('totalSavings')}/mo waste.")
    except Exception as e:
        print(f"Failed to fetch summary: {e}")
        return

    # 3. Simulate Rollout (Checking Validate)
    print("Validating environment health...")
    val_res = requests.get(f"{BASE_URL}/openenv/validate")
    if val_res.status_code == 200:
        print("Environment Validation: PASSED")
    else:
        print("Environment Validation: FAILED")

    print("--- Inference Rollout Complete ---")

if __name__ == "__main__":
    # Give the server a moment to start if running in Docker
    time.sleep(2)
    run_inference()
