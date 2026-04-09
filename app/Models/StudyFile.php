<?php
// app/Models/StudyFile.php
// ─────────────────────────────────────────────────────────────────────────────
// Eloquent model for uploaded study files.
// Stores metadata in Laravel's own database — no Firestore needed.
// ─────────────────────────────────────────────────────────────────────────────

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudyFile extends Model
{
    // We use UUID strings as primary keys (set during upload)
    protected $primaryKey = 'id';
    public    $incrementing = false;
    protected $keyType     = 'string';

    protected $fillable = [
        'id',
        'user_id',        // Firebase UID
        'original_name',
        'mime_type',
        'size',
        'extension',
        'char_count',
        'storage_path',
    ];

    protected $casts = [
        'size'       => 'integer',
        'char_count' => 'integer',
    ];
}