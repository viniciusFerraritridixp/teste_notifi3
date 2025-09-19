# Instruções para Gerar Ícones PWA

Para completar a configuração do PWA, você precisará gerar os seguintes ícones na pasta `public/icons/`:

## Tamanhos necessários:
- icon-70x70.png (para Windows)
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-150x150.png (para Windows)
- icon-152x152.png
- icon-192x192.png
- icon-310x310.png (para Windows)
- icon-384x384.png
- icon-512x512.png

## Como gerar:
1. Use o logo existente em `src/assets/logo.png` como base
2. Use ferramentas online como:
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator
   - https://app-manifest.firebaseapp.com/

3. Ou use ferramentas de linha de comando como ImageMagick:
   ```bash
   # Exemplo para redimensionar o logo
   magick convert logo.png -resize 192x192 icon-192x192.png
   ```

## Alternativa rápida:
Você pode temporariamente copiar o favicon.ico existente e renomeá-lo para os tamanhos necessários, ou usar um ícone simples até ter os ícones customizados prontos.

O importante é que todos os arquivos referenciados no manifest.json existam para que o PWA funcione corretamente.