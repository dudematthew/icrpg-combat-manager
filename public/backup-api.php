<?php
/**
 * ICRPG Combat Manager — cloud backup API
 *
 * Manual test (replace BASE with your deploy URL):
 *   curl "$BASE/backup-api.php?available"
 *   curl -X POST "$BASE/backup-api.php" -H "Content-Type: application/json" -d '{"backup":{...}}'
 *   curl "$BASE/backup-api.php?slug=word-word-word-word"
 *   curl -X PUT "$BASE/backup-api.php" -H "Content-Type: application/json" -d '{"slug":"...","writeToken":"...","backup":{...}}'
 */

declare(strict_types=1);

const DATA_DIR = __DIR__ . '/backup-data';
const RATE_DIR = __DIR__ . '/backup-data/.rate-limit';
const RETENTION_DAYS = 180;
const MAX_BYTES = 2_000_000;
const API_VERSION = 1;
const BACKUP_FORMAT = 'icrpg-combat-manager-backup';
const SLUG_PATTERN = '/^[a-z]{3,12}(-[a-z]{3,12}){3}$/';
/** Per-IP limits (rolling 24 h windows). */
const RATE_LIMIT_DAY = 86_400;
const RATE_LIMIT_CREATE_MAX = 30;   // new backup files per IP per day
const RATE_LIMIT_UPDATE_MAX = 100;  // overwrites per IP per day (no new files)
const RATE_LIMIT_READ_MAX = 300;    // imports / slug reads per IP per day
/** Storage caps — prevent one IP or the whole server from filling disk. */
const MAX_STORED_BACKUPS_PER_IP = 30;
const MAX_TOTAL_BACKUPS = 10_000;

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $status, array $payload): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function respondError(int $status, string $message): void
{
    respond($status, ['ok' => false, 'error' => $message]);
}

function ensureDataDir(): void
{
    if (!is_dir(DATA_DIR) && !mkdir(DATA_DIR, 0750, true)) {
        respondError(500, 'Storage unavailable.');
    }
    if (!is_dir(RATE_DIR) && !mkdir(RATE_DIR, 0750, true)) {
        respondError(500, 'Storage unavailable.');
    }
}

function clientIp(): string
{
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', (string) $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }
    return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
}

function clientIpHash(): string
{
    $ip = preg_replace('/[^a-zA-Z0-9.:_-]/', '', clientIp()) ?: 'unknown';
    return hash('sha256', $ip);
}

function rateLimitCheck(string $action, int $max, int $windowSeconds): void
{
    $file = RATE_DIR . '/' . hash('sha256', clientIpHash() . '|' . $action) . '.json';
    $now = time();
    $fp = fopen($file, 'c+');
    if ($fp === false) {
        respondError(500, 'Storage unavailable.');
    }

    try {
        if (!flock($fp, LOCK_EX)) {
            respondError(503, 'Server busy. Try again.');
        }

        $raw = stream_get_contents($fp);
        $data = ['count' => 0, 'reset' => $now + $windowSeconds];
        if ($raw !== false && $raw !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded) && isset($decoded['count'], $decoded['reset']) && (int) $decoded['reset'] > $now) {
                $data = $decoded;
            }
        }

        if ((int) $data['count'] >= $max) {
            $retryAfter = max(1, (int) $data['reset'] - $now);
            header('Retry-After: ' . (string) $retryAfter);
            respondError(429, 'Too many requests. Try again later.');
        }

        $data['count'] = (int) $data['count'] + 1;
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($data));
        fflush($fp);
    } finally {
        flock($fp, LOCK_UN);
        fclose($fp);
    }
}

function countBackupFiles(): int
{
    $files = glob(DATA_DIR . '/*.json');
    return $files === false ? 0 : count($files);
}

function countStoredBackupsForIp(string $ipHash): int
{
    $count = 0;
    foreach (glob(DATA_DIR . '/*.json') ?: [] as $path) {
        $raw = file_get_contents($path);
        if ($raw === false) {
            continue;
        }
        $record = json_decode($raw, true);
        if (!is_array($record)) {
            continue;
        }
        if (($record['creatorIpHash'] ?? '') === $ipHash) {
            $count++;
        }
    }
    return $count;
}

function rejectOversizedBody(): void
{
    if (!isset($_SERVER['CONTENT_LENGTH'])) {
        return;
    }

    $contentLength = filter_var($_SERVER['CONTENT_LENGTH'], FILTER_VALIDATE_INT);
    if ($contentLength === false) {
        respondError(400, 'Invalid Content-Length header.');
    }
    if ($contentLength <= 0) {
        respondError(400, 'Empty request body.');
    }
    if ($contentLength > MAX_BYTES) {
        respondError(413, 'Backup too large (max ' . number_format(MAX_BYTES) . ' bytes).');
    }
}

function purgeExpired(): void
{
    if (!is_dir(DATA_DIR)) {
        return;
    }
    $cutoff = time() - (RETENTION_DAYS * 86400);
    foreach (glob(DATA_DIR . '/*.json') ?: [] as $path) {
        $raw = file_get_contents($path);
        if ($raw === false) {
            continue;
        }
        $record = json_decode($raw, true);
        if (!is_array($record) || empty($record['updatedAt'])) {
            @unlink($path);
            continue;
        }
        $updated = strtotime((string) $record['updatedAt']);
        if ($updated !== false && $updated < $cutoff) {
            @unlink($path);
        }
    }
}

function validateSlug(string $slug): bool
{
    return (bool) preg_match(SLUG_PATTERN, $slug);
}

function slugFilePath(string $slug): string
{
    return DATA_DIR . '/' . $slug . '.json';
}

function readRequestBodyRaw(): string
{
    $stream = fopen('php://input', 'rb');
    if ($stream === false) {
        respondError(400, 'Could not read request body.');
    }

    $raw = '';
    $read = 0;

    try {
        while (!feof($stream)) {
            $chunk = fread($stream, min(8192, MAX_BYTES - $read + 1));
            if ($chunk === false) {
                respondError(400, 'Could not read request body.');
            }
            if ($chunk === '') {
                break;
            }

            $read += strlen($chunk);
            if ($read > MAX_BYTES) {
                respondError(413, 'Backup too large (max ' . number_format(MAX_BYTES) . ' bytes).');
            }

            $raw .= $chunk;
        }
    } finally {
        fclose($stream);
    }

    return $raw;
}

function readJsonBody(): array
{
    $raw = readRequestBodyRaw();
    if ($raw === '') {
        respondError(400, 'Empty request body.');
    }

    $decoded = json_decode($raw, true, 8);
    if (!is_array($decoded)) {
        respondError(400, 'Invalid JSON body.');
    }
    return $decoded;
}

/** PHP json_decode turns `{}` into `[]`; restore empty cards map for JSON output. */
function normalizeBackupEnvelope(array $backup): array
{
    if (
        isset($backup['data']['boards']['cards'])
        && is_array($backup['data']['boards']['cards'])
        && $backup['data']['boards']['cards'] === []
    ) {
        $backup['data']['boards']['cards'] = new stdClass();
    }
    return $backup;
}

function validateBackupEnvelope(mixed $backup): bool
{
    if (!is_array($backup)) {
        return false;
    }
    if (($backup['format'] ?? '') !== BACKUP_FORMAT) {
        return false;
    }
    if (($backup['version'] ?? 0) !== 1) {
        return false;
    }
    if (!isset($backup['data']) || !is_array($backup['data'])) {
        return false;
    }
    if (!isset($backup['data']['combat'], $backup['data']['boards'], $backup['data']['settings'])) {
        return false;
    }
    return true;
}

function atomicWrite(string $path, string $contents): bool
{
    $dir = dirname($path);
    $tmp = tempnam($dir, 'bak_');
    if ($tmp === false) {
        return false;
    }
    $ok = file_put_contents($tmp, $contents, LOCK_EX) !== false;
    if (!$ok) {
        @unlink($tmp);
        return false;
    }
    if (!rename($tmp, $path)) {
        @unlink($tmp);
        return false;
    }
    return true;
}

/** @return list<string> */
function wordList(): array
{
    return [
        'apple', 'amber', 'anchor', 'arrow', 'atlas', 'aurora', 'badger', 'bamboo', 'banjo', 'beacon',
        'berry', 'blaze', 'bloom', 'breeze', 'bronze', 'bubble', 'cactus', 'candle', 'canyon', 'carbon',
        'cedar', 'charm', 'cider', 'cobalt', 'comet', 'coral', 'cosmos', 'cotton', 'crystal', 'daisy',
        'delta', 'disco', 'dolphin', 'dragon', 'druid', 'eagle', 'ember', 'fable', 'falcon', 'fern',
        'flame', 'flint', 'forest', 'frost', 'galaxy', 'garden', 'ghost', 'glacier', 'goblin', 'golden',
        'grape', 'harbor', 'hazel', 'honey', 'horizon', 'island', 'ivory', 'jade', 'jolly', 'jungle',
        'knight', 'lagoon', 'laser', 'lemon', 'light', 'linen', 'lotus', 'lunar', 'magic', 'maple',
        'marble', 'meadow', 'melon', 'mercury', 'mighty', 'minty', 'mirror', 'misty', 'monkey', 'moon',
        'mossy', 'nebula', 'nectar', 'noble', 'nova', 'ocean', 'olive', 'onyx', 'orange', 'orchid',
        'otter', 'panda', 'pearl', 'pebble', 'phoenix', 'pixel', 'planet', 'plasma', 'plume', 'prism',
        'pumpkin', 'quartz', 'quest', 'quiet', 'rabbit', 'radar', 'rain', 'raven', 'river', 'robin',
        'rocket', 'ruby', 'sage', 'satin', 'shadow', 'shield', 'silver', 'smoke', 'snail', 'solar',
        'spark', 'spice', 'spirit', 'spruce', 'stone', 'storm', 'sugar', 'sunset', 'swift', 'tiger',
        'toast', 'topaz', 'torch', 'tower', 'tulip', 'turbo', 'twilight', 'velvet', 'violet', 'vortex',
        'walnut', 'wave', 'whale', 'wheat', 'willow', 'wizard', 'wonder', 'zephyr', 'zenith', 'zesty',
        'terminator', 'juggly', 'nimble', 'brisk', 'crisp', 'dusty', 'frosty', 'glossy', 'hasty', 'lucky',
        'mellow', 'plucky', 'quirky', 'rusty', 'salty', 'silky', 'snappy', 'sturdy', 'tangy', 'witty',
    ];
}

function generateSlug(): string
{
    $words = wordList();
    $count = count($words);
    $parts = [];
    for ($i = 0; $i < 4; $i++) {
        $parts[] = $words[random_int(0, $count - 1)];
    }
    return implode('-', $parts);
}

function uniqueSlug(): string
{
    for ($attempt = 0; $attempt < 50; $attempt++) {
        $slug = generateSlug();
        if (!is_file(slugFilePath($slug))) {
            return $slug;
        }
    }
    respondError(500, 'Could not allocate backup code.');
}

ensureDataDir();
purgeExpired();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET' && isset($_GET['available'])) {
    respond(200, [
        'ok' => true,
        'version' => API_VERSION,
        'retentionDays' => RETENTION_DAYS,
        'maxBytes' => MAX_BYTES,
    ]);
}

if ($method === 'GET' && isset($_GET['slug'])) {
    rateLimitCheck('read', RATE_LIMIT_READ_MAX, RATE_LIMIT_DAY);
    $slug = trim((string) $_GET['slug']);
    if (!validateSlug($slug)) {
        respondError(400, 'Invalid backup code.');
    }
    $path = slugFilePath($slug);
    if (!is_file($path)) {
        respondError(404, 'Backup not found.');
    }
    $raw = file_get_contents($path);
    $record = $raw ? json_decode($raw, true) : null;
    if (!is_array($record) || empty($record['backup']) || !is_array($record['backup'])) {
        respondError(500, 'Backup file is corrupted.');
    }
    respond(200, ['ok' => true, 'backup' => normalizeBackupEnvelope($record['backup'])]);
}

if ($method === 'POST') {
    rateLimitCheck('create', RATE_LIMIT_CREATE_MAX, RATE_LIMIT_DAY);

    if (countBackupFiles() >= MAX_TOTAL_BACKUPS) {
        respondError(503, 'Server backup storage is full.');
    }

    $ipHash = clientIpHash();
    if (countStoredBackupsForIp($ipHash) >= MAX_STORED_BACKUPS_PER_IP) {
        respondError(429, 'You already have the maximum number of server backups. Delete old ones or update an existing backup.');
    }

    $contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
    if (strpos($contentType, 'application/json') === false) {
        respondError(415, 'Content-Type must be application/json.');
    }
    rejectOversizedBody();
    $body = readJsonBody();
    if (!isset($body['backup']) || !validateBackupEnvelope($body['backup'])) {
        respondError(400, 'Invalid backup payload.');
    }

    $slug = uniqueSlug();
    $writeToken = bin2hex(random_bytes(32));
    $now = gmdate('c');
    $record = [
        'slug' => $slug,
        'createdAt' => $now,
        'updatedAt' => $now,
        'creatorIpHash' => $ipHash,
        'writeTokenHash' => password_hash($writeToken, PASSWORD_DEFAULT),
        'backup' => normalizeBackupEnvelope($body['backup']),
    ];

    if (!atomicWrite(slugFilePath($slug), json_encode($record, JSON_UNESCAPED_SLASHES))) {
        respondError(500, 'Could not save backup.');
    }

    respond(201, ['ok' => true, 'slug' => $slug, 'writeToken' => $writeToken]);
}

if ($method === 'PUT') {
    rateLimitCheck('update', RATE_LIMIT_UPDATE_MAX, RATE_LIMIT_DAY);
    $contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
    if (strpos($contentType, 'application/json') === false) {
        respondError(415, 'Content-Type must be application/json.');
    }
    rejectOversizedBody();
    $body = readJsonBody();
    $slug = trim((string) ($body['slug'] ?? ''));
    $writeToken = (string) ($body['writeToken'] ?? '');
    if (!validateSlug($slug)) {
        respondError(400, 'Invalid backup code.');
    }
    if ($writeToken === '' || strlen($writeToken) < 16) {
        respondError(400, 'Invalid edit key.');
    }
    if (!isset($body['backup']) || !validateBackupEnvelope($body['backup'])) {
        respondError(400, 'Invalid backup payload.');
    }

    $path = slugFilePath($slug);
    if (!is_file($path)) {
        respondError(404, 'Backup not found.');
    }
    $raw = file_get_contents($path);
    $record = $raw ? json_decode($raw, true) : null;
    if (!is_array($record) || empty($record['writeTokenHash'])) {
        respondError(500, 'Backup file is corrupted.');
    }
    if (!password_verify($writeToken, (string) $record['writeTokenHash'])) {
        respondError(403, 'Edit key is incorrect.');
    }

    $record['updatedAt'] = gmdate('c');
    $record['backup'] = normalizeBackupEnvelope($body['backup']);
    $record['writeTokenHash'] = password_hash($writeToken, PASSWORD_DEFAULT);

    if (!atomicWrite($path, json_encode($record, JSON_UNESCAPED_SLASHES))) {
        respondError(500, 'Could not update backup.');
    }

    respond(200, ['ok' => true]);
}

respondError(405, 'Method not allowed.');
