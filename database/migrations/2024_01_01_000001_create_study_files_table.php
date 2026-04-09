<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_files', function (Blueprint $table) {
            $table->string('id')->primary();        // UUID
            $table->string('user_id')->index();     // Firebase UID
            $table->string('original_name');
            $table->string('mime_type');
            $table->bigInteger('size');
            $table->string('extension', 10);
            $table->integer('char_count')->default(0);
            $table->string('storage_path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_files');
    }
};
