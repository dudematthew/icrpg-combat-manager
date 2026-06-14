<?php
/**
 * CLI: validate backup JSON against PHP server rules.
 * Usage: php tests/backup-api/validate-payload.php < path/to/backup.json
 * Exit 0 if valid, 1 with error message on stderr if invalid.
 */

declare(strict_types=1);

require_once __DIR__ . '/../../public/backup-api-lib.php';

$raw = '';
if ($argc > 1) {
    $raw = file_get_contents($argv[1]);
    if ($raw === false) {
        fwrite(STDERR, "Could not read {$argv[1]}.\n");
        exit(1);
    }
} else {
    $raw = stream_get_contents(STDIN);
}
if ($raw === false || trim($raw) === '') {
    fwrite(STDERR, "No input.\n");
    exit(1);
}

$decoded = json_decode($raw, true, 512);
$error = backup_api_validate_envelope_detailed($decoded);
if ($error !== null) {
    fwrite(STDERR, $error . "\n");
    exit(1);
}

echo "OK\n";
exit(0);
