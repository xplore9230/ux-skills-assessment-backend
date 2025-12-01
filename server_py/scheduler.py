"""
Simple Scheduler for Weekly Social Content Updates
==================================================

Uses the `schedule` library to periodically run the ContentAggregator.
In production you would typically invoke this module from a process
manager or run the aggregator via cron instead.
"""

from __future__ import annotations

import logging
import time

import schedule  # type: ignore

from content_aggregator import ContentAggregator


logger = logging.getLogger(__name__)


def run_weekly_job() -> None:
    """
    Run a single aggregation pass and log the summary.
    """
    logger.info("Scheduler: starting weekly social content aggregation")
    aggregator = ContentAggregator()
    summary = aggregator.run_full_update()
    logger.info("Scheduler: aggregation summary: %s", summary)


def start_scheduler() -> None:
    """
    Start the in‑process scheduler loop.

    NOTE: In many deployments it's better to configure a system cron
    job that runs a one‑off script calling `run_weekly_job()` instead
    of keeping a Python process running. This helper is provided for
    flexibility and local experimentation.
    """
    # For now we schedule it to run every week; for local testing you
    # might change this to every hour or minute.
    schedule.every().week.do(run_weekly_job)

    logger.info("Scheduler: started weekly job, entering loop")
    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":  # pragma: no cover - manual entry point
    logging.basicConfig(level=logging.INFO)
    start_scheduler()



