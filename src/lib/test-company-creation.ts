import { createClient } from './supabase-client';

export async function testCompanyCreation() {
  const supabase = createClient();
  
  console.log('🧪 Testando criação de empresa...');
  
  // Teste com AMBAS as colunas
  const testCompany = {
    name: 'Empresa Teste LTDA',
    cnpj: '12.345.678/0001-99',
    tax_regime: 'Simples Nacional',  // Com underscore
    taxregime: 'Simples Nacional',   // Sem underscore
    status: 'Ativa',
    address: 'Rua Teste, 123'
  };
  
  console.log('Teste com ambas as colunas:', testCompany);
  
  try {
    const { data, error } = await (supabase as any)
      .from('companies')
      .insert([testCompany])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro no teste com ambas as colunas:', error);
      
      // Teste apenas com tax_regime
      const testCompany2 = {
        name: 'Empresa Teste LTDA 2',
        cnpj: '12.345.678/0001-98',
        tax_regime: 'Simples Nacional',
        status: 'Ativa',
        address: 'Rua Teste, 123'
      };
      
      console.log('Teste apenas com tax_regime:', testCompany2);
      
      const { data: data2, error: error2 } = await (supabase as any)
        .from('companies')
        .insert([testCompany2])
        .select()
        .single();
      
      if (error2) {
        console.error('❌ Erro no teste apenas com tax_regime:', error2);
        
        // Teste apenas com taxregime
        const testCompany3 = {
          name: 'Empresa Teste LTDA 3',
          cnpj: '12.345.678/0001-97',
          taxregime: 'Simples Nacional',
          status: 'Ativa',
          address: 'Rua Teste, 123'
        };
        
        console.log('Teste apenas com taxregime:', testCompany3);
        
        const { data: data3, error: error3 } = await (supabase as any)
          .from('companies')
          .insert([testCompany3])
          .select()
          .single();
        
        if (error3) {
          console.error('❌ Todos os testes falharam:', error3);
          return false;
        }
        
        console.log('✅ Empresa criada com sucesso (apenas taxregime):', data3);
        await supabase.from('companies').delete().eq('id', data3.id);
        return true;
      }
      
      console.log('✅ Empresa criada com sucesso (apenas tax_regime):', data2);
      await supabase.from('companies').delete().eq('id', data2.id);
      return true;
    }
    
    console.log('✅ Empresa criada com sucesso (ambas as colunas):', data);
    await supabase.from('companies').delete().eq('id', data.id);
    return true;
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return false;
  }
}

export async function checkTableStructure() {
  const supabase = createClient();
  
  console.log('🔍 Verificando estrutura da tabela...');
  
  try {
    // Tentar fazer uma query simples para verificar se a tabela existe
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao acessar tabela:', error);
      return false;
    }
    
    console.log('✅ Tabela acessível. Exemplo de registro:', data[0] || 'Nenhum registro encontrado');
    return true;
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    return false;
  }
}