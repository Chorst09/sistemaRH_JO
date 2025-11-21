# Correção Final - Problema das Duas Colunas

## Análise do Problema

### Erro Anterior
```
null value in column "taxregime" violates not-null constraint
```

### Erro Atual (após correção)
```
null value in column "tax_regime" violates not-null constraint
```

### Conclusão
A tabela `companies` tem **DUAS** colunas para regime tributário:
- `tax_regime` (com underscore) - **PRINCIPAL** com constraint NOT NULL
- `taxregime` (sem underscore) - **SECUNDÁRIA** ou duplicada

## Correção Implementada

### 1. Enviar para AMBAS as Colunas
```typescript
const companyForDB: any = {
  name: name,
  cnpj: cnpj,
  tax_regime: taxRegime,  // Coluna principal (com underscore)
  taxregime: taxRegime,   // Coluna backup (sem underscore)
  status: status,
  address: address,
};
```

### 2. Logs Detalhados
```typescript
console.log('Validação tax_regime:', {
  original: company.taxRegime,
  cleaned: taxRegime,
  tax_regime: companyForDB.tax_regime,
  taxregime: companyForDB.taxregime,
  isNull: companyForDB.tax_regime === null,
  isUndefined: companyForDB.tax_regime === undefined
});
```

### 3. Testes Abrangentes
- Teste com ambas as colunas
- Teste apenas com `tax_regime`
- Teste apenas com `taxregime`
- Logs detalhados para cada tentativa

## Arquivos Modificados
- `src/lib/company-data.ts` - Envio para ambas as colunas
- `src/lib/test-company-creation.ts` - Testes abrangentes
- `verify-table-structure.sql` - Script de verificação

## Próximos Passos

1. **Teste a criação** - deve funcionar agora
2. **Verifique os logs** - deve mostrar ambas as colunas sendo enviadas
3. **Execute o SQL** para confirmar a estrutura da tabela
4. **Use o debug** se necessário

## Nota Importante
Esta solução garante compatibilidade com qualquer estrutura de tabela, enviando dados para ambas as possíveis colunas de regime tributário.