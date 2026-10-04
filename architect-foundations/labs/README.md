# Python labs

The five code labs from the CCA‑F Architect Lab, as plain Python files. The course page runs these same files in the browser; here you can run them with pytest.

| Lab | Your file | Tests |
| --- | --- | --- |
| 1-1 Fix the agent loop | `agent_loop.py` | `tests/test_agent_loop.py` |
| 1-3 Write the refund gate | `refund_gate.py` | `tests/test_refund_gate.py` |
| 1-4 Normalize at the boundary | `normalize.py` | `tests/test_normalize.py` |
| 4-3 Retry with error feedback | `retry_extract.py` | `tests/test_retry_extract.py` |
| 4-4 Reconcile a message batch | `batch_reconcile.py` | `tests/test_batch_reconcile.py` |

```bash
cd architect-foundations/labs
pip install pytest
pytest                                   # all labs, against your files
pytest tests/test_agent_loop.py          # one lab
LAB_TARGET=solutions pytest              # check the reference solutions in solutions/
```

Each starter file is the "shipped" buggy version described in its lab. Edit it until its tests pass. The tests use only the standard library, with mock clients and models, so no API key is needed.
