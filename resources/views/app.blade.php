<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#000000" />
    <title>Cognisphere</title>
    <link rel="manifest" href="/manifest.json" />
    
    <!-- Critical script to prevent theme flicker -->
    <script>
      (function() {
        const saved = localStorage.getItem('theme') || 'dark';
        const next = saved === 'dark' ? 'dark' : 'light';
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(next);
      })();
    </script>
    
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
</head>
<body class="bg-white dark:bg-black">
    <div id="app"></div>
</body>
</html>