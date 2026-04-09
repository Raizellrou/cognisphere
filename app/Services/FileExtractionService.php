<?php
// app/Services/FileExtractionService.php
// ─────────────────────────────────────────────────────────────────────────────
// Extracts raw text from uploaded files so it can be injected into the AI prompt.
//
// Supported formats:
//  - .txt, .md  → read directly
//  - .pdf       → extract via smalot/pdfparser (composer require smalot/pdfparser)
//  - .docx      → extract via phpoffice/phpword  (composer require phpoffice/phpword)
//
// The extracted text is stored alongside the file metadata in Firestore.
// This way, the extraction only runs ONCE (at upload time), not on every message.
// ─────────────────────────────────────────────────────────────────────────────

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Smalot\PdfParser\Parser as PdfParser;

class FileExtractionService
{
    // Maximum characters to extract per file (prevents token overflow in Gemini)
    // Gemini 1.5 Flash supports ~1M tokens, but we cap at ~50k chars per file
    private const MAX_CHARS_PER_FILE = 50000;

    /**
     * Extract text content from an uploaded file.
     *
     * @param  UploadedFile $file
     * @return string  Extracted text (may be truncated)
     */
    public function extract(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $path      = $file->getRealPath();

        try {
            $text = match ($extension) {
                'txt', 'md', 'text' => $this->extractFromText($path),
                'pdf'               => $this->extractFromPdf($path),
                'docx'              => $this->extractFromDocx($path),
                'doc'               => $this->extractFromDocx($path),
                default             => throw new \InvalidArgumentException(
                    "Unsupported file type: .{$extension}"
                ),
            };

            // Normalize whitespace
            $text = preg_replace('/\s+/', ' ', $text);
            $text = trim($text);

            // Truncate if over limit
            if (strlen($text) > self::MAX_CHARS_PER_FILE) {
                $text = substr($text, 0, self::MAX_CHARS_PER_FILE);
                $text .= "\n\n[Document truncated at " . self::MAX_CHARS_PER_FILE . " characters]";
            }

            return $text;

        } catch (\Exception $e) {
            Log::error('File extraction failed', [
                'file'      => $file->getClientOriginalName(),
                'extension' => $extension,
                'error'     => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    // ── Extractors ───────────────────────────────────────────────────────────

    private function extractFromText(string $path): string
    {
        $content = file_get_contents($path);
        if ($content === false) {
            throw new \RuntimeException('Could not read text file.');
        }
        return $content;
    }

    private function extractFromPdf(string $path): string
    {
        // Requires: composer require smalot/pdfparser
        $parser   = new PdfParser();
        $pdf      = $parser->parseFile($path);
        $text     = $pdf->getText();

        if (empty(trim($text))) {
            throw new \RuntimeException(
                'Could not extract text from this PDF. It may be a scanned image PDF. ' .
                'Please use a text-based PDF or copy-paste the content as a .txt file.'
            );
        }

        return $text;
    }

    private function extractFromDocx(string $path): string
    {
        // Requires: composer require phpoffice/phpword
        $phpWord   = \PhpOffice\PhpWord\IOFactory::load($path);
        $text      = '';

        foreach ($phpWord->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                if (method_exists($element, 'getText')) {
                    $text .= $element->getText() . "\n";
                } elseif (method_exists($element, 'getElements')) {
                    foreach ($element->getElements() as $childElement) {
                        if (method_exists($childElement, 'getText')) {
                            $text .= $childElement->getText() . ' ';
                        }
                    }
                    $text .= "\n";
                }
            }
        }

        return $text;
    }

    /**
     * Build the combined file context string to inject into the AI prompt.
     * When multiple files are attached, they are clearly labeled.
     *
     * @param  array $files  [['filename' => '...', 'content' => '...']]
     * @return string
     */
    public function buildContext(array $files): string
    {
        if (empty($files)) return '';

        if (count($files) === 1) {
            return "FILE: {$files[0]['filename']}\n\n{$files[0]['content']}";
        }

        $context = '';
        foreach ($files as $i => $file) {
            $num      = $i + 1;
            $context .= "═══ FILE {$num}: {$file['filename']} ═══\n\n";
            $context .= $file['content'];
            $context .= "\n\n";
        }

        return trim($context);
    }
}