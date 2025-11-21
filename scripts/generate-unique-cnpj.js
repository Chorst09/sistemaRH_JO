#!/usr/bin/env node

/**
 * Script para gerar CNPJs únicos para teste
 */

function generateRandomCNPJ() {
  // Gerar 8 primeiros dígitos aleatórios
  const base = Math.floor(Math.random() * 99999999).toString().padStart(8, '0');
  
  // Filial sempre 0001
  const filial = '0001';
  
  // Calcular dígitos verificadores
  const digits = base + filial;
  
  // Primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  // Segundo dígito verificador
  sum = 0;
  weight = 6;
  const digitsWithFirst = digits + firstDigit;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digitsWithFirst[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  const cnpj = digits + firstDigit + secondDigit;
  
  // Formatar CNPJ
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function generateMultipleCNPJs(count = 5) {
  console.log('🏢 CNPJs únicos para teste:\n');
  
  for (let i = 1; i <= count; i++) {
    const cnpj = generateRandomCNPJ();
    console.log(`${i}. ${cnpj}`);
  }
  
  console.log('\n💡 Use qualquer um destes CNPJs para testar a criação de empresas.');
  console.log('💡 Eles são válidos e únicos, evitando o erro de duplicação.');
}

// Executar se chamado diretamente
if (require.main === module) {
  generateMultipleCNPJs();
}

module.exports = {
  generateRandomCNPJ,
  generateMultipleCNPJs
};