-- Migration: add keyPrefix to ApiKey
-- Stores the first 12 characters of the raw API key at creation time.
-- Enables masked display (e.g. "mm8_a1b2c3d4...") without re-deriving from hash.

ALTER TABLE "ApiKey" ADD COLUMN "keyPrefix" TEXT NOT NULL DEFAULT '';
