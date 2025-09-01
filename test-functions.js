import { apiService } from '../src/services/api.js'

// Script de testing para Firebase Functions
async function testFunctions() {
  console.log('🧪 Iniciando testing de Firebase Functions...\n')

  try {
    // Test 1: Crear sala
    console.log('1️⃣ Testing createRoom...')
    const roomData = {
      title: 'Sala de Prueba',
      description: 'Testing automático de Firebase Functions',
      maxParticipants: 10,
      timeLimit: 15,
      adminEmail: 'test@example.com'
    }
    
    const createResult = await apiService.createRoom(roomData)
    console.log('✅ Sala creada:', createResult)
    const roomId = createResult.roomId
    const roomCode = createResult.code
    
    // Test 2: Unirse a sala
    console.log('\n2️⃣ Testing joinRoom...')
    const joinData = {
      roomCode: roomCode,
      participantName: 'Participante Test'
    }
    
    const joinResult = await apiService.joinRoom(joinData)
    console.log('✅ Unido a sala:', joinResult)
    const participantId = joinResult.participantId
    
    // Test 3: Enviar palabra
    console.log('\n3️⃣ Testing submitWord...')
    const wordData = {
      roomId: roomId,
      participantId: participantId,
      word: 'Innovación'
    }
    
    const wordResult = await apiService.submitWord(wordData)
    console.log('✅ Palabra enviada:', wordResult)
    
    // Test 4: Enviar otra palabra del mismo participante (debería fallar)
    console.log('\n4️⃣ Testing duplicate word submission...')
    try {
      await apiService.submitWord({
        roomId: roomId,
        participantId: participantId,
        word: 'Duplicada'
      })
      console.log('❌ ERROR: Debería haber fallado')
    } catch (error) {
      console.log('✅ Correctamente bloqueado:', error.message)
    }
    
    console.log('\n🎉 ¡Todos los tests pasaron exitosamente!')
    console.log(`📋 Resumen:`)
    console.log(`   - Sala ID: ${roomId}`)
    console.log(`   - Código de sala: ${roomCode}`)
    console.log(`   - Participante ID: ${participantId}`)
    
  } catch (error) {
    console.error('❌ Error en testing:', error)
  }
}

// Ejecutar tests si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testFunctions()
}

export { testFunctions }
