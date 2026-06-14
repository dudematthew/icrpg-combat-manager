<?php
/**
 * Integration tests for backup-api (run: php tests/backup-api/run.php)
 */

declare(strict_types=1);

require_once __DIR__ . '/../../public/backup-api-lib.php';

$root = dirname(__DIR__, 2);
$fixturePath = $root . '/tests/fixtures/icrpg-backup-2026-06-13.json';

$passed = 0;
$failed = 0;

function assert_true(bool $cond, string $message): void
{
    global $passed, $failed;
    if ($cond) {
        $passed++;
        echo "  OK: {$message}\n";
        return;
    }
    $failed++;
    echo "  FAIL: {$message}\n";
}

function http_request(string $method, string $url, ?string $body = null): array
{
    $headers = ['Accept: application/json'];
    if ($body !== null) {
        $headers[] = 'Content-Type: application/json';
    }
    $opts = [
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers),
            'ignore_errors' => true,
            'timeout' => 10,
        ],
    ];
    if ($body !== null) {
        $opts['http']['content'] = $body;
    }
    $responseBody = @file_get_contents($url, false, stream_context_create($opts));
    $status = 0;
    if (isset($http_response_header[0]) && preg_match('/\d{3}/', $http_response_header[0], $m)) {
        $status = (int) $m[0];
    }
    return ['status' => $status, 'body' => $responseBody === false ? '' : $responseBody];
}

echo "Backup API integration tests\n\n";

echo "Validation:\n";
$fixtureRaw = file_get_contents($fixturePath);
assert_true($fixtureRaw !== false, 'fixture file readable');
$fixture = json_decode($fixtureRaw, true);
assert_true(is_array($fixture), 'fixture parses as JSON');
assert_true(backup_api_validate_envelope($fixture), 'fixture passes PHP validation');
assert_true(backup_api_validate_envelope_detailed(['format' => 'wrong']) !== null, 'rejects wrong format');

echo "\nHTTP:\n";
$dataDir = sys_get_temp_dir() . '/icrpg-backup-test-' . bin2hex(random_bytes(6));
mkdir($dataDir, 0750, true);

$router = sys_get_temp_dir() . '/icrpg-backup-router-' . bin2hex(random_bytes(4)) . '.php';
$routerContent = '<?php declare(strict_types=1); require_once ' . var_export($root . '/public/backup-api-lib.php', true)
    . '; backup_api_set_data_dir(' . var_export($dataDir, true)
    . '); header(\'X-Content-Type-Options: nosniff\'); header(\'Cache-Control: no-store\'); backup_api_run();';
file_put_contents($router, $routerContent);

$socket = stream_socket_server('tcp://127.0.0.1:0', $errno, $errstr);
if ($socket === false) {
    echo "  ERROR: Could not bind port: {$errstr}\n";
    exit(1);
}
$addr = stream_socket_get_name($socket, false);
$port = (int) substr((string) $addr, strrpos((string) $addr, ':') + 1);
fclose($socket);

$descriptors = [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']];
$proc = proc_open(
    sprintf('php -S 127.0.0.1:%d %s', $port, escapeshellarg($router)),
    $descriptors,
    $pipes,
    $root
);

if (!is_resource($proc)) {
    echo "  ERROR: Could not start PHP server\n";
    exit(1);
}
fclose($pipes[0]);
usleep(300_000);

$base = 'http://127.0.0.1:' . $port . '/' . basename($router);

try {
    $get = http_request('GET', $base . '?available');
    assert_true($get['status'] === 200, 'GET ?available returns 200');
    $avail = json_decode($get['body'], true);
    assert_true(is_array($avail) && ($avail['ok'] ?? false) === true, 'GET ?available ok:true');

    $createBody = json_encode(['backup' => $fixture], JSON_UNESCAPED_SLASHES);
    $create = http_request('POST', $base, $createBody);
    assert_true($create['status'] === 201, 'POST create returns 201 (got ' . $create['status'] . ': ' . $create['body'] . ')');
    $created = json_decode($create['body'], true);
    assert_true(
        is_array($created) && !empty($created['slug']) && !empty($created['writeToken']),
        'POST create returns slug and writeToken'
    );
    $slug = (string) $created['slug'];
    $token = (string) $created['writeToken'];

    $read = http_request('GET', $base . '?slug=' . urlencode($slug));
    assert_true($read['status'] === 200, 'GET ?slug returns 200');

    $updateBody = json_encode([
        'action' => 'update',
        'slug' => $slug,
        'writeToken' => $token,
        'backup' => $fixture,
    ], JSON_UNESCAPED_SLASHES);
    $update = http_request('POST', $base, $updateBody);
    assert_true($update['status'] === 200, 'POST action:update returns 200 (got ' . $update['status'] . ': ' . $update['body'] . ')');

    $badUpdateBody = json_encode([
        'action' => 'update',
        'slug' => $slug,
        'writeToken' => str_repeat('x', 32),
        'backup' => $fixture,
    ], JSON_UNESCAPED_SLASHES);
    $badUpdate = http_request('POST', $base, $badUpdateBody);
    assert_true($badUpdate['status'] === 403, 'POST action:update with bad token returns 403');

    $badPayload = http_request('POST', $base, json_encode(['backup' => ['format' => 'wrong']]));
    assert_true($badPayload['status'] === 400, 'POST invalid backup returns 400');
} finally {
    proc_terminate($proc);
    proc_close($proc);
    if (is_resource($pipes[1])) {
        fclose($pipes[1]);
    }
    if (is_resource($pipes[2])) {
        fclose($pipes[2]);
    }
    @unlink($router);
    foreach (glob($dataDir . '/*') ?: [] as $f) {
        @unlink($f);
    }
    foreach (glob($dataDir . '/.rate-limit/*') ?: [] as $f) {
        @unlink($f);
    }
    @rmdir($dataDir . '/.rate-limit');
    @rmdir($dataDir);
}

echo "\n{$passed} passed, {$failed} failed\n";
exit($failed > 0 ? 1 : 0);
