<?php
/**
 * ICRPG Combat Manager — cloud backup API (shared library)
 */

declare(strict_types=1);

const BACKUP_API_RETENTION_DAYS = 180;
const BACKUP_API_MAX_BYTES = 2_000_000;
const BACKUP_API_VERSION = 1;
const BACKUP_API_FORMAT = 'icrpg-combat-manager-backup';
const BACKUP_API_SLUG_PATTERN = '/^[a-z]{3,12}(-[a-z]{3,12}){3}$/';
const BACKUP_API_RATE_LIMIT_DAY = 86_400;
const BACKUP_API_RATE_LIMIT_CREATE_MAX = 30;
const BACKUP_API_RATE_LIMIT_UPDATE_MAX = 100;
const BACKUP_API_RATE_LIMIT_READ_MAX = 300;
const BACKUP_API_MAX_STORED_BACKUPS_PER_IP = 30;
const BACKUP_API_MAX_TOTAL_BACKUPS = 10_000;

/** @var string|null Override for integration tests */
$GLOBALS['BACKUP_API_DATA_DIR'] = null;

function backup_api_data_dir(): string
{
    if ($GLOBALS['BACKUP_API_DATA_DIR'] !== null) {
        return $GLOBALS['BACKUP_API_DATA_DIR'];
    }
    return __DIR__ . '/backup-data';
}

function backup_api_rate_dir(): string
{
    return backup_api_data_dir() . '/.rate-limit';
}

function backup_api_set_data_dir(string $dir): void
{
    $GLOBALS['BACKUP_API_DATA_DIR'] = $dir;
}

function backup_api_respond(int $status, array $payload): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function backup_api_respond_error(int $status, string $message): void
{
    backup_api_respond($status, ['ok' => false, 'error' => $message]);
}

function backup_api_ensure_data_dir(): void
{
    $dataDir = backup_api_data_dir();
    $rateDir = backup_api_rate_dir();
    if (!is_dir($dataDir) && !mkdir($dataDir, 0750, true)) {
        backup_api_respond_error(500, 'Storage unavailable.');
    }
    if (!is_dir($rateDir) && !mkdir($rateDir, 0750, true)) {
        backup_api_respond_error(500, 'Storage unavailable.');
    }
}

function backup_api_client_ip(): string
{
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', (string) $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }
    return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
}

function backup_api_client_ip_hash(): string
{
    $ip = preg_replace('/[^a-zA-Z0-9.:_-]/', '', backup_api_client_ip()) ?: 'unknown';
    return hash('sha256', $ip);
}

function backup_api_rate_limit_check(string $action, int $max, int $windowSeconds): void
{
    $file = backup_api_rate_dir() . '/' . hash('sha256', backup_api_client_ip_hash() . '|' . $action) . '.json';
    $now = time();
    $fp = fopen($file, 'c+');
    if ($fp === false) {
        backup_api_respond_error(500, 'Storage unavailable.');
    }

    try {
        if (!flock($fp, LOCK_EX)) {
            backup_api_respond_error(503, 'Server busy. Try again.');
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
            backup_api_respond_error(429, 'Too many requests. Try again later.');
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

function backup_api_count_backup_files(): int
{
    $files = glob(backup_api_data_dir() . '/*.json');
    return $files === false ? 0 : count($files);
}

function backup_api_count_stored_backups_for_ip(string $ipHash): int
{
    $count = 0;
    foreach (glob(backup_api_data_dir() . '/*.json') ?: [] as $path) {
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

function backup_api_reject_oversized_body(): void
{
    if (!isset($_SERVER['CONTENT_LENGTH'])) {
        return;
    }

    $contentLength = filter_var($_SERVER['CONTENT_LENGTH'], FILTER_VALIDATE_INT);
    if ($contentLength === false) {
        backup_api_respond_error(400, 'Invalid Content-Length header.');
    }
    if ($contentLength <= 0) {
        backup_api_respond_error(400, 'Empty request body.');
    }
    if ($contentLength > BACKUP_API_MAX_BYTES) {
        backup_api_respond_error(413, 'Backup too large (max ' . number_format(BACKUP_API_MAX_BYTES) . ' bytes).');
    }
}

function backup_api_purge_expired(): void
{
    $dataDir = backup_api_data_dir();
    if (!is_dir($dataDir)) {
        return;
    }
    $cutoff = time() - (BACKUP_API_RETENTION_DAYS * 86400);
    foreach (glob($dataDir . '/*.json') ?: [] as $path) {
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

function backup_api_validate_slug(string $slug): bool
{
    return (bool) preg_match(BACKUP_API_SLUG_PATTERN, $slug);
}

function backup_api_slug_file_path(string $slug): string
{
    return backup_api_data_dir() . '/' . $slug . '.json';
}

function backup_api_read_request_body_raw(): string
{
    $stream = fopen('php://input', 'rb');
    if ($stream === false) {
        backup_api_respond_error(400, 'Could not read request body.');
    }

    $raw = '';
    $read = 0;

    try {
        while (!feof($stream)) {
            $chunk = fread($stream, min(8192, BACKUP_API_MAX_BYTES - $read + 1));
            if ($chunk === false) {
                backup_api_respond_error(400, 'Could not read request body.');
            }
            if ($chunk === '') {
                break;
            }

            $read += strlen($chunk);
            if ($read > BACKUP_API_MAX_BYTES) {
                backup_api_respond_error(413, 'Backup too large (max ' . number_format(BACKUP_API_MAX_BYTES) . ' bytes).');
            }

            $raw .= $chunk;
        }
    } finally {
        fclose($stream);
    }

    return $raw;
}

function backup_api_read_json_body(): array
{
    $raw = backup_api_read_request_body_raw();
    if ($raw === '') {
        backup_api_respond_error(400, 'Empty request body.');
    }

    $decoded = json_decode($raw, true, 512);
    if (!is_array($decoded)) {
        backup_api_respond_error(400, 'Invalid JSON body.');
    }
    return $decoded;
}

/** PHP json_decode turns `{}` into `[]`; restore empty cards map for JSON output. */
function backup_api_normalize_envelope(array $backup): array
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

/** @return string|null First validation failure reason, or null if valid */
function backup_api_validate_envelope_detailed(mixed $backup): ?string
{
    if (!is_array($backup)) {
        return 'Backup is not a JSON object.';
    }
    if (($backup['format'] ?? '') !== BACKUP_API_FORMAT) {
        return 'Unrecognized backup format.';
    }
    if ((int) ($backup['version'] ?? 0) !== 1) {
        return 'Unsupported backup version.';
    }
    if (!isset($backup['exportedAt']) || !is_string($backup['exportedAt']) || $backup['exportedAt'] === '') {
        return 'Backup is missing export timestamp.';
    }
    if (!isset($backup['data']) || !is_array($backup['data'])) {
        return 'Backup is missing data.';
    }
    $data = $backup['data'];
    if (!isset($data['combat']) || !is_array($data['combat'])) {
        return 'Backup combat data is invalid.';
    }
    if (!isset($data['combat']['monsters']) || !is_array($data['combat']['monsters'])) {
        return 'Backup combat monsters must be an array.';
    }
    if (!isset($data['combat']['timers']) || !is_array($data['combat']['timers'])) {
        return 'Backup combat timers must be an array.';
    }
    if (!isset($data['boards']) || !is_array($data['boards'])) {
        return 'Backup boards data is invalid.';
    }
    if (!isset($data['boards']['boards']) || !is_array($data['boards']['boards'])) {
        return 'Backup boards list must be an array.';
    }
    if (!isset($data['boards']['cards'])) {
        return 'Backup boards cards map is missing.';
    }
    if (!is_array($data['boards']['cards'])) {
        return 'Backup boards cards must be an object map.';
    }
    if (!isset($data['settings']) || !is_array($data['settings'])) {
        return 'Backup settings data is invalid.';
    }
    if (!isset($data['settings']['appCards']) || !is_array($data['settings']['appCards'])) {
        return 'Backup settings appCards must be an array.';
    }
    return null;
}

function backup_api_validate_envelope(mixed $backup): bool
{
    return backup_api_validate_envelope_detailed($backup) === null;
}

function backup_api_invalid_payload_message(mixed $backup): string
{
    $reason = backup_api_validate_envelope_detailed($backup);
    if ($reason !== null) {
        return $reason;
    }
    return 'Invalid backup payload.';
}

function backup_api_atomic_write(string $path, string $contents): bool
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
function backup_api_word_list(): array
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

function backup_api_generate_slug(): string
{
    $words = backup_api_word_list();
    $count = count($words);
    $parts = [];
    for ($i = 0; $i < 4; $i++) {
        $parts[] = $words[random_int(0, $count - 1)];
    }
    return implode('-', $parts);
}

function backup_api_unique_slug(): string
{
    for ($attempt = 0; $attempt < 50; $attempt++) {
        $slug = backup_api_generate_slug();
        if (!is_file(backup_api_slug_file_path($slug))) {
            return $slug;
        }
    }
    backup_api_respond_error(500, 'Could not allocate backup code.');
}

function backup_api_handle_update(array $body): void
{
    backup_api_rate_limit_check('update', BACKUP_API_RATE_LIMIT_UPDATE_MAX, BACKUP_API_RATE_LIMIT_DAY);
    $slug = trim((string) ($body['slug'] ?? ''));
    $writeToken = (string) ($body['writeToken'] ?? '');
    if (!backup_api_validate_slug($slug)) {
        backup_api_respond_error(400, 'Invalid backup code.');
    }
    if ($writeToken === '' || strlen($writeToken) < 16) {
        backup_api_respond_error(400, 'Invalid edit key.');
    }
    if (!isset($body['backup'])) {
        backup_api_respond_error(400, 'Invalid backup payload.');
    }
    $payloadError = backup_api_validate_envelope_detailed($body['backup']);
    if ($payloadError !== null) {
        backup_api_respond_error(400, $payloadError);
    }

    $path = backup_api_slug_file_path($slug);
    if (!is_file($path)) {
        backup_api_respond_error(404, 'Backup not found.');
    }
    $raw = file_get_contents($path);
    $record = $raw ? json_decode($raw, true) : null;
    if (!is_array($record) || empty($record['writeTokenHash'])) {
        backup_api_respond_error(500, 'Backup file is corrupted.');
    }
    if (!password_verify($writeToken, (string) $record['writeTokenHash'])) {
        backup_api_respond_error(403, 'Edit key is incorrect.');
    }

    $record['updatedAt'] = gmdate('c');
    $record['backup'] = backup_api_normalize_envelope($body['backup']);
    $record['writeTokenHash'] = password_hash($writeToken, PASSWORD_DEFAULT);

    if (!backup_api_atomic_write($path, json_encode($record, JSON_UNESCAPED_SLASHES))) {
        backup_api_respond_error(500, 'Could not update backup.');
    }

    backup_api_respond(200, ['ok' => true]);
}

function backup_api_run(): void
{
    backup_api_ensure_data_dir();
    backup_api_purge_expired();

    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));

    if ($method === 'OPTIONS') {
        header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept');
        http_response_code(204);
        exit;
    }

    if ($method === 'GET' && isset($_GET['available'])) {
        backup_api_respond(200, [
            'ok' => true,
            'version' => BACKUP_API_VERSION,
            'retentionDays' => BACKUP_API_RETENTION_DAYS,
            'maxBytes' => BACKUP_API_MAX_BYTES,
        ]);
    }

    if ($method === 'GET' && isset($_GET['slug'])) {
        backup_api_rate_limit_check('read', BACKUP_API_RATE_LIMIT_READ_MAX, BACKUP_API_RATE_LIMIT_DAY);
        $slug = trim((string) $_GET['slug']);
        if (!backup_api_validate_slug($slug)) {
            backup_api_respond_error(400, 'Invalid backup code.');
        }
        $path = backup_api_slug_file_path($slug);
        if (!is_file($path)) {
            backup_api_respond_error(404, 'Backup not found.');
        }
        $raw = file_get_contents($path);
        $record = $raw ? json_decode($raw, true) : null;
        if (!is_array($record) || empty($record['backup']) || !is_array($record['backup'])) {
            backup_api_respond_error(500, 'Backup file is corrupted.');
        }
        backup_api_respond(200, ['ok' => true, 'backup' => backup_api_normalize_envelope($record['backup'])]);
    }

    if ($method === 'POST') {
        $contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
        if (strpos($contentType, 'application/json') === false) {
            backup_api_respond_error(415, 'Content-Type must be application/json.');
        }
        backup_api_reject_oversized_body();
        $body = backup_api_read_json_body();

        if (($body['action'] ?? '') === 'update') {
            backup_api_handle_update($body);
        }

        backup_api_rate_limit_check('create', BACKUP_API_RATE_LIMIT_CREATE_MAX, BACKUP_API_RATE_LIMIT_DAY);

        if (backup_api_count_backup_files() >= BACKUP_API_MAX_TOTAL_BACKUPS) {
            backup_api_respond_error(503, 'Server backup storage is full.');
        }

        $ipHash = backup_api_client_ip_hash();
        if (backup_api_count_stored_backups_for_ip($ipHash) >= BACKUP_API_MAX_STORED_BACKUPS_PER_IP) {
            backup_api_respond_error(429, 'You already have the maximum number of server backups. Delete old ones or update an existing backup.');
        }

        if (!isset($body['backup'])) {
            backup_api_respond_error(400, 'Invalid backup payload.');
        }
        $payloadError = backup_api_validate_envelope_detailed($body['backup']);
        if ($payloadError !== null) {
            backup_api_respond_error(400, $payloadError);
        }

        $slug = backup_api_unique_slug();
        $writeToken = bin2hex(random_bytes(32));
        $now = gmdate('c');
        $record = [
            'slug' => $slug,
            'createdAt' => $now,
            'updatedAt' => $now,
            'creatorIpHash' => $ipHash,
            'writeTokenHash' => password_hash($writeToken, PASSWORD_DEFAULT),
            'backup' => backup_api_normalize_envelope($body['backup']),
        ];

        if (!backup_api_atomic_write(backup_api_slug_file_path($slug), json_encode($record, JSON_UNESCAPED_SLASHES))) {
            backup_api_respond_error(500, 'Could not save backup.');
        }

        backup_api_respond(201, ['ok' => true, 'slug' => $slug, 'writeToken' => $writeToken]);
    }

    if ($method === 'PUT') {
        backup_api_rate_limit_check('update', BACKUP_API_RATE_LIMIT_UPDATE_MAX, BACKUP_API_RATE_LIMIT_DAY);
        $contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
        if (strpos($contentType, 'application/json') === false) {
            backup_api_respond_error(415, 'Content-Type must be application/json.');
        }
        backup_api_reject_oversized_body();
        $body = backup_api_read_json_body();
        backup_api_handle_update($body);
    }

    backup_api_respond_error(405, 'Method not allowed.');
}
