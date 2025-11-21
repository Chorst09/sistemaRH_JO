# Correção do Nome da Coluna

## Problema Identificado
O erro mostrava que estávamos enviando `tax_regime` (com underscore) mas a coluna no banco se chama `taxregime` (sem underscore).

```
null value in column "taxregime" of relation "companies" violates not-null constraint
```

## Evidência
- **Dados enviados**: `{tax_regime: 'Simples Nacional'}`
- **Erro do banco**: `null value in column "taxregime"`
- **Conclusão**: A coluna se chama `taxregime`, não `tax_regime`

## Correções Implementadas

### 1. Função `createCompany`
```typescript
// ANTES
const companyForDB: CompanyInsert = {
  tax_regime: taxRegime, // ❌ Nome incorreto
}

// DEPOIS  
const companyForDB: any = {
  taxregime: taxRegime, // ✅ Nome correto
}
```

### 2. Função `dbToCompany`
```typescript
// ANTES
taxRegime: dbCompany.tax_regime,

// DEPOIS
taxRegime: dbCompany.taxregime || dbCompany.tax_regime, // Suporta ambos
```

### 3. Função `updateCompany`
```typescript
// ANTES
...(company.taxRegime && { tax_regime: company.taxRegime }),

// DEPOIS
...(company.taxRegime && { taxregime: company.taxRegime }),
```

### 4. Testes Atualizados
- Teste com `tax_regime` (com underscore)
- Teste com `taxregime` (sem underscore)
- Logs detalhados para identificar qual funciona

## Arquivos Modificados
- `src/lib/company-data.ts` - Correção dos nomes das colunas
- `src/lib/test-company-creation.ts` - Testes com ambos os nomes
- `check-column-names.sql` - Script para verificar estrutura

## Próximos Passos
1. **Teste a criação de empresa** - deve funcionar agora
2. **Verifique os logs** - deve mostrar `taxregime` em vez de `tax_regime`
3. **Execute o SQL** se necessário para confirmar a estrutura da tabela

## Nota Importante
Os tipos TypeScript em `src/types/supabase.ts` podem estar desatualizados. A estrutura real da tabela usa `taxregime` sem underscore.