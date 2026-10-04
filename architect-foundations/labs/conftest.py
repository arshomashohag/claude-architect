"""Makes the lab modules importable from tests/.

By default the tests run against your files in this folder. To check the reference
solutions instead, run:  LAB_TARGET=solutions pytest
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TARGET = os.path.join(HERE, "solutions") if os.environ.get("LAB_TARGET") == "solutions" else HERE
sys.path.insert(0, TARGET)
