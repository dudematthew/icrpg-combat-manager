<?php
/**
 * ICRPG Combat Manager — cloud backup API
 *
 * Manual test (replace BASE with your deploy URL):
 *   curl "$BASE/backup-api.php?available"
 *   curl -X POST "$BASE/backup-api.php" -H "Content-Type: application/json" -d '{"backup":{...}}'
 *   curl "$BASE/backup-api.php?slug=word-word-word-word"
 *   curl -X POST "$BASE/backup-api.php" -H "Content-Type: application/json" -d '{"action":"update","slug":"...","writeToken":"...","backup":{...}}'
 */

declare(strict_types=1);

require_once __DIR__ . '/backup-api-lib.php';

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

backup_api_run();
