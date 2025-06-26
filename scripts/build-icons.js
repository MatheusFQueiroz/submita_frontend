const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputIcon = path.join(__dirname, "../public/icon-source.png");
const outputDir = path.join(__dirname, "../public/icons");

// Criar diretório de saída se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log("🎨 Gerando ícones PWA...");

  for (const size of sizes) {
    try {
      await sharp(inputIcon)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));

      console.log(`✅ Ícone ${size}x${size} gerado`);
    } catch (error) {
      console.error(`❌ Erro ao gerar ícone ${size}x${size}:`, error.message);
    }
  }

  console.log("🎉 Todos os ícones foram gerados!");
}

// Verificar se o arquivo fonte existe
if (!fs.existsSync(inputIcon)) {
  console.error("❌ Arquivo icon-source.png não encontrado em /public/");
  console.log(
    "📝 Por favor, adicione um arquivo icon-source.png (512x512) em /public/"
  );
  process.exit(1);
}

generateIcons();
