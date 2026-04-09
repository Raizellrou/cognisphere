<?php
// app/Services/FirestoreService.php
// ─────────────────────────────────────────────────────────────────────────────
// Server-side Firestore operations via kreait/firebase-php.
//
// WHY both Firestore AND real-time from frontend:
//  - Backend writes messages to Firestore after getting Gemini's response
//  - Frontend listens to Firestore in real-time via onSnapshot
//  - This means the UI updates the moment the backend writes — no polling needed
//
// Firestore structure:
//   users/{uid}/chats/{chatId}
//     - title: string
//     - createdAt: timestamp
//     - updatedAt: timestamp
//     - fileIds: string[]   ← IDs of attached study files
//
//   users/{uid}/chats/{chatId}/messages/{messageId}
//     - role: "user" | "ai"
//     - content: string
//     - timestamp: timestamp
//     - isError: boolean (optional)
// ─────────────────────────────────────────────────────────────────────────────

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Firestore;
use Google\Cloud\Firestore\FieldValue;

class FirestoreService
{
    private $firestore;

    public function __construct()
    {
        $factory         = (new Factory)->withServiceAccount(
            base_path(config('services.firebase.credentials'))
        );
        $this->firestore = $factory->createFirestore()->database();
    }

    // ── Chats ─────────────────────────────────────────────────────────────────

    public function createChat(string $uid, string $title = 'New Chat'): array
    {
        $chatRef = $this->firestore
            ->collection("users/{$uid}/chats")
            ->newDocument();

        $data = [
            'title'     => $title,
            'fileIds'   => [],
            'createdAt' => FieldValue::serverTimestamp(),
            'updatedAt' => FieldValue::serverTimestamp(),
        ];

        $chatRef->set($data);

        return ['id' => $chatRef->id(), ...$data];
    }

    public function getChats(string $uid): array
    {
        $snapshot = $this->firestore
            ->collection("users/{$uid}/chats")
            ->orderBy('updatedAt', 'DESC')
            ->limit(50)
            ->documents();

        $chats = [];
        foreach ($snapshot as $doc) {
            if ($doc->exists()) {
                $chats[] = ['id' => $doc->id(), ...$doc->data()];
            }
        }
        return $chats;
    }

    public function getChat(string $uid, string $chatId): ?array
    {
        $doc = $this->firestore
            ->document("users/{$uid}/chats/{$chatId}")
            ->snapshot();

        return $doc->exists() ? ['id' => $doc->id(), ...$doc->data()] : null;
    }

    public function updateChatTitle(string $uid, string $chatId, string $title): void
    {
        $this->firestore
            ->document("users/{$uid}/chats/{$chatId}")
            ->update([
                ['path' => 'title',     'value' => $title],
                ['path' => 'updatedAt', 'value' => FieldValue::serverTimestamp()],
            ]);
    }

    public function updateChatFiles(string $uid, string $chatId, array $fileIds): void
    {
        $this->firestore
            ->document("users/{$uid}/chats/{$chatId}")
            ->update([
                ['path' => 'fileIds',   'value' => $fileIds],
                ['path' => 'updatedAt', 'value' => FieldValue::serverTimestamp()],
            ]);
    }

    public function deleteChat(string $uid, string $chatId): void
    {
        // Delete all messages first (Firestore doesn't cascade-delete)
        $messages = $this->firestore
            ->collection("users/{$uid}/chats/{$chatId}/messages")
            ->documents();

        $batch = $this->firestore->batch();
        foreach ($messages as $msg) {
            $batch->delete($msg->reference());
        }
        $batch->delete($this->firestore->document("users/{$uid}/chats/{$chatId}"));
        $batch->commit();
    }

    // ── Messages ──────────────────────────────────────────────────────────────

    /**
     * Saves a message to Firestore.
     * The frontend's onSnapshot listener picks this up instantly.
     *
     * @param  string $role  'user' | 'ai'
     */
    public function addMessage(
        string $uid,
        string $chatId,
        string $role,
        string $content,
        bool   $isError = false
    ): array {
        $msgRef = $this->firestore
            ->collection("users/{$uid}/chats/{$chatId}/messages")
            ->newDocument();

        $data = [
            'role'      => $role,
            'content'   => $content,
            'isError'   => $isError,
            'timestamp' => FieldValue::serverTimestamp(),
        ];

        $msgRef->set($data);

        // Update chat's updatedAt so it bubbles to top of list
        $this->firestore
            ->document("users/{$uid}/chats/{$chatId}")
            ->update([['path' => 'updatedAt', 'value' => FieldValue::serverTimestamp()]]);

        return ['id' => $msgRef->id(), ...$data];
    }

    /**
     * Returns recent messages for building conversation history sent to Gemini.
     * We only send the last 20 messages to keep token usage reasonable.
     */
    public function getRecentMessages(string $uid, string $chatId, int $limit = 20): array
    {
        $snapshot = $this->firestore
            ->collection("users/{$uid}/chats/{$chatId}/messages")
            ->orderBy('timestamp', 'ASC')
            ->limitToLast($limit)
            ->documents();

        $messages = [];
        foreach ($snapshot as $doc) {
            if ($doc->exists()) {
                $messages[] = ['id' => $doc->id(), ...$doc->data()];
            }
        }
        return $messages;
    }

    // ── Study Files ───────────────────────────────────────────────────────────

    public function saveFileMetadata(string $uid, array $data): array
    {
        $fileRef = $this->firestore
            ->collection("users/{$uid}/studyFiles")
            ->newDocument();

        $fileData = [
            ...$data,
            'createdAt' => FieldValue::serverTimestamp(),
        ];

        $fileRef->set($fileData);
        return ['id' => $fileRef->id(), ...$fileData];
    }

    public function getFile(string $uid, string $fileId): ?array
    {
        $doc = $this->firestore
            ->document("users/{$uid}/studyFiles/{$fileId}")
            ->snapshot();

        return $doc->exists() ? ['id' => $doc->id(), ...$doc->data()] : null;
    }

    public function getFiles(string $uid): array
    {
        $snapshot = $this->firestore
            ->collection("users/{$uid}/studyFiles")
            ->orderBy('createdAt', 'DESC')
            ->documents();

        $files = [];
        foreach ($snapshot as $doc) {
            if ($doc->exists()) {
                $files[] = ['id' => $doc->id(), ...$doc->data()];
            }
        }
        return $files;
    }

    public function deleteFile(string $uid, string $fileId): void
    {
        $this->firestore
            ->document("users/{$uid}/studyFiles/{$fileId}")
            ->delete();
    }
}