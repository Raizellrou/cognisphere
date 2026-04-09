<?php

return [
    'mailgun' => [
        'secret' => env('MAILGUN_SECRET'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key'    => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'stripe' => [
        'public' => env('STRIPE_PUBLIC_KEY'),
        'secret' => env('STRIPE_SECRET_KEY'),
    ],

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model'   => env('GEMINI_MODEL', 'gemini-1.5-flash'),
    ],

    'firebase' => [
        'credentials' => env('FIREBASE_CREDENTIALS', 'storage/app/firebase-service-account.json'),
        'project_id'  => env('FIREBASE_PROJECT_ID'),
    ],
];
