#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Limpando arquivos indesejados antes do build...');

// Pasta que deve ser removida se existir
const empresasPath = path.join(__dirname, 'src', 'app', '(app)', 'empresas');

if (fs.existsSync(empresasPath)) {
  console.log('❌ Encontrada pasta empresas - removendo...');
  fs.rmSync(empresasPath, { recursive: true, force: true });
  console.log('✅ Pasta empresas removida');
} else {
  console.log('✅ Pasta empresas não encontrada (correto)');
}

// Verificar se a pasta companies existe
const companiesPath = path.join(__dirname, 'src', 'app', '(app)', 'companies');
if (fs.existsSync(companiesPath)) {
  console.log('✅ Pasta companies encontrada (correto)');
} else {
  console.log('❌ ERRO: Pasta companies não encontrada!');
  process.exit(1);
}

console.log('🎉 Limpeza concluída - prosseguindo com o build...');