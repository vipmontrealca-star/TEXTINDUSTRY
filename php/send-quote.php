<?php
/**
 * Textindustry quote-request handler.
 * Receives the contact.html form (multipart/form-data, incl. attachments)
 * via fetch() and emails it to quotes@textindustry.com using PHPMailer.
 *
 * Requires: PHP mail()/sendmail configured on the host (standard on
 * HostGator cPanel shared hosting). No SMTP credentials needed for the
 * default transport — see README section "Form backend" for the SMTP
 * fallback if deliverability via mail() proves unreliable.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

// CORS: the fr./ar. subdomains serve their own static HTML but share this
// single PHP backend on the main domain (avoids tripling the mail backend
// across three deploy targets) — their contact form submits here cross-origin.
// Allow-list specific origins rather than a wildcard since this handles
// file uploads.
const ALLOWED_ORIGINS = [
    'https://textindustry.com',
    'https://www.textindustry.com',
    'https://fr.textindustry.com',
    'https://ar.textindustry.com',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

require __DIR__ . '/vendor/PHPMailer/src/Exception.php';
require __DIR__ . '/vendor/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/vendor/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

const RECIPIENT_EMAIL = 'quotes@textindustry.com';
const RECIPIENT_NAME = 'Textindustry';
const SENDER_EMAIL = 'quotes@textindustry.com'; // must be a real mailbox on the sending domain
const SENDER_NAME = 'Textindustry Website';

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB per file, matches client-side cap
const MAX_TOTAL_BYTES = 25 * 1024 * 1024; // total across all attachments
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'png', 'jpg', 'jpeg'];
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
];

function respond(bool $ok, string $message, int $status = 200): void
{
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed.', 405);
}

// Honeypot: a hidden field real users never fill in. Bots that
// autofill every field will trip this and get a fake success response.
if (!empty($_POST['website'])) {
    respond(true, 'Thanks — your request has been sent.');
}

function field(string $key): string
{
    return isset($_POST[$key]) ? trim((string) $_POST[$key]) : '';
}

$name = field('name');
$company = field('company');
$email = field('email');
$phone = field('phone');
$sourceLanguage = field('source_language');
$targetLanguage = field('target_language');
$service = field('service');
$message = field('message');

if ($name === '' || $email === '' || $sourceLanguage === '' || $targetLanguage === '') {
    respond(false, 'Please fill in all required fields.', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please provide a valid email address.', 422);
}

// --- Attachments ---------------------------------------------------------
$attachments = [];
$totalBytes = 0;

if (!empty($_FILES['attachments']) && is_array($_FILES['attachments']['name'])) {
    $fileCount = count($_FILES['attachments']['name']);
    $finfo = finfo_open(FILEINFO_MIME_TYPE);

    for ($i = 0; $i < $fileCount; $i++) {
        $error = $_FILES['attachments']['error'][$i];
        if ($error === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        if ($error !== UPLOAD_ERR_OK) {
            respond(false, 'One of the attachments failed to upload. Please try again.', 422);
        }

        $originalName = $_FILES['attachments']['name'][$i];
        $tmpPath = $_FILES['attachments']['tmp_name'][$i];
        $size = (int) $_FILES['attachments']['size'][$i];

        $extension = strtolower((string) pathinfo($originalName, PATHINFO_EXTENSION));
        $mimeType = finfo_file($finfo, $tmpPath) ?: '';

        if (!in_array($extension, ALLOWED_EXTENSIONS, true) || !in_array($mimeType, ALLOWED_MIME_TYPES, true)) {
            finfo_close($finfo);
            respond(false, 'Only PDF, DOCX, PNG and JPG files are accepted.', 422);
        }

        if ($size > MAX_FILE_BYTES) {
            finfo_close($finfo);
            respond(false, 'Each attachment must be 10MB or smaller.', 422);
        }

        $totalBytes += $size;
        if ($totalBytes > MAX_TOTAL_BYTES) {
            finfo_close($finfo);
            respond(false, 'Total attachment size is too large (25MB max).', 422);
        }

        $attachments[] = ['tmp' => $tmpPath, 'name' => $originalName];
    }

    finfo_close($finfo);
}

// --- Build + send email ---------------------------------------------------
$mail = new PHPMailer(true);

try {
    $mail->isMail();
    $mail->CharSet = 'UTF-8';

    $mail->setFrom(SENDER_EMAIL, SENDER_NAME);
    $mail->addAddress(RECIPIENT_EMAIL, RECIPIENT_NAME);
    $mail->addReplyTo($email, $name);

    $mail->Subject = sprintf('New quote request — %s (%s → %s)', $name, strtoupper($sourceLanguage), strtoupper($targetLanguage));

    $lines = [
        "Name: {$name}",
        "Company: " . ($company !== '' ? $company : '—'),
        "Email: {$email}",
        "Phone: " . ($phone !== '' ? $phone : '—'),
        "Source language: {$sourceLanguage}",
        "Target language: {$targetLanguage}",
        "Service: " . ($service !== '' ? $service : '—'),
        '',
        'Project details:',
        ($message !== '' ? $message : '—'),
        '',
        'Attachments: ' . (count($attachments) > 0 ? count($attachments) . ' file(s)' : 'none'),
    ];
    $mail->Body = implode("\n", $lines);

    foreach ($attachments as $file) {
        $mail->addAttachment($file['tmp'], $file['name']);
    }

    $mail->send();
    respond(true, 'Thanks — your request has been sent to quotes@textindustry.com.');
} catch (PHPMailerException $e) {
    error_log('Textindustry quote form mail error: ' . $mail->ErrorInfo);
    respond(false, 'Sorry, something went wrong sending your request. Please email quotes@textindustry.com directly.', 500);
}
