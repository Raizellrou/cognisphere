<?php
// app/Http/Controllers/FileController.php
// ─────────────────────────────────────────────────────────────────────────────
// FIX: Uses Laravel's own database (MySQL/SQLite) instead of Firestore.
//      Zero dependency on google/cloud-firestore.
// ─────────────────────────────────────────────────────────────────────────────

namespace App\Http\Controllers;

use App\Services\FileExtractionService;
use App\Models\StudyFile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function __construct(private FileExtractionService $extractor) {}

    /**
     * POST /api/files
     * Upload a study file. Extracts text immediately and stores it.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240|mimes:pdf,txt,text,md,docx,doc',
        ]);

        $uid          = $request->firebase_uid;
        $uploadedFile = $request->file('file');

        // Extract text before moving the file
        try {
            $extractedText = $this->extractor->extract($uploadedFile);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Could not extract text: ' . $e->getMessage()
            ], 422);
        }

        // Store original file
        $originalPath = $uploadedFile->store("study-files-original/{$uid}", 'local');

        // Generate a unique ID
        $fileId = Str::uuid()->toString();

        // Save metadata to Laravel DB
        $file = StudyFile::create([
            'id'            => $fileId,
            'user_id'       => $uid,
            'original_name' => $uploadedFile->getClientOriginalName(),
            'mime_type'     => $uploadedFile->getMimeType(),
            'size'          => $uploadedFile->getSize(),
            'extension'     => strtolower($uploadedFile->getClientOriginalExtension()),
            'char_count'    => strlen($extractedText),
            'storage_path'  => $originalPath,
        ]);

        // Store extracted text with the file's ID as filename
        Storage::put("study-files/{$uid}/{$fileId}.txt", $extractedText);

        return response()->json(['file' => $file->toArray()], 201);
    }

    /**
     * GET /api/files
     * List all uploaded files for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $files = StudyFile::where('user_id', $request->firebase_uid)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['files' => $files]);
    }

    /**
     * DELETE /api/files/{fileId}
     * Delete a file and its extracted text.
     */
    public function destroy(Request $request, string $fileId): JsonResponse
    {
        $uid  = $request->firebase_uid;
        $file = StudyFile::where('id', $fileId)
            ->where('user_id', $uid)
            ->first();

        if (!$file) {
            return response()->json(['error' => 'File not found.'], 404);
        }

        // Delete from storage
        Storage::delete($file->storage_path);
        Storage::delete("study-files/{$uid}/{$fileId}.txt");

        // Delete from DB
        $file->delete();

        return response()->json(['message' => 'File deleted.']);
    }
}