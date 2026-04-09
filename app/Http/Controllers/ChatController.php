<?php
// app/Http/Controllers/ChatController.php
// ─────────────────────────────────────────────────────────────────────────────

namespace App\Http\Controllers;

use App\Services\FirestoreService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChatController extends Controller
{
    public function __construct(private FirestoreService $firestore) {}

    /** GET /api/chats — list all conversations */
    public function index(Request $request): JsonResponse
    {
        $chats = $this->firestore->getChats($request->firebase_uid);
        return response()->json(['chats' => $chats]);
    }

    /** POST /api/chats — create a new conversation */
    public function store(Request $request): JsonResponse
    {
        $request->validate(['title' => 'nullable|string|max:200']);

        $chat = $this->firestore->createChat(
            $request->firebase_uid,
            $request->input('title', 'New Chat')
        );

        return response()->json(['chat' => $chat], 201);
    }

    /** GET /api/chats/{chatId} — single chat metadata */
    public function show(Request $request, string $chatId): JsonResponse
    {
        $chat = $this->firestore->getChat($request->firebase_uid, $chatId);

        if (!$chat) {
            return response()->json(['error' => 'Chat not found.'], 404);
        }

        return response()->json(['chat' => $chat]);
    }

    /** DELETE /api/chats/{chatId} — delete conversation + messages */
    public function destroy(Request $request, string $chatId): JsonResponse
    {
        $uid  = $request->firebase_uid;
        $chat = $this->firestore->getChat($uid, $chatId);

        if (!$chat) {
            return response()->json(['error' => 'Chat not found.'], 404);
        }

        $this->firestore->deleteChat($uid, $chatId);

        return response()->json(['message' => 'Chat deleted.']);
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// app/Http/Controllers/FileController.php
// ─────────────────────────────────────────────────────────────────────────────

namespace App\Http\Controllers;

use App\Services\FirestoreService;
use App\Services\FileExtractionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Auth;

class FileController extends Controller
{
    public function __construct(
        private FirestoreService     $firestore,
        private FileExtractionService $extractor,
    ) {}

    /**
     * POST /api/files — upload a study file
     *
     * Accepts: multipart/form-data with 'file' field
     * Validates: max 10MB, allowed types: pdf, txt, md, docx, doc
     *
     * Process:
     *  1. Validate and store the original file
     *  2. Extract text content immediately
     *  3. Store extracted text as .txt in storage (for AI context later)
     *  4. Save metadata to Firestore
     *  5. Return file metadata to frontend
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240|mimes:pdf,txt,text,md,docx,doc',
        ]);

        $uid        = $request->firebase_uid;
        $uploadedFile = $request->file('file');

        // Extract text BEFORE moving the file (getRealPath() works on temp file)
        try {
            $extractedText = $this->extractor->extract($uploadedFile);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Could not extract text from this file. ' . $e->getMessage()
            ], 422);
        }

        // Save original file to storage
        $originalPath = $uploadedFile->store("study-files-original/{$uid}", 'local');

        // Save metadata to Firestore to get an ID
        $fileData = $this->firestore->saveFileMetadata($uid, [
            'originalName' => $uploadedFile->getClientOriginalName(),
            'mimeType'     => $uploadedFile->getMimeType(),
            'size'         => $uploadedFile->getSize(),
            'extension'    => strtolower($uploadedFile->getClientOriginalExtension()),
            'charCount'    => strlen($extractedText),
            'storagePath'  => $originalPath,
        ]);

        // Store extracted text using the Firestore ID as filename
        Storage::put("study-files/{$uid}/{$fileData['id']}.txt", $extractedText);

        return response()->json(['file' => $fileData], 201);
    }

    /** GET /api/files — list all uploaded files */
    public function index(Request $request): JsonResponse
    {
        $files = $this->firestore->getFiles($request->firebase_uid);
        return response()->json(['files' => $files]);
    }

    /** DELETE /api/files/{fileId} — delete file and its extracted text */
    public function destroy(Request $request, string $fileId): JsonResponse
    {
        $uid  = $request->firebase_uid;
        $file = $this->firestore->getFile($uid, $fileId);

        if (!$file) {
            return response()->json(['error' => 'File not found.'], 404);
        }

        // Delete from storage
        Storage::delete($file['storagePath'] ?? '');
        Storage::delete("study-files/{$uid}/{$fileId}.txt");

        // Delete from Firestore
        $this->firestore->deleteFile($uid, $fileId);

        return response()->json(['message' => 'File deleted.']);
    }

    /**
     * POST /api/files/{fileId}/attach/{chatId}
     * Adds a file to a chat session's context.
     * The AI will use this file's content when answering questions in this chat.
     */
    public function attachToChat(Request $request, string $fileId, string $chatId): JsonResponse
    {
        $uid  = $request->firebase_uid;
        $chat = $this->firestore->getChat($uid, $chatId);
        $file = $this->firestore->getFile($uid, $fileId);

        if (!$chat) return response()->json(['error' => 'Chat not found.'], 404);
        if (!$file) return response()->json(['error' => 'File not found.'], 404);

        $currentFileIds = $chat['fileIds'] ?? [];

        // Avoid duplicates
        if (!in_array($fileId, $currentFileIds)) {
            $currentFileIds[] = $fileId;
            $this->firestore->updateChatFiles($uid, $chatId, $currentFileIds);
        }

        return response()->json([
            'message' => 'File attached to chat.',
            'fileIds' => $currentFileIds,
        ]);
    }
}