"""
NumPy 2.0 Compatibility Shim for ChromaDB

This module MUST be imported before any chromadb imports.
It patches numpy to add back np.float_, np.uint, and np.int_ which were removed in NumPy 2.0.
ChromaDB 0.4.22 still references these attributes.
"""
import numpy as np

# Patch numpy if needed (NumPy 2.0+ compatibility)
if not hasattr(np, "float_"):
    np.float_ = np.float64  # type: ignore[attr-defined]

if not hasattr(np, "uint"):
    np.uint = np.uint64  # type: ignore[attr-defined]

if not hasattr(np, "int_"):
    np.int_ = np.int64  # type: ignore[attr-defined]

# Verify patches are in place
assert hasattr(np, "float_"), "Failed to patch np.float_"
assert hasattr(np, "uint"), "Failed to patch np.uint"
assert hasattr(np, "int_"), "Failed to patch np.int_"



