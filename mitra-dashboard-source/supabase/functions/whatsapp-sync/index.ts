import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Usar SERVICE_ROLE_KEY para bypass RLS (necessário para auto-criação)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { whatsapp_number, type, amount, category, description, date } = await req.json()

    console.log('Recebido:', { whatsapp_number, type, amount, category })

    // Validar formato do whatsapp_number
    if (!whatsapp_number || !/^[0-9]{12,15}$/.test(whatsapp_number)) {
      return new Response(
        JSON.stringify({ 
          error: 'Formato de número WhatsApp inválido. Use apenas números com 12-15 dígitos (ex: 5519999999999)' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar tipo
    if (type !== 'entrada' && type !== 'saida') {
      return new Response(
        JSON.stringify({ error: 'Tipo deve ser "entrada" ou "saida"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Limpar e normalizar whatsapp_number
    let cleanWhatsApp = whatsapp_number.replace(/\D/g, '') // Remove tudo que não é número
    
    // Remove duplicação de código do país (ex: 555519... -> 5519...)
    if (cleanWhatsApp.startsWith('5555')) {
      cleanWhatsApp = cleanWhatsApp.substring(2)
    }
    
    // Garante máximo 13 dígitos (55 + 11 dígitos)
    cleanWhatsApp = cleanWhatsApp.substring(0, 13)
    
    console.log('📱 WhatsApp recebido:', whatsapp_number)
    console.log('📱 WhatsApp limpo:', cleanWhatsApp)
    console.log('🔍 Buscando profile com WhatsApp:', cleanWhatsApp)
    
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name, whatsapp_number')
      .eq('whatsapp_number', cleanWhatsApp)
      .maybeSingle()

    if (profileError) {
      console.error('Erro ao buscar profile:', profileError)
      throw profileError
    }

    // 2. Se não encontrou, retornar erro
    if (!profile) {
      console.log(`❌ Número WhatsApp não encontrado: ${cleanWhatsApp}`)
      return new Response(
        JSON.stringify({ 
          error: `Número WhatsApp ${cleanWhatsApp} não cadastrado. Por favor, cadastre-se primeiro no dashboard.`,
          whatsapp_number: cleanWhatsApp,
          registered: false
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ Usuário encontrado: ${profile.full_name} (ID: ${profile.id}, WhatsApp: ${profile.whatsapp_number})`)

    // 3. Inserir transação na tabela correta
    const table = type === 'entrada' ? 'entradas' : 'saidas'
    const transactionData = {
      user_id: profile.id,
      amount: parseFloat(amount),
      category: category || 'Sem categoria',
      description: description || null,
      date: date || new Date().toISOString()
    }
    
    console.log(`Inserindo em ${table}:`, transactionData)
    
    const { data: transaction, error: insertError } = await supabaseClient
      .from(table)
      .insert(transactionData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erro ao inserir transação:', insertError)
      throw insertError
    }

    console.log(`✅ Transação criada: ${type} R$ ${amount} para ${profile.full_name}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${type === 'entrada' ? 'Entrada' : 'Saída'} de R$ ${amount} registrada com sucesso!`,
        user: {
          id: profile.id,
          name: profile.full_name,
          email: profile.email
        },
        transaction
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erro:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
    const errorDetails = error instanceof Error ? error.toString() : String(error)
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
