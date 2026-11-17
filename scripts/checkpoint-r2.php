<?php
// Runs inside the existing Coolify container. Never prints storage credentials.
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$prefix = 'audit-checkpoints/jj-memorial-staging/';
try {
    $input = json_decode(stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
    $storage = App\Models\S3Storage::all()->filter(fn ($s) => $s->bucket === 'jj-memorial-staging-backups')->sole();
    $fs = $storage->filesystem();
    if ($input['mode'] === 'latest') {
        $keys = $fs->allFiles($prefix);
        sort($keys, SORT_STRING);
        if (!$keys) {
            echo json_encode(['key' => null, 'checkpoint' => null], JSON_THROW_ON_ERROR);
        } else {
            $key = end($keys);
            echo json_encode(['key' => $key, 'checkpoint' => json_decode($fs->get($key), true, 512, JSON_THROW_ON_ERROR)], JSON_THROW_ON_ERROR);
        }
    } elseif ($input['mode'] === 'put') {
        $key = $prefix . gmdate('Ymd\THis\Z') . '-' . bin2hex(random_bytes(12)) . '.json';
        $body = json_encode($input['checkpoint'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
        if ($fs->exists($key) || !$fs->put($key, $body) || !hash_equals($body, $fs->get($key))) {
            throw new RuntimeException('write_readback_failed');
        }
        echo json_encode(['key' => $key], JSON_THROW_ON_ERROR);
    } else {
        throw new RuntimeException('invalid_mode');
    }
} catch (Throwable $e) {
    // Provider exceptions can contain request details. Keep logs free of secrets.
    fwrite(STDERR, "R2 checkpoint operation failed\n");
    exit(1);
}
