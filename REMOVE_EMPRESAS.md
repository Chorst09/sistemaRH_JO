# REMOÇÃO FORÇADA DA PASTA EMPRESAS

Este arquivo força a remoção de qualquer referência à pasta `empresas` que possa existir no repositório.

## Problema
O Vercel está tentando buildar um arquivo que não deveria existir:
`./src/app/(app)/empresas/[id]/page.tsx`

## Solução
1. Este commit remove explicitamente qualquer arquivo relacionado a `empresas`
2. Força o Vercel a fazer rebuild completo
3. Garante que apenas a pasta `companies` seja usada

## Estrutura Correta
- ✅ `src/app/(app)/companies/` (correto)
- ❌ `src/app/(app)/empresas/` (deve ser removido)

## Arquivos que devem existir
- `src/app/(app)/companies/page.tsx`
- `src/app/(app)/companies/[id]/page.tsx`
- `src/app/(app)/companies/new/page.tsx`